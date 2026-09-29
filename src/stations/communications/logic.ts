// ── Lógica de descubrimiento de Comunicaciones (pura, sin React) ──
//
// Separada de la presentación (CommunicationsStation.tsx) y de los datos (data.ts) para poder
// probarla y para que otras estaciones reutilicen el patrón: derivar fase desde la misión,
// evaluar una acción humana explícita y emitir UN evento de misión.

import type { MissionEvent, MissionState } from '../../mission/types';
import type { StationPhase } from '../shell/types';
import { MESSAGES } from './data';
import type { Feedback, FilterId, Message, UiAction, UiState } from './types';

/** Evidencia que produce esta estación (canon: docs/03-game-design.md, Hilo A). */
export const STATION_EVIDENCE = 'COR-512' as const;
export const STATION_SOURCE = 'comunicaciones' as const;

type MissionView = Pick<MissionState, 'status' | 'discoveredEvidence'>;

// ── Fase de la estación (derivada del estado de misión) ──

export function deriveStationPhase(m: MissionView): StationPhase {
  if (m.status === 'idle') return 'WAITING';
  if (m.status === 'finished') return 'MISSION_FINISHED';
  return m.discoveredEvidence.includes(STATION_EVIDENCE) ? 'EVIDENCE_FOUND' : 'ACTIVE';
}

// ── Acción de descubrimiento: «Agregar a la investigación» ──

export type SubmitResult =
  | { kind: 'registered'; evidenceId: typeof STATION_EVIDENCE }
  | { kind: 'already' }
  | { kind: 'no-match' }
  | { kind: 'inactive' };

/** Decide qué ocurre al agregar una comunicación a la investigación. No tiene efectos. */
export function evaluateSubmission(message: Message | undefined, mission: MissionView): SubmitResult {
  if (mission.status !== 'running') return { kind: 'inactive' };
  if (!message || message.evidence !== STATION_EVIDENCE) return { kind: 'no-match' };
  if (mission.discoveredEvidence.includes(STATION_EVIDENCE)) return { kind: 'already' };
  return { kind: 'registered', evidenceId: STATION_EVIDENCE };
}

/**
 * Acción humana explícita → como máximo UN `EVIDENCE_DISCOVERED`. Reenviar la evidencia ya
 * registrada, o una comunicación sin coincidencia, no emite nada.
 */
export function submitToInvestigation(
  message: Message | undefined,
  mission: MissionView,
  dispatch: (event: MissionEvent) => void,
): SubmitResult {
  const result = evaluateSubmission(message, mission);
  if (result.kind === 'registered') {
    dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: result.evidenceId, source: STATION_SOURCE });
  }
  return result;
}

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

// ── Ayudas progresivas (suenan a sistema, no a profesor) ──

/** Segundos de sesión activa sin evidencia a partir de los cuales aparece cada nivel. */
export const HELP_AT = [180, 300] as const;

export type HelpLevel = 0 | 1 | 2;

export function helpLevel(activeSeconds: number, misses: number): HelpLevel {
  if (activeSeconds >= HELP_AT[1] || misses >= 3) return 2;
  if (activeSeconds >= HELP_AT[0]) return 1;
  return 0;
}

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
