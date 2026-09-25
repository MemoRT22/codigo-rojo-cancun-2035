import { useState, useEffect, useRef, useCallback } from 'react';
import type { NarrativeState } from '../types';

// ── Per-metric range definitions by narrative state ──

interface MetricRange {
  min: number;
  max: number;
  trend?: 'up' | 'down' | 'stable';
}

interface StateRanges {
  users: MetricRange;
  sessions: MetricRange;
  servicesUp: MetricRange;
  nodesLinked: MetricRange;
  eventsPerMin: MetricRange;
  latencyMs: MetricRange;
}

const RANGES: Record<NarrativeState, StateRanges> = {
  OPERACION_NORMAL: {
    users:        { min: 102, max: 106, trend: 'stable' },
    sessions:     { min: 114, max: 119, trend: 'stable' },
    servicesUp:   { min: 12,  max: 12 },
    nodesLinked:  { min: 48,  max: 48 },
    eventsPerMin: { min: 2700, max: 3000, trend: 'stable' },
    latencyMs:    { min: 16,  max: 22, trend: 'stable' },
  },
  ANOMALIA_DETECTADA: {
    users:        { min: 101, max: 104, trend: 'stable' },
    sessions:     { min: 117, max: 121, trend: 'up' },
    servicesUp:   { min: 12,  max: 12 },
    nodesLinked:  { min: 48,  max: 48 },
    eventsPerMin: { min: 3000, max: 3500, trend: 'up' },
    latencyMs:    { min: 22,  max: 30, trend: 'up' },
  },
  INCIDENTE_ESCALANDO: {
    users:        { min: 95, max: 100, trend: 'down' },
    sessions:     { min: 122, max: 128, trend: 'up' },
    servicesUp:   { min: 11,  max: 11 },
    nodesLinked:  { min: 47,  max: 47 },
    eventsPerMin: { min: 5000, max: 8000, trend: 'up' },
    latencyMs:    { min: 60,  max: 95, trend: 'up' },
  },
  CORRELACION_ESTABLECIDA: {
    users:        { min: 93, max: 98, trend: 'stable' },
    sessions:     { min: 120, max: 126, trend: 'stable' },
    servicesUp:   { min: 11,  max: 11 },
    nodesLinked:  { min: 47,  max: 47 },
    eventsPerMin: { min: 4500, max: 6500, trend: 'stable' },
    latencyMs:    { min: 50,  max: 75, trend: 'stable' },
  },
  RESPUESTA_AUTORIZADA: {
    users:        { min: 94, max: 99, trend: 'stable' },
    sessions:     { min: 118, max: 123, trend: 'down' },
    servicesUp:   { min: 11,  max: 11 },
    nodesLinked:  { min: 47,  max: 47 },
    eventsPerMin: { min: 3500, max: 5000, trend: 'down' },
    latencyMs:    { min: 35,  max: 55, trend: 'down' },
  },
  CONTENCION_EXITOSA: {
    users:        { min: 98, max: 103, trend: 'up' },
    sessions:     { min: 115, max: 120, trend: 'down' },
    servicesUp:   { min: 11,  max: 11 },
    nodesLinked:  { min: 47,  max: 47 },
    eventsPerMin: { min: 2800, max: 3200, trend: 'down' },
    latencyMs:    { min: 20,  max: 30, trend: 'down' },
  },
  CONTENCION_INCOMPLETA: {
    users:        { min: 95, max: 100, trend: 'down' },
    sessions:     { min: 116, max: 122, trend: 'stable' },
    servicesUp:   { min: 11,  max: 11 },
    nodesLinked:  { min: 47,  max: 47 },
    eventsPerMin: { min: 3200, max: 4500, trend: 'up' },
    latencyMs:    { min: 30,  max: 50, trend: 'up' },
  },
};

const SPARKLINE_LENGTH = 40;
const TICK_MS = 1500;

