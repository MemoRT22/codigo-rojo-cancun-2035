import { useCallback, useEffect, useRef, useState } from 'react';
import { NARRATIVE_STATES, type NarrativeState } from './types';
import { ThemeProvider, useTheme } from './brand/ThemeContext';
import { Basemap } from './map/Basemap';
import { DomainLayers } from './map/DomainLayers';
import { FlowCanvas, type LiveWorld } from './map/FlowCanvas';
import { W, H } from './map/scene';
import { useWorld } from './world/useWorld';
import { hms } from './world/scenario';
import { useCountdown } from './hooks/useCountdown';
import { useMission } from './mission/useMission';
import { Header } from './ui/Header';
import { StateBanner } from './ui/StateBanner';
import { ZoneCards } from './ui/ZoneCards';
import { Dock } from './ui/Dock';
import { Feed } from './ui/Feed';
import { DevPanel } from './components/DevPanel';
import { ResponseStage } from './ui/ResponseStage';

function Stage() {
  const { theme: T, toggle: toggleTheme } = useTheme();
  const world = useWorld();
  const countdown = useCountdown();
  const mc = useMission(world, countdown);
  const [scale, setScale] = useState(1);
  const [devOpen, setDevOpen] = useState(false);
  // La consola de respuesta (pantalla LED) está a la vista: se desactivan los atajos de facilitación que un toque accidental podría disparar.
  const responseStageRef = useRef(false);
  const onResponseStage = useCallback((v: boolean) => { responseStageRef.current = v; }, []);

  // Apertura: en espera, el centro de operaciones está preparado; al iniciar, unos segundos de monitoreo activo antes de la anomalía.
  const opening = world.state === 'OPERACION_NORMAL' ? mc.mission.status : null;
  const openingSubheadline =
    opening === 'idle' ? 'Centro de operaciones VÉRTICE · Célula de respuesta en espera'
    : opening === 'running' ? (world.clock >= hms('09:16:01') ? 'Variación detectada · Verificando identidad' : 'Monitoreo activo')
    : undefined;

  const d = world.derived;
  const live = useRef<LiveWorld>({ status: d.status, flags: d.flags, flashNodes: d.flashNodes, latencyMs: world.latency.value });
  live.current = { status: d.status, flags: d.flags, flashNodes: d.flashNodes, latencyMs: world.latency.value };

  const manualOverride = useCallback((next: NarrativeState) => {
    mc.dispatch({ type: 'MANUAL_OVERRIDE', narrativeState: next });
    world.setState(next);
  }, [mc, world]);

  const reset = useCallback(() => {
    mc.resetMission();
  }, [mc]);

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
      if (responseStageRef.current && ((n >= 1 && n <= 7) || e.key.toLowerCase() === 'r' || e.key === ' ')) return;
      if (n >= 1 && n <= 7) { manualOverride(NARRATIVE_STATES[n - 1]!); return; }
      switch (e.key.toLowerCase()) {
        case 'r': reset(); break;
        case 'd': setDevOpen((v) => !v); break;
        case 'm': toggleTheme(); break;
        case 'f': if (document.fullscreenElement) void document.exitFullscreen(); else void document.documentElement.requestFullscreen().catch(() => {}); break;
        case ' ': e.preventDefault(); countdown.toggle(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [manualOverride, reset, countdown, toggleTheme]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: T.SURFACE.page, transition: 'background 0.6s ease' }}>
      <div className="stage-frame" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <Basemap />
        <DomainLayers status={d.status} flags={d.flags} zones={d.zones} version={d.version} />
        <FlowCanvas live={live} pixelRatio={Math.min(2, (window.devicePixelRatio || 1) * scale)} theme={T} />
        <ZoneCards zones={d.zones} />
        <Header w={world} />
        <StateBanner w={world} subheadline={openingSubheadline} />
        <Feed events={world.feed} />
        <Dock w={world} countdown={world.spec.showCountdown ? countdown.display : null} countdownRunning={countdown.running} />
        <ResponseStage mc={mc} countdown={world.spec.showCountdown ? countdown.display : null} onVisibleChange={onResponseStage} />
      </div>
      <DevPanel
        visible={devOpen}
        onClose={() => setDevOpen(false)}
        world={world}
        mc={mc}
        countdown={countdown}
        onManualOverride={manualOverride}
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
