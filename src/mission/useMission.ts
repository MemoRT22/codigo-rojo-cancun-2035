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
  countdown: { seconds: number; running: boolean; start: () => void; stop: () => void; resetTimer: () => void },
): MissionControls {
  const engineRef = useRef<MissionEngine | null>(null);
  if (!engineRef.current) engineRef.current = new MissionEngine();
  const engine = engineRef.current;

  // Track whether countdown was running before pause, so resume restores it.
  const countdownWasRunning = useRef(false);
  // Cancel the anomaly-start timeout to prevent race conditions.
  const anomalyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAnomalyTimer = useCallback(() => {
    if (anomalyTimerRef.current !== null) {
      clearTimeout(anomalyTimerRef.current);
      anomalyTimerRef.current = null;
    }
  }, []);

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
      clearAnomalyTimer();
      anomalyTimerRef.current = setTimeout(() => {
        anomalyTimerRef.current = null;
        countdown.start();
      }, 300);
    }
    if (world.state === 'RESPUESTA_AUTORIZADA') {
      engine.dispatch({ type: 'RESPONSE_UNLOCKED' });
    }
    if (world.state === 'CONTENCION_EXITOSA' || world.state === 'CONTENCION_INCOMPLETA') {
      clearAnomalyTimer();
      countdown.stop();
    }
    if (world.state === 'OPERACION_NORMAL') {
      clearAnomalyTimer();
      countdown.resetTimer();
    }
  });

  // ── Timeout del countdown ──
  useEffect(() => {
    if (countdown.seconds === 0 && mission.status === 'running' && !mission.timedOut) {
      engine.dispatch({ type: 'MISSION_TIMEOUT' });
    }
  }, [countdown.seconds, mission.status, mission.timedOut, engine]);

  // Clean up anomaly timer on unmount.
  useEffect(() => clearAnomalyTimer, [clearAnomalyTimer]);

  // ── Acciones ──

  const startMission = useCallback(() => {
    clearAnomalyTimer();
    world.reset();
    countdown.resetTimer();
    engine.dispatch({ type: 'MISSION_START' });
    world.setPaused(false);
  }, [world, countdown, engine, clearAnomalyTimer]);

  const pauseMission = useCallback(() => {
    countdownWasRunning.current = countdown.running;
    clearAnomalyTimer();
    engine.dispatch({ type: 'MISSION_PAUSE' });
    world.setPaused(true);
    countdown.stop();
  }, [engine, world, countdown, clearAnomalyTimer]);

  const resumeMission = useCallback(() => {
    const ms = engine.getState();
    if (ms.status !== 'paused') return;
    engine.dispatch({ type: 'MISSION_RESUME' });
    world.setPaused(false);
    if (countdownWasRunning.current && countdown.seconds > 0) {
      countdown.start();
    }
    countdownWasRunning.current = false;
  }, [engine, world, countdown]);

  const resetMission = useCallback(() => {
    clearAnomalyTimer();
    engine.dispatch({ type: 'MISSION_RESET' });
    world.reset();
    countdown.resetTimer();
    world.setPaused(false);
  }, [engine, world, countdown, clearAnomalyTimer]);

  const discoverEvidence = useCallback((id: EvidenceId, source: TerminalId) => {
    engine.dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: id, source });
  }, [engine]);

  const submitCorrelation = useCallback((origin: string, identity: string, propagation: string, correlation: string): boolean => {
    const before = engine.getState();
    engine.dispatch({ type: 'FINAL_CORRELATION_SUBMITTED', origin, identity, propagation, correlation });
    const after = engine.getState();
    return after.finalCorrelationValidated && !before.finalCorrelationValidated;
  }, [engine]);

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
