// ── Lógica de descubrimiento de Comunicaciones (pura, sin React) ──
//
// Separada de la presentación (CommunicationsStation.tsx) y de los datos (data.ts) para poder
// probarla y para que otras estaciones reutilicen el patrón: derivar fase desde la misión,
// evaluar una acción humana explícita y emitir UN evento de misión.

import type { MissionEvent } from '../../mission/types';
import {
  deriveStationPhase as derivePhase, evaluateEvidence, submitEvidence, type MissionView, type SubmitResult as GenericResult,
} from '../shell/discovery';
import type { StationPhase } from '../shell/types';
import { MESSAGES } from './data';
import type { Feedback, FilterId, Message, UiAction, UiState } from './types';

/** Evidencia que produce esta estación (canon: docs/03-game-design.md, Hilo A). */
export const STATION_EVIDENCE = 'COR-512' as const;
export const STATION_SOURCE = 'comunicaciones' as const;

// ── Fase de la estación (derivada del estado de misión) ──

export const deriveStationPhase = (m: MissionView): StationPhase => derivePhase(m, STATION_EVIDENCE);

// ── Acción de descubrimiento: «Agregar a la investigación» ──

export type SubmitResult = GenericResult<typeof STATION_EVIDENCE>;

/** Decide qué ocurre al agregar una comunicación a la investigación. No tiene efectos. */
export const evaluateSubmission = (message: Message | undefined, mission: MissionView): SubmitResult =>
  evaluateEvidence(message?.evidence, STATION_EVIDENCE, mission);

/**
 * Acción humana explícita → como máximo UN `EVIDENCE_DISCOVERED`. Reenviar la evidencia ya
 * registrada, o una comunicación sin coincidencia, no emite nada.
 */
export const submitToInvestigation = (
  message: Message | undefined,
  mission: MissionView,
  dispatch: (event: MissionEvent) => void,
): SubmitResult => submitEvidence(message?.evidence, STATION_EVIDENCE, STATION_SOURCE, mission, dispatch);

export function feedbackFor(result: SubmitResult, messageId: string): Feedback | null {
  switch (result.kind) {
    case 'registered': return { kind: 'registered', messageId };
    case 'already': return { kind: 'already' };
    case 'no-match': return { kind: 'no-match', messageId };
    case 'inactive': return null;
  }
}

// ── Búsqueda y filtros ──

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'no-leidos', label: 'No leídos' },
  { id: 'enlaces', label: 'Con enlaces' },
  { id: 'adjuntos', label: 'Con adjuntos' },
  { id: 'prioridad', label: 'Prioridad alta' },
];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterMessages(
  list: readonly Message[],
  opts: { query: string; filter: FilterId; readIds: readonly string[] },
): Message[] {
  const q = norm(opts.query.trim());
  return list.filter((m) => {
    if (opts.filter === 'no-leidos' && opts.readIds.includes(m.id)) return false;
    if (opts.filter === 'enlaces' && m.links.length === 0) return false;
    if (opts.filter === 'adjuntos' && m.attachments.length === 0) return false;
    if (opts.filter === 'prioridad' && m.priority !== 'Alta') return false;
    if (!q) return true;
    return norm([m.senderName, m.senderAddress, m.subject, ...m.body].join(' ')).includes(q);
  });
}

// ── Ayudas progresivas (comunes: ../shell/help) ──

export { HELP_AT, helpLevel, type HelpLevel } from '../shell/help';

// ── Estado de interfaz ──

export function initialUi(): UiState {
  return {
    selectedId: null,
    readIds: MESSAGES.filter((m) => !m.unread).map((m) => m.id),
    query: '',
    filter: 'todos',
    detailsOpen: false,
    trace: [],
    misses: 0,
    feedback: null,
  };
}

const TRACE_LIMIT = 6;
const addTrace = (s: UiState, entry: string): string[] => [entry, ...s.trace].slice(0, TRACE_LIMIT);

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'RESET':
      return initialUi();
    case 'SELECT': {
      if (state.selectedId === action.id) return state;
      const subject = MESSAGES.find((m) => m.id === action.id)?.subject ?? action.id;
      return {
        ...state,
        selectedId: action.id,
        readIds: state.readIds.includes(action.id) ? state.readIds : [...state.readIds, action.id],
        feedback: null,
        trace: addTrace(state, `Abrió · ${subject}`),
      };
    }
    case 'QUERY':
      return { ...state, query: action.query };
    case 'FILTER':
      return { ...state, filter: action.filter, trace: addTrace(state, `Filtro · ${FILTERS.find((f) => f.id === action.filter)?.label ?? ''}`) };
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
