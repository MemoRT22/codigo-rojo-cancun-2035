// ── Derivación: del estado de los nodos a todo lo que se muestra ──
// Funciones puras. Ninguna cifra visible se calcula con factores "visuales": todo sale de
// (estado narrativo, hora simulada) → estado de nodos → resúmenes.

import type { DomainId } from '../brand/tokens';
import { DOMAINS } from '../brand/tokens';
import type { NarrativeState, NodeStatus, SystemEvent } from '../types';
import { BEATS, INITIAL_FLAGS, ambientEvents, fmtTime, isDeteriorating, phaseOf, type Effects, type Flags } from './scenario';
import { NODES, ZONES, TOTALS, nodesOfDomain, nodesOfZone, type ZoneId } from './model';

export const BASE = { users: 104, sessions: 117, eventsPerMin: 2881, latencyMs: 18, sync: 99.8 };
// (latencyMs base = promedio ponderado de las latencias base de zona: 17.7 ≈ 18)

/** Latencia local (ms) que aporta cada nodo según su estado. */
const LATENCY_COST: Record<NodeStatus, number> = { ok: 0, watch: 0.8, warn: 6, crit: 22, off: 3, isolated: 0, recovering: 2.5 };
/** Puntos de sincronización (%) que resta cada nodo según su estado. */
const SYNC_COST: Record<NodeStatus, number> = { ok: 0, watch: 0.05, warn: 0.28, crit: 0.9, off: 0.35, isolated: 0, recovering: 0.12 };

const SEVERITY_RANK: Record<NodeStatus, number> = { crit: 6, off: 5, warn: 4, recovering: 3, isolated: 2, watch: 1, ok: 0 };

export const worstOf = (list: NodeStatus[]): NodeStatus =>
  list.reduce<NodeStatus>((w, s) => (SEVERITY_RANK[s] > SEVERITY_RANK[w] ? s : w), 'ok');

export const isOnline = (s: NodeStatus) => s !== 'off' && s !== 'isolated';

export const STATUS_LABEL: Record<NodeStatus, string> = {
  ok: 'Operativo',
  watch: 'En observación',
  warn: 'Advertencia',
  crit: 'Crítico',
  off: 'Fuera de servicio',
  isolated: 'Nodo aislado',
  recovering: 'Recuperando',
};

/** Etiqueta de dominio: "Fuera de servicio" solo si TODOS sus nodos están caídos. */
export function domainLabel(d: { worst: NodeStatus; online: number; total: number; segments: NodeStatus[] }): string {
  if (d.worst === 'off') return d.segments.every((s) => s === 'off') ? 'Fuera de servicio' : 'Nodos sin respuesta';
  return STATUS_LABEL[d.worst];
}

export interface DomainSummary {
  id: DomainId;
  worst: NodeStatus;
  online: number;
  total: number;
  /** Un segmento por nodo, en orden del modelo. */
  segments: NodeStatus[];
  /** ¿El servicio está operativo? (sin nodos críticos, caídos ni aislados) */
  operational: boolean;
}

export interface ZoneSummary {
  id: ZoneId;
  name: string;
  total: number;
  online: number;
  worst: NodeStatus;
  latencyMs: number;
  /** Por cada dominio presente en la zona, su peor estado. */
  services: { domain: DomainId; worst: NodeStatus }[];
  stress: number;
}

export interface Derived {
  status: Record<string, NodeStatus>;
  flags: Flags;
  effects: Required<Effects>;
  /** Nodos con destello de sincronización programada activo. */
  flashNodes: string[];
  beatEvents: SystemEvent[];
  domains: DomainSummary[];
  zones: ZoneSummary[];
  servicesUp: number;
  servicesTotal: number;
  nodesLinked: number;
  nodesTotal: number;
  latencyMs: number;
  sync: number;
  /** Cambia solo cuando cambia el estado de nodos o las banderas (para memoizar capas). */
  version: string;
}

export function derive(state: NarrativeState, clock: number): Derived {
  const status: Record<string, NodeStatus> = Object.fromEntries(NODES.map((n) => [n.id, 'ok' as NodeStatus]));
  const flags: Flags = { ...INITIAL_FLAGS };
  const effects: Required<Effects> = { users: 0, sessions: 0, events: 0 };
  const flashNodes: string[] = [];
  const beatEvents: SystemEvent[] = [];

  BEATS.forEach((b, i) => {
    if (b.at > clock || !b.states.includes(state)) return;
    if (b.status) Object.assign(status, b.status);
    if (b.flags) Object.assign(flags, b.flags);
    if (b.effects) {
      effects.users += b.effects.users ?? 0;
      effects.sessions += b.effects.sessions ?? 0;
      effects.events += b.effects.events ?? 0;
    }
    if (b.flash && clock < b.at + b.flash.dur) flashNodes.push(...b.flash.nodes);
    if (b.event) {
      beatEvents.push({ id: `beat-${i}`, time: fmtTime(b.at), message: b.event.message, level: b.event.level, zone: b.event.zone });
    }
  });

  const domains: DomainSummary[] = DOMAINS.map((d) => {
    const list = nodesOfDomain(d.id).map((n) => status[n.id]!);
    const worst = worstOf(list);
    return {
      id: d.id,
      worst,
      online: list.filter(isOnline).length,
      total: list.length,
      segments: list,
      operational: !list.some((s) => s === 'crit' || s === 'off' || s === 'isolated'),
    };
  });

  const zones: ZoneSummary[] = ZONES.map((z) => {
    const ns = nodesOfZone(z.id);
    const list = ns.map((n) => status[n.id]!);
    const stress = list.reduce((a, s) => a + LATENCY_COST[s], 0);
    const services = DOMAINS.flatMap((d) => {
      const dn = ns.filter((n) => n.domain === d.id).map((n) => status[n.id]!);
      return dn.length ? [{ domain: d.id, worst: worstOf(dn) }] : [];
    });
    return {
      id: z.id,
      name: z.name,
      total: ns.length,
      online: list.filter(isOnline).length,
      worst: worstOf(list),
      latencyMs: Math.round(z.baseLatency + stress),
      services,
      stress,
    };
  });

  const all = NODES.map((n) => status[n.id]!);
  // La latencia global es el promedio de las latencias de zona ponderado por nodos: un solo modelo.
  const latencyMs = zones.reduce((a, z) => a + z.latencyMs * z.total, 0) / TOTALS.nodes;
  const sync = Math.max(80, BASE.sync - all.reduce((a, s) => a + SYNC_COST[s], 0));
  const servicesUp = domains.filter((d) => d.operational).length;

  return {
    status,
    flags,
    effects,
    flashNodes,
    beatEvents,
    domains,
    zones,
    servicesUp,
    servicesTotal: TOTALS.services,
    nodesLinked: all.filter(isOnline).length,
    nodesTotal: TOTALS.nodes,
    latencyMs,
    sync,
    version: `${all.join('')}|${flags.remoteSession}${flags.correlated ? 1 : 0}${flags.reveal ? 1 : 0}|${flashNodes.length}`,
  };
}

/** Feed unificado: eventos del escenario + actividad ambiental, más recientes primero. */
export function feedAt(state: NarrativeState, clock: number, beatEvents: SystemEvent[], limit = 6): SystemEvent[] {
  const phase = phaseOf(state, clock);
  // Silencioso mientras el territorio se deteriora o se recupera; el resto, actividad normal completa.
  const quiet = isDeteriorating(phase) || phase === 'recuperacion';
  return [...ambientEvents(clock, quiet), ...beatEvents]
    .sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
    .slice(0, limit);
}