export interface TelemetrySnapshot {
  users: number;
  sessions: number;
  servicesUp: number;
  servicesTotal: number;
  nodesLinked: number;
  nodesTotal: number;
  eventsPerMin: number;
  latencyMs: number;
  sparkUsers: number[];
  sparkSessions: number[];
  sparkEvents: number[];
  sparkLatency: number[];
  deltaUsers: number;
  deltaSessions: number;
  deltaEvents: number;
  deltaLatency: number;
  lastUpdateTime: string;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Deterministic-feeling variation: sine-based drift + small jitter
function drift(current: number, range: MetricRange, tick: number, seed: number): number {
  const mid = (range.min + range.max) / 2;
  const span = (range.max - range.min) / 2;
  const trendBias = range.trend === 'up' ? 0.3 : range.trend === 'down' ? -0.3 : 0;

  // Sine wave for natural oscillation
  const wave = Math.sin(tick * 0.07 + seed * 2.3) * span * 0.6;
  // Small jitter
  const jitter = Math.sin(tick * 0.23 + seed * 7.1) * span * 0.25;
  const target = mid + wave + jitter + trendBias * span;

  // Ease current toward target (smooth transitions)
  const ease = 0.15;
  const next = current + (target - current) * ease;
  return clamp(next, range.min, range.max);
}

function formatTime(baseSec: number, offset: number): string {
  const total = baseSec + offset;
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.floor(s)).padStart(2, '0')}`;
}

function parseBase(t: string): number {
  const p = t.split(':');
  return (parseInt(p[0] ?? '0') * 3600) + (parseInt(p[1] ?? '0') * 60) + parseInt(p[2] ?? '0');
}

export function useTelemetry(narrativeState: NarrativeState, baseTime: string): TelemetrySnapshot {
  const ranges = RANGES[narrativeState];
  const tickRef = useRef(0);
  const baseSec = parseBase(baseTime);
  const clockOffsetRef = useRef(0);

  // Current metric values — use refs for smooth animation between ticks
  const vRef = useRef({
    users: 104,
    sessions: 117,
    servicesUp: 12,
    nodesLinked: 48,
    eventsPerMin: 2841,
    latencyMs: 18,
  });

  // Sparkline histories
  const sparkRef = useRef({
    users: [] as number[],
    sessions: [] as number[],
    events: [] as number[],
    latency: [] as number[],
  });

  // Previous values for delta calculation
  const prevRef = useRef({ users: 104, sessions: 117, events: 2841, latency: 18 });

  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() => buildSnapshot(vRef.current, sparkRef.current, prevRef.current, formatTime(baseSec, 0)));

  const update = useCallback(() => {
    const tick = tickRef.current++;
    const v = vRef.current;
    const prev = { users: v.users, sessions: v.sessions, events: v.eventsPerMin, latency: v.latencyMs };

    // Drift each metric toward its state range
    v.users = Math.round(drift(v.users, ranges.users, tick, 1));
    v.sessions = Math.round(drift(v.sessions, ranges.sessions, tick, 2));
    v.eventsPerMin = Math.round(drift(v.eventsPerMin, ranges.eventsPerMin, tick, 3));
    v.latencyMs = Math.round(drift(v.latencyMs, ranges.latencyMs, tick, 4));

    // Discrete metrics snap (services and nodes)
    const targetServices = ranges.servicesUp.min;
    if (v.servicesUp !== targetServices) {
      v.servicesUp = targetServices;
    }
    const targetNodes = ranges.nodesLinked.min;
    if (v.nodesLinked !== targetNodes) {
      v.nodesLinked = targetNodes;
    }

    // Update sparklines
    const sp = sparkRef.current;
    sp.users = pushSparkline(sp.users, v.users);
    sp.sessions = pushSparkline(sp.sessions, v.sessions);
    sp.events = pushSparkline(sp.events, v.eventsPerMin);
    sp.latency = pushSparkline(sp.latency, v.latencyMs);

    clockOffsetRef.current += TICK_MS / 1000;
    const time = formatTime(baseSec, clockOffsetRef.current);

    prevRef.current = prev;
    setSnapshot(buildSnapshot(v, sp, prev, time));
  }, [ranges, baseSec]);

  // Reset clock offset when state changes
  useEffect(() => {
    clockOffsetRef.current = 0;
    tickRef.current = 0;
  }, [narrativeState]);

  useEffect(() => {
    update(); // immediate first tick
    const iv = setInterval(update, TICK_MS);
    return () => clearInterval(iv);
  }, [update]);

  return snapshot;
}

function pushSparkline(arr: number[], val: number): number[] {
  const next = [...arr, val];
  if (next.length > SPARKLINE_LENGTH) next.shift();
  return next;
}

function buildSnapshot(
  v: { users: number; sessions: number; servicesUp: number; nodesLinked: number; eventsPerMin: number; latencyMs: number },
  sp: { users: number[]; sessions: number[]; events: number[]; latency: number[] },
  prev: { users: number; sessions: number; events: number; latency: number },
  time: string,
): TelemetrySnapshot {
  return {
    users: v.users,
    sessions: v.sessions,
    servicesUp: v.servicesUp,
    servicesTotal: 12,
    nodesLinked: v.nodesLinked,
    nodesTotal: 48,
    eventsPerMin: v.eventsPerMin,
    latencyMs: v.latencyMs,
    sparkUsers: [...sp.users],
    sparkSessions: [...sp.sessions],
    sparkEvents: [...sp.events],
    sparkLatency: [...sp.latency],
    deltaUsers: v.users - prev.users,
    deltaSessions: v.sessions - prev.sessions,
    deltaEvents: v.eventsPerMin - prev.events,
    deltaLatency: v.latencyMs - prev.latency,
    lastUpdateTime: time,
  };
}
