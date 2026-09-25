import { useState } from 'react';
import type { NarrativeState } from '../types';
import { NARRATIVE_STATES } from '../types';

const STATE_LABELS: Record<NarrativeState, string> = {
  OPERACION_NORMAL: '1 — Operación Normal',
  ANOMALIA_DETECTADA: '2 — Anomalía Detectada',
  INCIDENTE_ESCALANDO: '3 — Incidente Escalando',
  CORRELACION_ESTABLECIDA: '4 — Correlación Establecida',
  RESPUESTA_AUTORIZADA: '5 — Respuesta Autorizada',
  CONTENCION_EXITOSA: '6 — Contención Exitosa',
  CONTENCION_INCOMPLETA: '7 — Contención Incompleta',
};

const PRESET_EVENTS = [
  'Sincronización de servicios completada',
  'Variación de actividad en servicio interno',
  'Nueva sesión de identidad detectada',
  'Conexiones anómalas hacia servicios asociados',
  'Propagación entre servicios detectada',
  'Sesión revocada',
  'Nodo aislado',
  'Correlación de comportamiento en análisis',
];

interface Props {
  currentState: NarrativeState;
  timerRunning: boolean;
  timerDisplay: string;
  onStateChange: (state: NarrativeState) => void;
  onReset: () => void;
  onTimerToggle: () => void;
  onTimerReset: () => void;
  onInjectEvent: (message: string, level: 'info' | 'warning' | 'critical') => void;
}

export function DevPanel({
  currentState, timerRunning, timerDisplay,
  onStateChange, onReset, onTimerToggle, onTimerReset, onInjectEvent,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [customEvent, setCustomEvent] = useState('');
  const [eventLevel, setEventLevel] = useState<'info' | 'warning' | 'critical'>('info');

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-2 right-2 z-50 w-6 h-6 rounded bg-vertice-panel/60 border border-vertice-border/30 text-vertice-text-muted text-[8px] hover:bg-vertice-panel hover:border-vertice-border transition-colors"
        title="Panel de desarrollo (D)"
      >
        D
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-[340px] max-h-[90vh] overflow-y-auto bg-vertice-bg/95 backdrop-blur-md border-l border-t border-vertice-border rounded-tl-lg shadow-2xl">
      <div className="flex items-center justify-between px-3 py-2 border-b border-vertice-border">
        <span className="text-[10px] font-mono uppercase tracking-wider text-vertice-text-muted">
          Desarrollo
        </span>
        <button
          onClick={() => setVisible(false)}
          className="text-vertice-text-muted hover:text-vertice-text text-xs"
        >
          Cerrar
        </button>
      </div>

      <div className="p-3 space-y-4">
        {/* Current state */}
        <div>
          <div className="text-[9px] uppercase tracking-wider text-vertice-text-muted mb-2">
            Estado narrativo
          </div>
          <div className="space-y-1">
            {NARRATIVE_STATES.map((s) => (
              <button
                key={s}
                onClick={() => onStateChange(s)}
                className={`block w-full text-left px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  s === currentState
                    ? 'bg-vertice-accent/20 text-vertice-accent-bright border border-vertice-accent/40'
                    : 'text-vertice-text-muted hover:bg-vertice-panel hover:text-vertice-text'
                }`}
              >
                {STATE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div>
          <div className="text-[9px] uppercase tracking-wider text-vertice-text-muted mb-2">
            Cronómetro: {timerDisplay}
          </div>
          <div className="flex gap-1">
            <button onClick={onTimerToggle}
              className="flex-1 px-2 py-1 text-[10px] font-mono rounded bg-vertice-panel border border-vertice-border text-vertice-text-muted hover:text-vertice-text hover:border-vertice-accent/40 transition-colors">
              {timerRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button onClick={onTimerReset}
              className="flex-1 px-2 py-1 text-[10px] font-mono rounded bg-vertice-panel border border-vertice-border text-vertice-text-muted hover:text-vertice-text hover:border-vertice-accent/40 transition-colors">
              Reiniciar
            </button>
          </div>
        </div>

        {/* Event injection */}
        <div>
          <div className="text-[9px] uppercase tracking-wider text-vertice-text-muted mb-2">
            Inyectar evento
          </div>
          <div className="flex gap-1 mb-2">
            {(['info', 'warning', 'critical'] as const).map((lvl) => {
              const label = lvl === 'info' ? 'Información' : lvl === 'warning' ? 'Alerta' : 'Crítico';
              return (
                <button
                  key={lvl}
                  onClick={() => setEventLevel(lvl)}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                    eventLevel === lvl
                      ? 'bg-vertice-accent/20 text-vertice-accent-bright border border-vertice-accent/40'
                      : 'text-vertice-text-muted bg-vertice-panel border border-vertice-border hover:text-vertice-text'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="space-y-1 mb-2">
            {PRESET_EVENTS.map((evt) => (
              <button
                key={evt}
                onClick={() => onInjectEvent(evt, eventLevel)}
                className="block w-full text-left px-2 py-1 text-[10px] text-vertice-text-muted hover:text-vertice-text hover:bg-vertice-panel rounded transition-colors"
              >
                {evt}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customEvent.trim()) {
                  onInjectEvent(customEvent.trim(), eventLevel);
                  setCustomEvent('');
                }
              }}
              placeholder="Evento personalizado..."
              className="flex-1 px-2 py-1 text-[10px] font-mono rounded bg-vertice-surface border border-vertice-border text-vertice-text placeholder:text-vertice-text-muted/40 focus:border-vertice-accent/40 focus:outline-none"
            />
            <button
              onClick={() => {
                if (customEvent.trim()) {
                  onInjectEvent(customEvent.trim(), eventLevel);
                  setCustomEvent('');
                }
              }}
              className="px-2 py-1 text-[10px] font-mono rounded bg-vertice-panel border border-vertice-border text-vertice-text-muted hover:text-vertice-text hover:border-vertice-accent/40 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <div className="text-[9px] uppercase tracking-wider text-vertice-text-muted mb-2">
            Acciones
          </div>
          <div className="flex gap-1">
            <button onClick={onReset}
              className="flex-1 px-2 py-1 text-[10px] font-mono rounded bg-vertice-panel border border-vertice-border text-vertice-text-muted hover:text-vertice-text hover:border-vertice-warning/40 transition-colors">
              Reiniciar todo (R)
            </button>
            <button onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen().catch(() => {});
            }}
              className="flex-1 px-2 py-1 text-[10px] font-mono rounded bg-vertice-panel border border-vertice-border text-vertice-text-muted hover:text-vertice-text hover:border-vertice-accent/40 transition-colors">
              Pantalla completa (F)
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts reference */}
        <div className="text-[8px] text-vertice-text-muted/50 space-y-0.5">
          <div>1–7: cambiar estado &middot; R: reiniciar &middot; F: pantalla completa</div>
          <div>D: mostrar/ocultar este panel &middot; Espacio: pausar/continuar</div>
        </div>
      </div>
    </div>
  );
}
