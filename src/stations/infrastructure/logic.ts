// ── Lógica de descubrimiento de Infraestructura (pura, sin React) ──
// Misma forma que las demás estaciones: fase derivada de la misión, acción humana explícita y UN evento.
// El Mission Engine es la autoridad de la correlación: aquí no hay ninguna regla duplicada.

import type { MissionEvent } from '../../mission/types';
import { deriveStationPhase as derivePhase, submitEvidence, type MissionView, type SubmitResult as GenericResult } from '../shell/discovery';
import type { StationPhase } from '../shell/types';
import { NODES, NODE_MAP, peakOf } from './data';
import type { Feedback, InfraNode, NodeFilter, NodeSort, UiAction, UiState } from './types';

export const STATION_EVIDENCE = 'NOD-204' as const;
export const STATION_SOURCE = 'infraestructura' as const;

export const deriveStationPhase = (m: MissionView): StationPhase => derivePhase(m, STATION_EVIDENCE);

export type SubmitResult = GenericResult<typeof STATION_EVIDENCE>;

/** Acción humana explícita → como máximo UN `EVIDENCE_DISCOVERED` con source = infraestructura. */
export const submitToInvestigation = (
  node: InfraNode | undefined,
  mission: MissionView,
  dispatch: (e: MissionEvent) => void,
): SubmitResult => submitEvidence(node?.evidence, STATION_EVIDENCE, STATION_SOURCE, mission, dispatch);

export function feedbackFor(result: SubmitResult, node: InfraNode): Feedback | null {
  switch (result.kind) {
    case 'registered': return { kind: 'registered', obs: node.evidence ?? node.obs };
    case 'already': return { kind: 'already' };
    // Un cambio con explicación documentada recibe un mensaje distinto al de un nodo sin relación temporal.
    case 'no-match': return node.change && node.docs ? { kind: 'explained' } : { kind: 'no-match' };
    case 'inactive': return null;
  }
}

// ── Lista de nodos ──

export const FILTERS: { id: NodeFilter; label: string }[] = [
  { id: 'todos', label: 'Todos los nodos' },
  { id: 'cambios', label: 'Con cambios de actividad' },
];
export const SORTS: { id: NodeSort; label: string }[] = [
  { id: 'nodo', label: 'Nodo' },
  { id: 'pico', label: 'Mayor pico de actividad' },
];

export function visibleNodes(filter: NodeFilter, sort: NodeSort): InfraNode[] {
  const list = NODES.filter((n) => filter === 'todos' || !!n.change);
  return sort === 'pico' ? [...list].sort((a, b) => peakOf(b.id) - peakOf(a.id)) : list;
}

/** Referencia de sesión (ACC-xxx) del nodo, si la tiene. */
export const sessionRefOf = (n: InfraNode) => n.events.find((e) => e.ref?.startsWith('ACC-'))?.ref;

// ── Estado de interfaz ──

export const initialUi = (): UiState => ({ selectedId: null, filter: 'todos', sort: 'nodo', detailsOpen: false, trace: [], feedback: null });

const TRACE_LIMIT = 6;
const addTrace = (s: UiState, entry: string): string[] => [entry, ...s.trace].slice(0, TRACE_LIMIT);

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'RESET': return initialUi();
    case 'SELECT':
      if (state.selectedId === action.id) return state;
      return { ...state, selectedId: action.id, feedback: null, detailsOpen: false, trace: addTrace(state, `Abrió nodo · ${NODE_MAP.get(action.id)?.id ?? action.id}`) };
    case 'FILTER': return { ...state, filter: action.filter, trace: addTrace(state, `Filtro · ${FILTERS.find((f) => f.id === action.filter)?.label ?? ''}`) };
    case 'SORT': return { ...state, sort: action.sort, trace: addTrace(state, `Orden · ${SORTS.find((s) => s.id === action.sort)?.label ?? ''}`) };
    case 'TOGGLE_DETAILS': return { ...state, detailsOpen: !state.detailsOpen };
    case 'FEEDBACK': return { ...state, feedback: action.feedback };
    case 'TRACE': return { ...state, trace: addTrace(state, action.entry) };
  }
}
