import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE_STATES, type NarrativeState } from './types';
import { ThemeProvider, useTheme } from './brand/ThemeContext';
import { Basemap } from './map/Basemap';
import { DomainLayers } from './map/DomainLayers';
import { FlowCanvas, type LiveWorld } from './map/FlowCanvas';
import { W, H } from './map/scene';
import { useWorld } from './world/useWorld';
import { useCountdown } from './hooks/useCountdown';
import { Header } from './ui/Header';
import { StateBanner } from './ui/StateBanner';
import { ZoneCards } from './ui/ZoneCards';
import { Dock } from './ui/Dock';
import { Feed } from './ui/Feed';
import { DevPanel } from './components/DevPanel';

function Stage() {
  const { theme: T, toggle: toggleTheme } = useTheme();
  const world = useWorld();
  const { display, running, start, toggle, resetTimer, stop } = useCountdown();
  const [scale, setScale] = useState(1);
  const [devOpen, setDevOpen] = useState(false);

  const d = world.derived;
  const live = useRef<LiveWorld>({ status: d.status, flags: d.flags, flashNodes: d.flashNodes, latencyMs: world.latency.value });
  live.current = { status: d.status, flags: d.flags, flashNodes: d.flashNodes, latencyMs: world.latency.value };

  const changeState = useCallback((next: NarrativeState) => {
    world.setState(next);
    if (next === 'ANOMALIA_DETECTADA') { resetTimer(); setTimeout(start, 300); }
    if (next === 'CONTENCION_EXITOSA' || next === 'CONTENCION_INCOMPLETA') stop();
    if (next === 'OPERACION_NORMAL') resetTimer();
  }, [world, resetTimer, start, stop]);

  const reset = useCallback(() => { world.reset(); resetTimer(); }, [world, resetTimer]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    document.body.classList.add('dev-mode');
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 7) { changeState(NARRATIVE_STATES[n - 1]!); return; }
      switch (e.key.toLowerCase()) {
        case 'r': reset(); break;
        case 'd': setDevOpen((v) => !v); break;
        case 'm': toggleTheme(); break;
        case 'f': if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => {}); break;
        case ' ': e.preventDefault(); toggle(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeState, reset, toggle, toggleTheme]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: T.SURFACE.page, transition: 'background 0.6s ease' }}>
      <div className="stage-frame" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <Basemap />
        <DomainLayers status={d.status} flags={d.flags} zones={d.zones} version={d.version} />
        <FlowCanvas live={live} pixelRatio={Math.min(2, (window.devicePixelRatio || 1) * scale)} theme={T} />
        <ZoneCards zones={d.zones} />
        <Header w={world} />
        <StateBanner w={world} />
        <Feed events={world.feed} />
        <Dock w={world} countdown={world.spec.showCountdown ? display : null} countdownRunning={running} />
      </div>
      <DevPanel
        visible={devOpen}
        onClose={() => setDevOpen(false)}
        state={world.state}
        clock={world.clock}
        speed={world.speed}
        timerRunning={running}
        timerDisplay={display}
        onStateChange={changeState}
        onReset={reset}
        onSpeed={world.setSpeed}
        onTimerToggle={toggle}
        onInjectEvent={world.inject}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Stage />
    </ThemeProvider>
  );
}
