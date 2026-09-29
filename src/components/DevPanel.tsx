import { useState } from 'react';
import type { NarrativeState, SystemEvent } from '../types';
import { NARRATIVE_STATES } from '../types';
import { fmtTime } from '../world/scenario';
import type { WorldView } from '../world/useWorld';
import type { MissionControls } from '../mission/useMission';
import { EVIDENCE_IDS, RESPONSE_PLANS, type EvidenceId, type ResponsePlan } from '../mission/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  world: WorldView;
  mc: MissionControls;
  countdown: { display: string; running: boolean; toggle: () => void };
  onManualOverride: (s: NarrativeState) => void;
}

const STATE_LABELS: Record<NarrativeState, string> = {
  OPERACION_NORMAL: '1 · Operación normal',
  ANOMALIA_DETECTADA: '2 · Anomalía detectada',
  INCIDENTE_ESCALANDO: '3 · Incidente en escalamiento',
  CORRELACION_ESTABLECIDA: '4 · Correlación establecida',
  RESPUESTA_AUTORIZADA: '5 · Respuesta autorizada',
  CONTENCION_EXITOSA: '6 · Contención exitosa',
  CONTENCION_INCOMPLETA: '7 · Contención incompleta',
};

const EVIDENCE_SOURCES: Record<EvidenceId, { label: string }> = {
  'COR-512': { label: 'COR-512 (Comunicaciones)' },
  'ACC-417': { label: 'ACC-417 (Identidad)' },
  'NOD-204': { label: 'NOD-204 (Infraestructura)' },
  'AGR-27': { label: 'AGR-27 (Inteligencia)' },
};

const PLAN_LABELS: Record<ResponsePlan, string> = {
  ALFA: 'Alfa · Apagado general',
  BETA: 'Beta · Contención de identidad',
  GAMMA: 'Gamma · Aislamiento de inteligencia',
  DELTA: 'Delta · Contención dirigida',
};

const SPEEDS = [1, 4, 8, 16];

const PRESET_EVENTS = [
  'Sincronización de servicios completada',
  'Variación de actividad en servicio interno',
  'Nueva sesión de identidad detectada',
  'Sesión revocada',
];

const btn: React.CSSProperties = {
  padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #D8E0E9', background: '#fff', color: '#3F5169', cursor: 'pointer',
};

const btnActive: React.CSSProperties = { ...btn, background: '#E8F0FE', borderColor: '#1B5FE4' };

const btnGreen: React.CSSProperties = { ...btn, background: '#E6F9ED', borderColor: '#22C55E', color: '#166534' };

const btnRed: React.CSSProperties = { ...btn, background: '#FEF2F2', borderColor: '#EF4444', color: '#991B1B' };

const btnAmber: React.CSSProperties = { ...btn, background: '#FFFBEB', borderColor: '#F59E0B', color: '#92400E' };

const section: React.CSSProperties = { borderTop: '1px solid #E3E9F0', paddingTop: 10 };

const heading: React.CSSProperties = { marginBottom: 6, color: '#6B7C92', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' };

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: active ? '#DCFCE7' : '#F3F4F6', color: active ? '#166534' : '#9CA3AF', fontWeight: 600 }}>
      {label}
    </span>
  );
}

