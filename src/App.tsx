import { useEffect, useCallback } from 'react';
import type { NarrativeState } from './types';
import { NARRATIVE_STATES } from './types';
import { useNarrativeState } from './hooks/useNarrativeState';
import { useCountdown } from './hooks/useCountdown';
import { TopBar } from './components/TopBar';
import { CancunTopology } from './components/CancunTopology';
import { StatusPanel } from './components/StatusPanel';
import { EventFeed } from './components/EventFeed';
import { CountdownDisplay } from './components/CountdownDisplay';
import { DomainStrip } from './components/DomainStrip';
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
    document.body.classList.add('dev-mode');
  }, [resetNarrative, resetTimer]);

  const handleContainmentComplete = useCallback(() => {
    stop();
  }, [stop]);

  // Keyboard shortcuts
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

  // Accent-based background tinting
  const bgTint = config.accentColor === 'red'
    ? 'radial-gradient(ellipse at center, #c0392b08 0%, transparent 70%)'
    : config.accentColor === 'amber'
      ? 'radial-gradient(ellipse at center, #d4913a06 0%, transparent 70%)'
      : 'none';

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-vertice-bg relative"
      style={{ backgroundImage: bgTint }}>
      {/* Top bar */}
      <TopBar
        headline={config.headline}
        subheadline={config.subheadline}
        accentColor={config.accentColor}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left panel */}
        <div className="w-[260px] flex-shrink-0 p-4 flex flex-col gap-4 border-r border-vertice-border/40">
          <StatusPanel severity={config.severity} sync={config.sync} />
          {showCountdown && (
            <div className="rounded-lg border border-vertice-border bg-vertice-panel p-4 flex items-center justify-center">
              <CountdownDisplay display={display} running={running} visible={showCountdown} />
            </div>
          )}
        </div>

        {/* Center - Topology */}
        <div className="flex-1 p-4 relative">
          <CancunTopology domains={config.domains} accentColor={config.accentColor} />
        </div>

        {/* Right panel - Events */}
        <div className="w-[300px] flex-shrink-0 p-4 border-l border-vertice-border/40">
          <EventFeed events={allEvents} />
        </div>
      </div>

      {/* Bottom strip - Domain summary */}
      <div className="h-[72px] flex-shrink-0 px-4 py-2 border-t border-vertice-border/40">
        <DomainStrip domains={config.domains} />
      </div>

      {/* Containment overlay */}
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
