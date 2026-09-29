// ── Lógica de descubrimiento de Inteligencia (pura, sin React) ──
// Misma forma que las demás estaciones. La cadena COR-512 → ACC-417 → NOD-204 → AGR-27 y la autorización
// las resuelve el Mission Engine: aquí solo se emite AGR-27, sin ninguna regla duplicada.

import type { MissionEvent } from '../../mission/types';
import { deriveStationPhase as derivePhase, submitEvidence, type MissionView, type SubmitResult as GenericResult } from '../shell/discovery';
import type { StationPhase } from '../shell/types';
import { GROUP_MAP } from './data';
import type { Feedback, Group, UiAction, UiState } from './types';

export const STATION_EVIDENCE = 'AGR-27' as const;
export const STATION_SOURCE = 'inteligencia' as const;

export const deriveStationPhase = (m: MissionView): StationPhase => derivePhase(m, STATION_EVIDENCE);

export type SubmitResult = GenericResult<typeof STATION_EVIDENCE>;

/** Acción humana explícita → como máximo UN `EVIDENCE_DISCOVERED` con source = inteligencia. */
export const submitToInvestigation = (
  group: Group | undefined,
  mission: MissionView,
  dispatch: (e: MissionEvent) => void,
): SubmitResult => submitEvidence(group?.evidence, STATION_EVIDENCE, STATION_SOURCE, mission, dispatch);

export function feedbackFor(result: SubmitResult, group: Group): Feedback | null {
  switch (result.kind) {
    case 'registered': return { kind: 'registered', id: group.id };
    case 'already': return { kind: 'already' };
    case 'no-match': return { kind: 'no-match', ...group.reject };
    case 'inactive': return null;
  }
}

export const initialUi = (): UiState => ({ selectedId: null, detailsOpen: false, trace: [], feedback: null });

const TRACE_LIMIT = 6;
const addTrace = (s: UiState, entry: string): string[] => [entry, ...s.trace].slice(0, TRACE_LIMIT);

export function uiReducer(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'RESET': return initialUi();
    case 'SELECT':
      if (state.selectedId === action.id) return state;
      return { ...state, selectedId: action.id, feedback: null, detailsOpen: false, trace: addTrace(state, `Abrió agrupación · ${GROUP_MAP.get(action.id)?.id ?? action.id}`) };
    case 'TOGGLE_DETAILS': return { ...state, detailsOpen: !state.detailsOpen };
    case 'FEEDBACK': return { ...state, feedback: action.feedback };
    case 'TRACE': return { ...state, trace: addTrace(state, action.entry) };
  }
}
