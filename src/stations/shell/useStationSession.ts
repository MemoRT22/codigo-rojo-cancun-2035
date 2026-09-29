import { useEffect, useRef } from 'react';
import type { MissionState } from '../../mission/types';
import { useAnalysisAssistant } from '../assistant/useAnalysisAssistant';
import type { AssistantPlan } from '../assistant/types';
import type { StationPhase } from './types';

interface Options {
  mission: Pick<MissionState, 'status'>;
  phase: StationPhase;
  /** Reinicia la UI local de la estación. */
  onRestart: () => void;
  /** Recomendaciones y calibración del Analysis Assistant de esta estación. */
  assistant: AssistantPlan;
}

/**
 * Ciclo de vida común de una estación:
 *  - pausa;
 *  - reinicio de la UI local y del Analysis Assistant cuando la misión se reinicia o arranca de nuevo;
 *  - el asistente solo cuenta tiempo con la estación ACTIVE y sin pausa (no usa el reloj del equipo ni ningún reloj compartido).
 */
export function useStationSession({ mission, phase, onRestart, assistant: plan }: Options) {
  const paused = mission.status === 'paused';
  const assistant = useAnalysisAssistant(plan, phase === 'ACTIVE' && !paused);
  const { reset: resetAssistant } = assistant;

  const prevStatus = useRef(mission.status);
  const prevPhase = useRef(phase);
  const restartRef = useRef(onRestart);
  restartRef.current = onRestart;
  useEffect(() => {
    const ps = prevStatus.current;
    const pp = prevPhase.current;
    prevStatus.current = mission.status;
    prevPhase.current = phase;
    const restarted = mission.status === 'idle' || (ps === 'idle' && mission.status === 'running') || (pp === 'EVIDENCE_FOUND' && phase === 'ACTIVE');
    if (restarted) {
      restartRef.current();
      resetAssistant();
    }
  }, [mission.status, phase, resetAssistant]);

  return { paused, assistant };
}
