import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { MissionEngine } from './engine';
import type { MissionEvent, MissionState, EvidenceId, ResponsePlan, TerminalId } from './types';
import type { WorldView } from '../world/useWorld';

export interface MissionControls {
  mission: Readonly<MissionState>;
  startMission: () => void;
  pauseMission: () => void;
  resumeMission: () => void;
  resetMission: () => void;
  discoverEvidence: (id: EvidenceId, source: TerminalId) => void;
  submitCorrelation: (origin: string, identity: string, propagation: string, correlation: string) => boolean;
  selectPlan: (plan: ResponsePlan) => void;
  confirmPlan: () => void;
  dispatch: (event: MissionEvent) => void;
}

/**
 * Conecta el MissionEngine (puro) con React y con el mundo simulado.
 *
 * - Evalúa reglas de línea de tiempo en cada tick del reloj.
 * - Coordina el countdown (inicia con anomalía, detiene con desenlace).
 * - Pausa / reanuda el reloj del mundo cuando la misión se pausa.
 */
export function useMission(
  world: WorldView,
  countdown: { seconds: number; start: () => void; stop: () => void; resetTimer: () => void },
): MissionControls {
  const engineRef = useRef<MissionEngine | null>(null);
  if (!engineRef.current) engineRef.current = new MissionEngine();
  const engine = engineRef.current;

  // ── Suscripción al estado de misión ──
  const mission = useSyncExternalStore(
    (cb) => engine.subscribe(cb),
    () => engine.getState(),
  );

  // ── Evaluación de línea de tiempo en cada tick ──
  const prevClockRef = useRef(world.clock);
  useEffect(() => {
    if (prevClockRef.current === world.clock) return;
    prevClockRef.current = world.clock;
    const next = engine.tick(world.state, world.clock);
    if (next) world.setState(next);
  });

  // ── Reaccionar a cambios de estado narrativo ──
  const prevNarrativeRef = useRef(world.state);
  useEffect(() => {
    const prev = prevNarrativeRef.current;
    prevNarrativeRef.current = world.state;
    if (prev === world.state) return;
    if (world.state === 'ANOMALIA_DETECTADA') {
      countdown.resetTimer();
      setTimeout(countdown.start, 300);
    }
    if (world.state === 'CONTENCION_EXITOSA' || world.state === 'CONTENCION_INCOMPLETA') {
      countdown.stop();
    }
    if (world.state === 'OPERACION_NORMAL') {
      countdown.resetTimer();
    }
  });

  // ── Timeout del countdown ──
  useEffect(() => {
    if (countdown.seconds === 0 && mission.status === 'running' && !mission.timedOut) {
      engine.dispatch({ type: 'MISSION_TIMEOUT' });
    }
  }, [countdown.seconds, mission.status, mission.timedOut, engine]);

  // ── Acciones ──

  const startMission = useCallback(() => {
    world.reset();
    countdown.resetTimer();
    engine.dispatch({ type: 'MISSION_START' });
    world.setPaused(false);
  }, [world, countdown, engine]);

  const pauseMission = useCallback(() => {
    engine.dispatch({ type: 'MISSION_PAUSE' });
    world.setPaused(true);
    countdown.stop();
  }, [engine, world, countdown]);

  const resumeMission = useCallback(() => {
    engine.dispatch({ type: 'MISSION_RESUME' });
    world.setPaused(false);
  }, [engine, world]);

  const resetMission = useCallback(() => {
    engine.dispatch({ type: 'MISSION_RESET' });
    world.reset();
    countdown.resetTimer();
    world.setPaused(false);
  }, [engine, world, countdown]);

  const discoverEvidence = useCallback((id: EvidenceId, source: TerminalId) => {
    engine.dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: id, source });
  }, [engine]);

  const submitCorrelation = useCallback((origin: string, identity: string, propagation: string, correlation: string): boolean => {
    const before = engine.getState();
    engine.dispatch({ type: 'FINAL_CORRELATION_SUBMITTED', origin, identity, propagation, correlation });
    const after = engine.getState();
    if (after.finalCorrelationValidated && !before.finalCorrelationValidated) {
      world.setState('RESPUESTA_AUTORIZADA');
      return true;
    }
    return false;
  }, [engine, world]);

  const selectPlan = useCallback((plan: ResponsePlan) => {
    engine.dispatch({ type: 'PLAN_SELECTED', plan });
  }, [engine]);

  const confirmPlan = useCallback(() => {
    engine.dispatch({ type: 'PLAN_CONFIRMED' });
    const ms = engine.getState();
    if (ms.outcome === 'contained') world.setState('CONTENCION_EXITOSA');
    else if (ms.outcome === 'incomplete') world.setState('CONTENCION_INCOMPLETA');
  }, [engine, world]);

  const dispatch = useCallback((event: MissionEvent) => {
    engine.dispatch(event);
  }, [engine]);

  return {
    mission,
    startMission,
    pauseMission,
    resumeMission,
    resetMission,
    discoverEvidence,
    submitCorrelation,
    selectPlan,
    confirmPlan,
    dispatch,
  };
}
