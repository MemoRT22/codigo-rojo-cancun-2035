// ── Lógica de descubrimiento de Identidad y Accesos (pura, sin React) ──
//
// Misma forma que Comunicaciones: fase derivada de la misión, acción humana explícita y UN evento.
// La correlación COR-512 + ACC-417 NO se calcula aquí: la resuelve el Mission Engine (reducer).

import type { MissionEvent } from '../../mission/types';
import {
  deriveStationPhase as derivePhase, evaluateEvidence, submitEvidence, type MissionView, type SubmitResult as GenericResult,
} from '../shell/discovery';
import type { StationPhase } from '../shell/types';
import { EVENTS } from './data';
import type { AccessEvent, EventKind, Feedback, ResultFilter, SessionInfo, UiAction, UiState } from './types';

/** Evidencia que produce esta estación (canon: docs/03-game-design.md, Hilo B). */
export const STATION_EVIDENCE = 'ACC-417' as const;
export const STATION_SOURCE = 'identidad' as const;

export const deriveStationPhase = (m: MissionView): StationPhase => derivePhase(m, STATION_EVIDENCE);

export type SubmitResult = GenericResult<typeof STATION_EVIDENCE>;

export const evaluateSubmission = (event: AccessEvent | undefined, mission: MissionView): SubmitResult =>
  evaluateEvidence(event?.evidence, STATION_EVIDENCE, mission);

/** Acción humana explícita → como máximo UN `EVIDENCE_DISCOVERED` con source = identidad. */
export const submitToInvestigation = (
  event: AccessEvent | undefined,
  mission: MissionView,
  dispatch: (e: MissionEvent) => void,
): SubmitResult => submitEvidence(event?.evidence, STATION_EVIDENCE, STATION_SOURCE, mission, dispatch);

export function feedbackFor(result: SubmitResult, eventId: string): Feedback | null {
  switch (result.kind) {
    case 'registered': return { kind: 'registered', eventId };
    case 'already': return { kind: 'already' };
    case 'no-match': return { kind: 'no-match' };
    case 'inactive': return null;
  }
}

// ── Vocabulario visible (todo en español) ──

export const RESULT_LABEL: Record<EventKind, string> = {
  concedido: 'ACCESO CONCEDIDO',
  denegado: 'ACCESO DENEGADO',
  actividad: 'ACTIVIDAD DE SESIÓN',
};

export const RESULT_FILTERS: { id: ResultFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'concedido', label: 'Accesos concedidos' },
  { id: 'denegado', label: 'Accesos denegados' },
  { id: 'actividad', label: 'Actividad de sesión' },
];

// ── Búsqueda y filtros ──

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterEvents(
  list: readonly AccessEvent[],
  opts: { query: string; result: ResultFilter; zone: string; nameOf: (userId: string) => string },
): AccessEvent[] {
  const q = norm(opts.query.trim());
  return list.filter((e) => {
    if (opts.result !== 'todos' && e.kind !== opts.result) return false;
    if (opts.zone !== 'todas' && e.zone !== opts.zone) return false;
    if (!q) return true;
    return norm([e.userId, opts.nameOf(e.userId), e.device, e.zone].join(' ')).includes(q);
  });
}

// ── Sesiones y cronología de un usuario (derivadas de los eventos: una sola fuente) ──

export const toSeconds = (t: string) => {
  const [h = 0, m = 0, s = 0] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

export const eventsOf = (userId: string, events: readonly AccessEvent[] = EVENTS): AccessEvent[] =>
  events.filter((e) => e.userId === userId).sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

/** Una sesión por dispositivo desde su primer acceso concedido; última actividad = último evento en ese dispositivo. */
export function sessionsOf(userId: string, events: readonly AccessEvent[] = EVENTS): SessionInfo[] {
  const mine = eventsOf(userId, events);
  const byDevice = new Map<string, AccessEvent[]>();
  for (const e of mine) byDevice.set(e.device, [...(byDevice.get(e.device) ?? []), e]);
  const out: SessionInfo[] = [];
  for (const [device, list] of byDevice) {
    const grant = list.find((e) => e.kind === 'concedido');
    if (!grant) continue; // solo accesos denegados: no hay sesión
    out.push({ device, zone: grant.zone, since: grant.time, last: list[list.length - 1]!.time, events: list.length });
  }
  return out.sort((a, b) => toSeconds(a.since) - toSeconds(b.since));
}

// ── Estado de interfaz ──

export function initialUi(): UiState {
  return { selectedId: null, query: '', result: 'todos', zone: 'todas', detailsOpen: false, trace: [], misses: 0, feedback: null };
}

const TRACE_LIMIT = 6;
const addTrace = (s: UiState, entry: string): string[] => [entry, ...s.trace].slice(0, TRACE_LIMIT);

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'RESET':
      return initialUi();
    case 'SELECT': {
      if (state.selectedId === action.id) return state;
      const e = EVENTS.find((x) => x.id === action.id);
      return {
        ...state,
        selectedId: action.id,
        feedback: null,
        trace: addTrace(state, e ? `Abrió evento · ${e.userId} · ${e.time}` : `Abrió evento · ${action.id}`),
      };
    }
    case 'QUERY':
      return { ...state, query: action.query };
    case 'RESULT':
      return { ...state, result: action.result, trace: addTrace(state, `Filtro · ${RESULT_FILTERS.find((f) => f.id === action.result)?.label ?? ''}`) };
    case 'ZONE':
      return { ...state, zone: action.zone, trace: addTrace(state, action.zone === 'todas' ? 'Filtro · Todas las zonas' : `Filtro · Zona ${action.zone}`) };
    case 'TOGGLE_DETAILS':
      return { ...state, detailsOpen: !state.detailsOpen };
    case 'FEEDBACK':
      return { ...state, feedback: action.feedback };
    case 'MISS':
      return { ...state, misses: state.misses + 1 };
    case 'TRACE':
      return { ...state, trace: addTrace(state, action.entry) };
  }
}
