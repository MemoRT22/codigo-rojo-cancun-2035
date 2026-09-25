import { useEffect, useCallback } from 'react';
import type { NarrativeState } from './types';
import { NARRATIVE_STATES } from './types';
import { useNarrativeState } from './hooks/useNarrativeState';
import { useCountdown } from './hooks/useCountdown';
import { CancunTopology } from './components/CancunTopology';
import { SystemOverlay } from './components/SystemOverlay';
import { EventFeed } from './components/EventFeed';
import { ContainmentSequence } from './components/ContainmentSequence';
import { DevPanel } from './components/DevPanel';

export default function App() {
  const { state, config, allEvents, setNarrativeState, reset: resetNarrative, injectEvent } = useNarrativeState();
  const { display, running, start, toggle, resetTimer, stop } = useCountdown();

  const showCountdown = state !== 'OPERACION_NORMAL';
  const isContainment = state === 'CONTENCION_EXITOSA' || state === 'CONTENCION_INCOMPLETA';

  const handleStateChange = useCallback((next: NarrativeState) => {
    setNarrativeState(next);
    if (next === 'ANOMALIA_DETECTADA') {
      resetTimer();
      setTimeout(start, 300);
    }
    if (next === 'CONTENCION_EXITOSA' || next === 'CONTENCION_INCOMPLETA') {
      stop();
    }
    if (next === 'OPERACION_NORMAL') {
      resetTimer();
    }
  }, [setNarrativeState, resetTimer, start, stop]);

  const handleReset = useCallback(() => {
    resetNarrative();
    resetTimer();
  }, [resetNarrative, resetTimer]);

  const handleContainmentComplete = useCallback(() => {
    stop();
  }, [stop]);

  useEffect(() => {
    document.body.classList.add('dev-mode');

    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 7) {
        const targetState = NARRATIVE_STATES[keyNum - 1];
        if (targetState) handleStateChange(targetState);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          handleReset();
          break;
        case 'f':
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen().catch(() => {});
          break;
        case ' ':
          e.preventDefault();
          toggle();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleStateChange, handleReset, toggle]);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-[#060a10]">
      {/* Atmospheric background tint */}
      <div
        className="absolute inset-0 transition-opacity duration-[2000ms]"
        style={{
          background: config.accentColor === 'red'
            ? 'radial-gradient(ellipse at 40% 45%, rgba(192,57,43,0.06) 0%, transparent 60%)'
            : config.accentColor === 'amber'
              ? 'radial-gradient(ellipse at 40% 45%, rgba(212,145,58,0.04) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 40% 45%, rgba(42,138,138,0.03) 0%, transparent 60%)',
        }}
      />

      {/* Territory visualization -- full bleed */}
      <CancunTopology
        domains={config.domains}
        accentColor={config.accentColor}
        narrativeState={state}
      />

      {/* Domain labels on territory */}
      <TerritoryLabels domains={config.domains} />

      {/* Floating system information */}
      <SystemOverlay
        headline={config.headline}
        subheadline={config.subheadline}
        severity={config.severity}
        sync={config.sync}
        accentColor={config.accentColor}
        baseTime={config.baseTime}
        countdownDisplay={display}
        countdownRunning={running}
        countdownVisible={showCountdown}
        domains={config.domains}
      />

      {/* Event telemetry */}
      <EventFeed events={allEvents} />

      {/* Containment sequence overlay */}
      {isContainment && (
        <ContainmentSequence
          narrativeState={state}
          onSequenceComplete={handleContainmentComplete}
        />
      )}

      {/* Dev panel */}
      <DevPanel
        currentState={state}
        timerRunning={running}
        timerDisplay={display}
        onStateChange={handleStateChange}
        onReset={handleReset}
        onTimerToggle={toggle}
        onTimerReset={resetTimer}
        onInjectEvent={injectEvent}
      />
    </div>
  );
}

// Domain labels positioned at their geographic locations on the territory
const LABEL_POSITIONS: Record<string, { x: string; y: string }> = {
  identidad:       { x: '20%', y: '24%' },
  infraestructura: { x: '21%', y: '49%' },
  movilidad:       { x: '33%', y: '20%' },
  turismo:         { x: '68%', y: '30%' },
  sensores:        { x: '13%', y: '41%' },
  inteligencia:    { x: '30%', y: '36%' },
};

const STATUS_LABEL_COLORS: Record<string, string> = {
  OPERATIVO:          'rgba(255,255,255,0.12)',
  ESTABLE:            'rgba(39,174,96,0.5)',
  ADVERTENCIA:        'rgba(212,145,58,0.5)',
  ALERTA:             'rgba(230,126,34,0.55)',
  'CRÍTICO':          'rgba(192,57,43,0.6)',
  AISLANDO:           'rgba(212,145,58,0.5)',
  AISLADO:            'rgba(80,95,110,0.4)',
  REVOCANDO:          'rgba(212,145,58,0.5)',
  REVOCADA:           'rgba(80,95,110,0.4)',
  'FUERA DE SERVICIO':'rgba(192,57,43,0.5)',
  CONTENIDO:          'rgba(39,174,96,0.5)',
};

function TerritoryLabels({ domains }: { domains: import('./types').DomainState[] }) {
  return (
    <>
      {domains.map((d) => {
        const pos = LABEL_POSITIONS[d.id];
        if (!pos) return null;
        const isOp = d.status === 'OPERATIVO';
        const statusColor = STATUS_LABEL_COLORS[d.status] ?? 'rgba(255,255,255,0.12)';

        return (
          <div
            key={d.id}
            className="absolute z-10 pointer-events-none"
            style={{ left: pos.x, top: pos.y }}
          >
            <div
              className="text-[14px] tracking-[0.08em] transition-colors duration-700"
              style={{ color: isOp ? 'rgba(255,255,255,0.18)' : statusColor }}
            >
              {d.label}
            </div>
            {!isOp && (
              <div
                className="text-[11px] font-mono tracking-wider mt-0.5"
                style={{ color: statusColor }}
              >
                {d.status}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
