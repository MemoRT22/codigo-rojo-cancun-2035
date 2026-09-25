import { useEffect, useCallback } from 'react';
import type { NarrativeState } from './types';
import { NARRATIVE_STATES } from './types';
import { useNarrativeState } from './hooks/useNarrativeState';
import { useCountdown } from './hooks/useCountdown';
import { useTelemetry } from './hooks/useTelemetry';
import { DigitalTwinMap } from './map/DigitalTwinMap';
import { OperationsHUD } from './components/central/OperationsHUD';
import { DevPanel } from './components/DevPanel';
import { CORP } from './brand/tokens';

export default function App() {
  const { state, config, allEvents, setNarrativeState, reset: resetNarrative, injectEvent } = useNarrativeState();
  const { display, running, start, toggle, resetTimer, stop } = useCountdown();
  const telemetry = useTelemetry(state, config.baseTime);

  const showCountdown = state !== 'OPERACION_NORMAL';
  const isEscalating = state !== 'OPERACION_NORMAL';

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
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: CORP.bgBase }}>
      {/* Territory container with subtle perspective tilt — only the map is tilted */}
      <div
        className="absolute inset-0"
        style={{
          perspective: '2400px',
          perspectiveOrigin: '50% 40%',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(6deg)',
            transformOrigin: '50% 55%',
          }}
        >
          <DigitalTwinMap
            domains={config.domains}
            isEscalating={isEscalating}
            telemetry={telemetry}
          />
        </div>
      </div>

      {/* HUD overlays — perfectly flat, outside perspective container */}
      <OperationsHUD
        headline={config.headline}
        subheadline={config.subheadline}
        severity={config.severity}
        sync={config.sync}
        baseTime={config.baseTime}
        domains={config.domains}
        events={allEvents}
        countdownDisplay={display}
        countdownRunning={running}
        countdownVisible={showCountdown}
        telemetry={telemetry}
        isEscalating={isEscalating}
      />

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
