import { useState } from 'react';
import type { NarrativeState, SystemEvent } from '../types';
import { NARRATIVE_STATES } from '../types';
import { fmtTime } from '../world/scenario';

// Panel de facilitación/desarrollo. No forma parte de la LED: se abre con «D» y no se muestra en sala.

const STATE_LABELS: Record<NarrativeState, string> = {
  OPERACION_NORMAL: '1 · Operación normal',
  ANOMALIA_DETECTADA: '2 · Anomalía detectada',
  INCIDENTE_ESCALANDO: '3 · Incidente en escalamiento',
  CORRELACION_ESTABLECIDA: '4 · Correlación establecida',
  RESPUESTA_AUTORIZADA: '5 · Respuesta autorizada',
  CONTENCION_EXITOSA: '6 · Contención exitosa',
  CONTENCION_INCOMPLETA: '7 · Contención incompleta',
};

const PRESET_EVENTS = [
  'Sincronización de servicios completada',
  'Variación de actividad en servicio interno',
  'Nueva sesión de identidad detectada',
  'Sesión revocada',
];

const SPEEDS = [1, 4, 8, 16];

interface Props {
  visible: boolean;
  onClose: () => void;
  state: NarrativeState;
  clock: number;
  speed: number;
  timerRunning: boolean;
  timerDisplay: string;
  onStateChange: (s: NarrativeState) => void;
  onReset: () => void;
  onSpeed: (n: number) => void;
  onTimerToggle: () => void;
  onInjectEvent: (message: string, level: SystemEvent['level']) => void;
}

const btn: React.CSSProperties = {
  padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #D8E0E9', background: '#fff', color: '#3F5169', cursor: 'pointer',
};

export function DevPanel({ visible, onClose, state, clock, speed, timerRunning, timerDisplay, onStateChange, onReset, onSpeed, onTimerToggle, onInjectEvent }: Props) {
  const [level, setLevel] = useState<SystemEvent['level']>('info');
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', right: 0, bottom: 0, width: 320, maxHeight: '92vh', overflowY: 'auto', background: 'rgba(255,255,255,0.97)', border: '1px solid #D8E0E9', borderRadius: '10px 0 0 0', boxShadow: '0 -4px 30px rgba(14,29,51,0.18)', zIndex: 50, font: '12px Inter Variable, sans-serif', color: '#0E1D33' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #E3E9F0' }}>
        <b>Facilitación · {fmtTime(clock)}</b>
        <button style={btn} onClick={onClose}>Cerrar</button>
      </div>
      <div style={{ padding: 12, display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          {NARRATIVE_STATES.map((s) => (
            <button key={s} onClick={() => onStateChange(s)} style={{ ...btn, textAlign: 'left', background: s === state ? '#E8F0FE' : '#fff', borderColor: s === state ? '#1B5FE4' : '#D8E0E9' }}>
              {STATE_LABELS[s]}
            </button>
          ))}
        </div>
        <div>
          <div style={{ marginBottom: 6, color: '#6B7C92' }}>Velocidad del reloj simulado</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {SPEEDS.map((s) => (
              <button key={s} onClick={() => onSpeed(s)} style={{ ...btn, flex: 1, background: s === speed ? '#E8F0FE' : '#fff' }}>×{s}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 6, color: '#6B7C92' }}>Cuenta regresiva: {timerDisplay}</div>
          <button style={btn} onClick={onTimerToggle}>{timerRunning ? 'Pausar' : 'Iniciar'} (Espacio)</button>
        </div>
        <div>
          <div style={{ marginBottom: 6, color: '#6B7C92' }}>Inyectar evento</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {(['info', 'warning', 'critical', 'recovery'] as const).map((l) => (
              <button key={l} style={{ ...btn, background: l === level ? '#E8F0FE' : '#fff' }} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {PRESET_EVENTS.map((e) => <button key={e} style={{ ...btn, textAlign: 'left' }} onClick={() => onInjectEvent(e, level)}>{e}</button>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ ...btn, flex: 1 }} onClick={onReset}>Restablecer (R)</button>
          <button style={{ ...btn, flex: 1 }} onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}))}>Pantalla completa (F)</button>
        </div>
        <div style={{ color: '#93A2B5' }}>1–7 estado · R restablecer · F pantalla completa · D panel · Espacio cuenta regresiva</div>
      </div>
    </div>
  );
}
