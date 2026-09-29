import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NarrativeState, Phase, SystemEvent } from '../types';
import { BASE, derive, feedAt, type Derived } from './derive';
import { STATE_SPECS, fmtTime, phaseOf, stateIndex, subheadline, type StateSpec } from './scenario';

// Ruido determinista: los contadores "respiran" sin aleatoriedad sin causa.
const rnd = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const HISTORY = 120;
const DELTA_WINDOW = 45;

export interface Metric {
  value: number;
  /** Cambio respecto de hace ~45 s simulados; 0 si aún no hay historia. */
  delta: number;
  spark: number[];
}

export interface WorldView {
  state: NarrativeState;
  phase: Phase;
  spec: StateSpec;
  subheadline: string;
  clock: number;
  time: string;
  speed: number;
  derived: Derived;
  feed: SystemEvent[];
  users: Metric;
  sessions: Metric;
  events: Metric;
  latency: Metric;
  sync: number;
  preserved: number;
  paused: boolean;
  setState: (s: NarrativeState) => void;
  reset: () => void;
  /** En espera (misión sin iniciar): el reloj se mantiene en la hora de arranque hasta que la sesión comience. */
  setStandby: (v: boolean) => void;
  setSpeed: (n: number) => void;
  setPaused: (p: boolean) => void;
  inject: (message: string, level: SystemEvent['level']) => void;
}

interface Series { value: number; hist: number[] }
const series = (v: number): Series => ({ value: v, hist: [v] });
const push = (s: Series, v: number) => {
  s.value = v;
  s.hist.push(v);
  if (s.hist.length > HISTORY) s.hist.shift();
};
const metric = (s: Series): Metric => ({
  value: s.value,
  delta: s.hist.length > DELTA_WINDOW ? s.value - s.hist[s.hist.length - 1 - DELTA_WINDOW]! : 0,
  spark: [...s.hist],
});

// La velocidad del reloj simulado siempre arranca en ×1; solo se cambia desde la Consola de Facilitación.
const INITIAL_SPEED = 1;

export function useWorld(): WorldView {
  const [state, setStateRaw] = useState<NarrativeState>('OPERACION_NORMAL');
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [clock, setClock] = useState(STATE_SPECS.OPERACION_NORMAL.baseTime);
  const [extra, setExtra] = useState<SystemEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [, bump] = useState(0);

  const stateRef = useRef(state);
  const clockRef = useRef(clock);
  const tickRef = useRef(0);
  const wobble = useRef({ users: 0, sessions: 0 });
  const users = useRef(series(BASE.users));
  const sessions = useRef(series(BASE.sessions));
  const events = useRef(series(BASE.eventsPerMin));
  const latency = useRef(series(BASE.latencyMs));
  const syncRef = useRef(BASE.sync);
  const injected = useRef(0);
  const standby = useRef(true);
  const setStandby = useCallback((v: boolean) => { standby.current = v; }, []);

  const derived = useMemo(() => derive(state, clock), [state, clock]);
  const derivedRef = useRef(derived);
  derivedRef.current = derived;

  const setState = useCallback((next: NarrativeState) => {
    const cur = stateRef.current;
    const base = STATE_SPECS[next].baseTime;
    // Hacia atrás: reinicia la cronología del estado; hacia delante: nunca retrocede el reloj.
    clockRef.current = stateIndex(next) < stateIndex(cur) ? base : Math.max(clockRef.current, base);
    stateRef.current = next;
    setStateRaw(next);
    setClock(clockRef.current);
    setExtra([]);
  }, []);

  const reset = useCallback(() => {
    const base = STATE_SPECS.OPERACION_NORMAL.baseTime;
    stateRef.current = 'OPERACION_NORMAL';
    clockRef.current = base;
    tickRef.current = 0;
    wobble.current = { users: 0, sessions: 0 };
    users.current = series(BASE.users);
    sessions.current = series(BASE.sessions);
    events.current = series(BASE.eventsPerMin);
    latency.current = series(BASE.latencyMs);
    syncRef.current = BASE.sync;
    setStateRaw('OPERACION_NORMAL');
    setClock(base);
    setExtra([]);
  }, []);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const tick = ++tickRef.current;
      // Antes de iniciar la sesión el reloj espera en la hora de arranque; los indicadores siguen «respirando».
      if (standby.current && stateRef.current === 'OPERACION_NORMAL') clockRef.current = STATE_SPECS.OPERACION_NORMAL.baseTime;
      else clockRef.current += 1;
      const d = derive(stateRef.current, clockRef.current);
      derivedRef.current = d;

      // Usuarios y sesiones: pequeña variación natural + efecto causal de los eventos del escenario.
      if (tick % 7 === 0) {
        const r = rnd(tick / 7);
        wobble.current.users = Math.max(-2, Math.min(2, wobble.current.users + (r < 0.33 ? -1 : r < 0.66 ? 0 : 1)));
      }
      if (tick % 9 === 0) {
        const r = rnd(tick / 9 + 500);
        wobble.current.sessions = Math.max(-2, Math.min(2, wobble.current.sessions + (r < 0.33 ? -1 : r < 0.66 ? 0 : 1)));
      }
      const stepTo = (cur: number, target: number, seed: number) => {
        const diff = target - cur;
        if (diff === 0) return cur;
        if (rnd(tick * 3 + seed) < 0.5) return cur;
        const step = Math.abs(diff) >= 8 ? 2 : 1;
        return cur + Math.sign(diff) * step;
      };
      push(users.current, stepTo(users.current.value, BASE.users + d.effects.users + wobble.current.users, 11));
      push(sessions.current, stepTo(sessions.current.value, BASE.sessions + d.effects.sessions + wobble.current.sessions, 23));

      // Eventos y latencia: cambian a saltos pequeños hacia su objetivo derivado.
      const evTarget = BASE.eventsPerMin + d.effects.events + Math.sin(tick * 0.31) * 55;
      push(events.current, Math.round(events.current.value + (evTarget - events.current.value) * 0.22 + (rnd(tick + 90) - 0.5) * 30));
      const laTarget = d.latencyMs + Math.sin(tick * 0.5) * 0.9;
      push(latency.current, Math.round(latency.current.value + (laTarget - latency.current.value) * 0.3));
      syncRef.current += (d.sync - syncRef.current) * 0.25;

      setClock(clockRef.current);
      bump((n) => n + 1);
    }, 1000 / speed);
    return () => clearInterval(iv);
  }, [speed, paused]);

  const inject = useCallback((message: string, level: SystemEvent['level']) => {
    setExtra((prev) => [...prev, { id: `dev-${++injected.current}`, time: fmtTime(clockRef.current), message, level }]);
  }, []);

  const phase = phaseOf(state, clock);
  const preserved = derived.servicesUp;
  const sync = Math.round(syncRef.current * 10) / 10;
  const feed = useMemo(
    () => feedAt(state, clock, [...derived.beatEvents, ...extra]),
    [state, clock, derived.beatEvents, extra],
  );

  return {
    state,
    phase,
    spec: STATE_SPECS[state],
    subheadline: subheadline(state, phase, sync, preserved, derived.servicesTotal),
    clock,
    time: fmtTime(clock),
    speed,
    derived,
    feed,
    users: metric(users.current),
    sessions: metric(sessions.current),
    events: metric(events.current),
    latency: metric(latency.current),
    sync,
    preserved,
    paused,
    setState,
    reset,
    setStandby,
    setSpeed,
    setPaused,
    inject,
  };
}
