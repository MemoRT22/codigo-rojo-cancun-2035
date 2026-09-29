import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { NarrativeState, SystemEvent } from './types';
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
import { FacilitatorAlert, type AlertData } from './facilitator/FacilitatorAlert';
import { FacilitatorConsole } from './facilitator/FacilitatorConsole';
import { useFacilitatorWindow } from './facilitator/FacilitatorWindow';
import { ResponseStage } from './ui/ResponseStage';

function Stage() {
  const { theme: T, toggle: toggleTheme } = useTheme();
  const world = useWorld();
  const countdown = useCountdown();
  const mc = useMission(world, countdown);
  const [scale, setScale] = useState(1);
  const facilitator = useFacilitatorWindow();
  const [alert, setAlert] = useState<AlertData | null>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alertId = useRef(0);

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

  const clearAlert = useCallback(() => {
    if (alertTimer.current) { clearTimeout(alertTimer.current); alertTimer.current = null; }
    setAlert(null);
  }, []);

  // Alerta del facilitador: aparece sobre VÉRTICE y deja registro en el Feed. Es presentación/operación del host (no MissionState).
  const { inject } = world;
  const showAlert = useCallback((level: SystemEvent['level'], message: string, durationMs: number | null) => {
    if (alertTimer.current) clearTimeout(alertTimer.current);
    setAlert({ id: ++alertId.current, level, message });
    inject(message, level);
    alertTimer.current = durationMs ? setTimeout(() => { alertTimer.current = null; setAlert(null); }, durationMs) : null;
  }, [inject]);
  useEffect(() => clearAlert, [clearAlert]);

  const reset = useCallback(() => {
    clearAlert();
    mc.resetMission();
  }, [mc, clearAlert]);

  const fullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen();
      return true;
    } catch { return false; }
  }, []);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Atajos de la superficie principal: solo D (consola de facilitación), M (tema) y F (pantalla completa).
  // Reiniciar, cambiar de estado o mover el reloj se hace desde la consola, no con una tecla accidental.
  const { openOrFocus } = facilitator;
  useEffect(() => {
    document.body.classList.add('host-mode');
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case 'd': openOrFocus(); break;
        case 'm': toggleTheme(); break;
        case 'f': void fullscreen(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openOrFocus, toggleTheme, fullscreen]);

  // Aviso pequeño si el navegador bloqueó la ventana de la consola.
  const { blocked, clearBlocked } = facilitator;
  useEffect(() => {
    if (!blocked) return;
    const t = setTimeout(clearBlocked, 9000);
    return () => clearTimeout(t);
  }, [blocked, clearBlocked]);

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
        <ResponseStage mc={mc} countdown={world.spec.showCountdown ? countdown.display : null} />
        <FacilitatorAlert alert={alert} />
        {facilitator.blocked && (
          <div className="absolute" style={{ right: 40, bottom: 130, zIndex: 80, padding: '12px 18px', borderRadius: 10, background: T.SURFACE.card, border: `1px solid ${T.STATUS.warn}88`, fontSize: 16, color: T.INK.primary, boxShadow: `0 8px 24px ${T.SURFACE.shadow}` }}>
            No se pudo abrir la consola. Permite ventanas emergentes para este sitio.
          </div>
        )}
      </div>
      {facilitator.container && createPortal(
        <FacilitatorConsole
          world={world}
          mc={mc}
          countdown={countdown}
          onScenario={manualOverride}
          onReset={reset}
          onAlert={showAlert}
          onClearAlert={clearAlert}
          alertActive={!!alert}
          onFullscreen={fullscreen}
        />,
        facilitator.container,
      )}
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
