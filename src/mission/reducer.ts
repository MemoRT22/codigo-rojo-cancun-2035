import type { MissionState, MissionEvent } from './types';
import { INITIAL_MISSION } from './types';
import { validateCorrelation, checkIdentityCorrelation } from './rules';

/**
 * Función pura: `(estado, evento) → nuevo estado`.
 * No produce efectos secundarios. Las transiciones narrativas que resultan
 * de cambios en el estado de misión se resuelven fuera del reducer.
 */
export function missionReducer(state: MissionState, event: MissionEvent): MissionState {
  switch (event.type) {
    case 'MISSION_START':
      return { ...INITIAL_MISSION, status: 'running' };

    case 'MISSION_PAUSE':
      if (state.status !== 'running') return state;
      return { ...state, status: 'paused' };

    case 'MISSION_RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'running' };

    case 'MISSION_RESET':
      return { ...INITIAL_MISSION };

    case 'EVIDENCE_DISCOVERED': {
      if (state.status !== 'running') return state;
      if (state.discoveredEvidence.includes(event.evidenceId)) return state;
      const evidence = [...state.discoveredEvidence, event.evidenceId];
      return {
        ...state,
        discoveredEvidence: evidence,
        identityCorrelationEstablished:
          state.identityCorrelationEstablished || checkIdentityCorrelation(evidence),
      };
    }

    case 'FINAL_CORRELATION_SUBMITTED': {
      if (state.status !== 'running') return state;
      const valid = validateCorrelation(
        event.origin,
        event.identity,
        event.propagation,
        event.correlation,
      );
      if (!valid) {
        return { ...state, failedCorrelationAttempts: state.failedCorrelationAttempts + 1 };
      }
      return { ...state, finalCorrelationValidated: true, responseUnlocked: true };
    }

    case 'PLAN_SELECTED':
      if (state.status !== 'running' || !state.responseUnlocked) return state;
      return { ...state, selectedPlan: event.plan };

    case 'PLAN_CONFIRMED': {
      if (state.status !== 'running' || !state.selectedPlan) return state;
      return {
        ...state,
        outcome: state.selectedPlan === 'DELTA' ? 'contained' : 'incomplete',
        status: 'finished',
      };
    }

    case 'MISSION_TIMEOUT':
      if (state.status !== 'running') return state;
      return { ...state, timedOut: true };

    case 'MANUAL_OVERRIDE':
      return state;
  }
}
