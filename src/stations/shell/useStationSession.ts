import { useEffect, useRef, useState } from 'react';
import type { MissionState } from '../../mission/types';
import { helpLevel, type HelpLevel } from './help';
import type { StationPhase } from './types';

/**
 * Ciclo de vida común de una estación:
 *  - pausa;
 *  - reinicio de la UI local cuando la misión se reinicia o arranca de nuevo;
 *  - ayuda progresiva (contador de segundos de sesión activa sin evidencia; no usa el reloj del equipo).
 */
export function useStationSession(
  mission: Pick<MissionState, 'status'>,
  phase: StationPhase,
  misses: number,
  onRestart: () => void,
) {
  const [helpOverride, setHelpOverride] = useState<HelpLevel | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const paused = mission.status === 'paused';

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
      setActiveSeconds(0);
      setHelpOverride(null);
    }
  }, [mission.status, phase]);

  const counting = phase === 'ACTIVE' && !paused;
  useEffect(() => {
    if (!counting) return;
    const iv = setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [counting]);

  const help = helpOverride ?? helpLevel(activeSeconds, misses);
  return { paused, help, setHelpOverride };
}