export function DevPanel({ visible, onClose, world, mc, countdown, onManualOverride }: Props) {
  const [level, setLevel] = useState<SystemEvent['level']>('info');
  const { mission } = mc;

  if (!visible) return null;

  const missionLabel = {
    idle: 'Esperando',
    running: 'En curso',
    paused: 'Pausada',
    finished: 'Finalizada',
  }[mission.status];

  return (
    <div style={{ position: 'fixed', right: 0, bottom: 0, width: 360, maxHeight: '96vh', overflowY: 'auto', background: 'rgba(255,255,255,0.97)', border: '1px solid #D8E0E9', borderRadius: '10px 0 0 0', boxShadow: '0 -4px 30px rgba(14,29,51,0.18)', zIndex: 50, font: '12px Inter Variable, sans-serif', color: '#0E1D33' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid #E3E9F0' }}>
        <b>Facilitación · {fmtTime(world.clock)}</b>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: mission.status === 'running' ? '#DCFCE7' : mission.status === 'paused' ? '#FFFBEB' : '#F3F4F6', color: mission.status === 'running' ? '#166534' : mission.status === 'paused' ? '#92400E' : '#6B7280', fontWeight: 600 }}>
            {missionLabel}
          </span>
          <button style={btn} onClick={onClose}>Cerrar</button>
        </div>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 14 }}>
        {/* ── Misión ── */}
        <div>
          <div style={heading}>Misión</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {mission.status === 'idle' && (
              <button style={{ ...btnGreen, flex: 1, fontSize: 14, padding: '8px 12px', fontWeight: 700 }} onClick={mc.startMission}>
                INICIAR EXPERIENCIA
              </button>
            )}
            {mission.status === 'running' && (
              <button style={{ ...btnAmber, flex: 1 }} onClick={mc.pauseMission}>Pausar</button>
            )}
            {mission.status === 'paused' && (
              <button style={{ ...btnGreen, flex: 1 }} onClick={mc.resumeMission}>Reanudar</button>
            )}
            <button style={{ ...btn, flex: 1 }} onClick={mc.resetMission}>Restablecer</button>
          </div>
          <button
            style={{ ...btn, width: '100%', marginTop: 6, textAlign: 'left' }}
            onClick={() => window.open('/station/comunicaciones', '_blank')}
          >
            Abrir estación Comunicaciones (nueva pestaña) ↗
          </button>
          <button
            style={{ ...btn, width: '100%', marginTop: 4, textAlign: 'left' }}
            onClick={() => window.open('/station/identidad', '_blank')}
          >
            Abrir estación Identidad (nueva pestaña) ↗
          </button>
          <button
            style={{ ...btn, width: '100%', marginTop: 4, textAlign: 'left' }}
            onClick={() => window.open('/station/infraestructura', '_blank')}
          >
            Abrir estación Infraestructura (nueva pestaña) ↗
          </button>
          <button
            style={{ ...btn, width: '100%', marginTop: 4, textAlign: 'left' }}
            onClick={() => window.open('/station/inteligencia', '_blank')}
          >
            Abrir estación Inteligencia (nueva pestaña) ↗
          </button>
        </div>

        {/* ── Evidencias ── */}
        <div style={section}>
          <div style={heading}>Forzar evidencia (solo pruebas)</div>
          <div style={{ color: '#93A2B5', marginBottom: 6 }}>
            Flujo normal: cada evidencia la registra su estación. Esto es un atajo que se salta el flujo real.
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {EVIDENCE_IDS.map((id) => {
              const info = EVIDENCE_SOURCES[id];
              const found = mission.discoveredEvidence.includes(id);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    style={found ? { ...btnGreen, flex: 1, textAlign: 'left' } : { ...btn, flex: 1, textAlign: 'left' }}
                    onClick={() => !found && mc.discoverEvidence(id, 'control')}
                    disabled={found}
                  >
                    {found ? '\u2713 ' : ''}{info.label}
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <StatusBadge label="Correlación de identidad" active={mission.identityCorrelationEstablished} />
            <StatusBadge label="Correlación final" active={mission.finalCorrelationValidated} />
            <StatusBadge label="Respuesta desbloqueada" active={mission.responseUnlocked} />
            {mission.failedCorrelationAttempts > 0 && (
              <span style={{ fontSize: 11, color: '#DC2626' }}>Intentos fallidos: {mission.failedCorrelationAttempts}</span>
            )}
          </div>
        </div>

        {/* ── Correlación final ── */}
        <div style={section}>
          <div style={heading}>Simular correlación final</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{ ...btnGreen, flex: 1 }} onClick={() => mc.submitCorrelation('COR-512', 'ACC-417', 'NOD-204', 'AGR-27')}>
              Correcta
            </button>
            <button style={{ ...btnRed, flex: 1 }} onClick={() => mc.submitCorrelation('COR-512', 'ACC-417', 'NOD-204', 'AGR-31')}>
              Incorrecta
            </button>
          </div>
        </div>

        {/* ── Plan de respuesta ── */}
        <div style={section}>
          <div style={heading}>Plan de respuesta</div>
          <div style={{ display: 'grid', gap: 4, opacity: mission.responseUnlocked ? 1 : 0.4 }}>
            {RESPONSE_PLANS.map((plan) => (
              <button
                key={plan}
                style={mission.selectedPlan === plan ? btnActive : btn}
                onClick={() => mc.selectPlan(plan)}
                disabled={!mission.responseUnlocked}
              >
                {PLAN_LABELS[plan]}
              </button>
            ))}
          </div>
          {mission.selectedPlan && !mission.outcome && (
            <button
              style={{ ...btnRed, width: '100%', marginTop: 6, fontSize: 13, fontWeight: 700, padding: '6px 12px' }}
              onClick={mc.confirmPlan}
            >
              CONFIRMAR: {mission.selectedPlan}
            </button>
          )}
          {mission.outcome && (
            <div style={{ marginTop: 6, fontWeight: 700, color: mission.outcome === 'contained' ? '#166534' : '#991B1B' }}>
              {mission.outcome === 'contained' ? 'CONTENCION EXITOSA' : 'CONTENCION INCOMPLETA'}
            </div>
          )}
          {mission.timedOut && (
            <div style={{ marginTop: 4, fontWeight: 600, color: '#92400E' }}>TIEMPO AGOTADO</div>
          )}
        </div>

        {/* ── Override manual (estados narrativos) ── */}
        <div style={section}>
          <div style={heading}>Override manual (estados)</div>
          <div style={{ display: 'grid', gap: 4 }}>
            {NARRATIVE_STATES.map((s) => (
              <button key={s} onClick={() => onManualOverride(s)} style={{ ...btn, textAlign: 'left', background: s === world.state ? '#E8F0FE' : '#fff', borderColor: s === world.state ? '#1B5FE4' : '#D8E0E9' }}>
                {STATE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Velocidad ── */}
        <div style={section}>
          <div style={heading}>Velocidad del reloj simulado</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {SPEEDS.map((s) => (
              <button key={s} onClick={() => world.setSpeed(s)} style={{ ...btn, flex: 1, background: s === world.speed ? '#E8F0FE' : '#fff' }}>\u00D7{s}</button>
            ))}
          </div>
        </div>

        {/* ── Timer ── */}
        <div style={section}>
          <div style={heading}>Cuenta regresiva: {countdown.display}</div>
          <button style={btn} onClick={countdown.toggle}>{countdown.running ? 'Pausar' : 'Iniciar'} (Espacio)</button>
        </div>

        {/* ── Inyectar evento ── */}
        <div style={section}>
          <div style={heading}>Inyectar evento</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {(['info', 'warning', 'critical', 'recovery'] as const).map((l) => (
              <button key={l} style={l === level ? btnActive : btn} onClick={() => setLevel(l)}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            {PRESET_EVENTS.map((e) => <button key={e} style={{ ...btn, textAlign: 'left' }} onClick={() => world.inject(e, level)}>{e}</button>)}
          </div>
        </div>

        {/* ── Atajos ── */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ ...btn, flex: 1 }} onClick={mc.resetMission}>Restablecer (R)</button>
          <button style={{ ...btn, flex: 1 }} onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}))}>Pantalla completa (F)</button>
        </div>
        <div style={{ color: '#93A2B5' }}>1\u20137 override manual \u00B7 R restablecer \u00B7 F pantalla \u00B7 D panel \u00B7 M tema \u00B7 Espacio timer</div>
      </div>
    </div>
  );
}
