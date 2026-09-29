import { useState } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import type { MissionEvent, MissionState } from '../../mission/types';
import type { AnalysisAssistant } from '../assistant/useAnalysisAssistant';
import type { StationPhase } from './types';

interface Props {
  title: string;
  evidenceId: string;
  mission: Readonly<MissionState>;
  dispatch: (e: MissionEvent) => void;
  phase: StationPhase;
  assistant: AnalysisAssistant;
  /** Registra la evidencia por el mismo camino que la acción humana. */
  onForceEvidence: () => void;
}

/**
 * Controles ocultos de desarrollo (`?dev=true`). No aparecen en la experiencia normal.
 * Los reinicios usan eventos de misión reales: si VÉRTICE está abierto, se reinicia también.
 * (El cambio de tema NO va aquí: DAY/MIDNIGHT es una función normal del producto.)
 */
export function StationDevPanel({ title, evidenceId, mission, dispatch, phase, assistant, onForceEvidence }: Props) {
  const { theme: T } = useTheme();
  const [open, setOpen] = useState(false);
  const btn: React.CSSProperties = { padding: '0.4rem 0.6rem', fontSize: '0.8125rem', borderRadius: 6, border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.card, color: T.INK.primary, cursor: 'pointer', textAlign: 'left' };

  return (
    <div className="fixed" style={{ left: 12, bottom: 12, zIndex: 60, font: '12px Inter Variable, sans-serif' }}>
      {!open ? (
        <button style={{ ...btn, opacity: 0.55 }} onClick={() => setOpen(true)} title="Controles de desarrollo">dev</button>
      ) : (
        <div style={{ width: 280, padding: 12, borderRadius: 10, background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, boxShadow: `0 8px 30px ${T.SURFACE.shadow}`, display: 'grid', gap: 6 }}>
          <div className="flex justify-between items-center">
            <b>{title} · dev</b>
            <button style={btn} onClick={() => setOpen(false)}>Cerrar</button>
          </div>
          <div style={{ color: T.INK.secondary }}>
            Fase: <b>{phase}</b> · Misión: <b>{mission.status}</b><br />
            Evidencia: <b>{mission.discoveredEvidence.join(', ') || '—'}</b>
          </div>
          {mission.status === 'idle' && <button style={btn} onClick={() => dispatch({ type: 'MISSION_START' })}>Iniciar misión (sin VÉRTICE)</button>}
          <button style={btn} disabled={mission.status !== 'running'} onClick={onForceEvidence}>Marcar {evidenceId} como encontrada</button>
          <button style={btn} onClick={() => { dispatch({ type: 'MISSION_RESET' }); dispatch({ type: 'MISSION_START' }); }}>Volver a ACTIVE (reinicia y arranca)</button>
          <button style={btn} onClick={() => dispatch({ type: 'MISSION_RESET' })}>Reiniciar estación (misión → inicio)</button>
          <div style={{ color: T.INK.secondary, borderTop: `1px solid ${T.SURFACE.hairline}`, paddingTop: 6 }}>
            Asistente: mostrado <b>{assistant.state.shownLevel}/{assistant.levels}</b> · disponible <b>{assistant.state.availableLevel}/{assistant.levels}</b><br />
            Sin progreso: <b>{assistant.state.inactiveSeconds}s</b> · fallos: <b>{assistant.state.failedAttempts}</b> · solicitudes: <b>{assistant.state.requestedCount}</b>
          </div>
          <button style={btn} disabled={phase !== 'ACTIVE'} onClick={assistant.forceNext}>Forzar siguiente nivel del asistente</button>
          <button style={btn} disabled={phase !== 'ACTIVE'} onClick={() => assistant.simulateInactivity(60)}>Simular +60 s sin progreso</button>
          <button style={btn} onClick={assistant.reset}>Resetear asistente</button>
        </div>
      )}
    </div>
  );
}
