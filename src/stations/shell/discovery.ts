// Patrón común de descubrimiento: la fase se DERIVA de la misión y la evidencia solo se registra
// con una acción humana explícita, emitiendo UN evento de misión. Cada estación aporta su
// evidencia y su fuente; el Mission Engine sigue siendo la única autoridad (p. ej. la correlación
// COR-512 + ACC-417 la resuelve el reducer, no las estaciones).

import type { EvidenceId, MissionEvent, MissionState, TerminalId } from '../../mission/types';
import type { StationPhase } from './types';

export type MissionView = Pick<MissionState, 'status' | 'discoveredEvidence'>;

export function deriveStationPhase(m: MissionView, evidenceId: EvidenceId): StationPhase {
  if (m.status === 'idle') return 'WAITING';
  if (m.status === 'finished') return 'MISSION_FINISHED';
  return m.discoveredEvidence.includes(evidenceId) ? 'EVIDENCE_FOUND' : 'ACTIVE';
}

export type SubmitResult<E extends EvidenceId = EvidenceId> =
  | { kind: 'registered'; evidenceId: E }
  | { kind: 'already' }
  | { kind: 'no-match' }
  | { kind: 'inactive' };

/** Decide qué ocurre al agregar un elemento a la investigación. No tiene efectos. */
export function evaluateEvidence<E extends EvidenceId>(
  candidate: EvidenceId | undefined,
  expected: E,
  mission: MissionView,
): SubmitResult<E> {
  if (mission.status !== 'running') return { kind: 'inactive' };
  if (candidate !== expected) return { kind: 'no-match' };
  if (mission.discoveredEvidence.includes(expected)) return { kind: 'already' };
  return { kind: 'registered', evidenceId: expected };
}

/** Como máximo UN `EVIDENCE_DISCOVERED`; reenviar o equivocarse no emite nada. */
export function submitEvidence<E extends EvidenceId>(
  candidate: EvidenceId | undefined,
  expected: E,
  source: TerminalId,
  mission: MissionView,
  dispatch: (event: MissionEvent) => void,
): SubmitResult<E> {
  const result = evaluateEvidence(candidate, expected, mission);
  if (result.kind === 'registered') dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: expected, source });
  return result;
}
