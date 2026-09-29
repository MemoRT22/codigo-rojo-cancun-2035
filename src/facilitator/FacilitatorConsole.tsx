import { useState, type CSSProperties, type ReactNode } from 'react';
import { useTheme } from '../brand/ThemeContext';
import type { MissionControls } from '../mission/useMission';
import { EVIDENCE_IDS, RESPONSE_PLANS, type EvidenceId, type ResponsePlan } from '../mission/types';
import { NARRATIVE_STATES, type NarrativeState, type SystemEvent } from '../types';
import { fmtTime } from '../world/scenario';
import type { WorldView } from '../world/useWorld';
import { ALERT_LABEL } from './FacilitatorAlert';

// ── VÉRTICE · CONSOLA DE FACILITACIÓN ──
// Vive en la instancia host de VÉRTICE y se muestra en una ventana separada (nunca sobre la LED). Sus acciones usan los
// mecanismos existentes (MissionControls, world, cuenta regresiva); lo que toca a la misión viaja por el MissionTransport.

interface Countdown { seconds: number; display: string; running: boolean; start: () => void; pause: () => void }

interface Props {
  world: WorldView;
  mc: MissionControls;
  countdown: Countdown;
  onScenario: (s: NarrativeState) => void;
  onReset: () => void;
  onAlert: (level: SystemEvent['level'], message: string, durationMs: number | null) => void;
  onClearAlert: () => void;
  alertActive: boolean;
  onFullscreen: () => Promise<boolean>;
}

const SCENARIO: Record<NarrativeState, string> = {
  OPERACION_NORMAL: 'Operación normal',
  ANOMALIA_DETECTADA: 'Anomalía detectada',
  INCIDENTE_ESCALANDO: 'Incidente en escalamiento',
  CORRELACION_ESTABLECIDA: 'Correlación establecida',
  RESPUESTA_AUTORIZADA: 'Respuesta autorizada',
  CONTENCION_EXITOSA: 'Contención exitosa',
  CONTENCION_INCOMPLETA: 'Contención incompleta',
};

const STATIONS: Record<EvidenceId, string> = { 'COR-512': 'Comunicaciones', 'ACC-417': 'Identidad', 'NOD-204': 'Infraestructura', 'AGR-27': 'Inteligencia' };
const PLAN_LABEL: Record<ResponsePlan, string> = { ALFA: 'Alfa · Apagado general', BETA: 'Beta · Contención de identidad', GAMMA: 'Gamma · Aislamiento de inteligencia', DELTA: 'Delta · Contención dirigida' };
const SESSION_LABEL = { idle: 'Esperando', running: 'En curso', paused: 'Pausada', finished: 'Finalizada' } as const;
const SPEEDS = [1, 4, 8, 16];
const LEVELS = ['info', 'warning', 'critical', 'recovery'] as const;
const DURATIONS: { label: string; ms: number | null }[] = [{ label: '4 s', ms: 4000 }, { label: '8 s', ms: 8000 }, { label: 'Persistente', ms: null }];
const PRESETS = [
  'Variación de actividad detectada.',
  'Nueva sesión de identidad detectada.',
  'Actividad fuera de patrón.',
  'Correlación incompleta.',
  'Degradación localizada de servicio.',
  'Validación humana requerida.',
  'Respuesta operativa disponible.',
  'Actividad residual bajo monitoreo.',
  'Servicios estabilizados.',
];
const MAX_CUSTOM = 120;

const btn: CSSProperties = { padding: '7px 10px', fontSize: 13, borderRadius: 7, border: '1px solid #D2DAE4', background: '#fff', color: '#2C3E57', cursor: 'pointer', font: 'inherit', fontWeight: 560 };
const on: CSSProperties = { background: '#E4EDFD', borderColor: '#2E6FE6', color: '#153E8A' };
const primary: CSSProperties = { ...btn, background: '#2E6FE6', borderColor: '#2E6FE6', color: '#fff', fontWeight: 700 };
const warnBtn: CSSProperties = { ...btn, background: '#FFF7E6', borderColor: '#E8A020', color: '#7A4E00' };
const dangerBtn: CSSProperties = { ...btn, background: '#FDECEC', borderColor: '#D94040', color: '#8E1F1F', fontWeight: 700 };
const dis = (s: CSSProperties, d: boolean): CSSProperties => (d ? { ...s, opacity: 0.45, cursor: 'default' } : s);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #DFE5EC', borderRadius: 12, padding: '14px 16px' }}>
      <h2 style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6D86' }}>{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value, tone }: { label: string; value: ReactNode; tone?: 'ok' | 'muted' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '3px 0', fontSize: 13 }}>
      <span style={{ color: '#5A6D86' }}>{label}</span>
      <span style={{ fontWeight: 650, color: tone === 'ok' ? '#177245' : tone === 'muted' ? '#93A2B5' : '#0E1D33' }}>{value}</span>
    </div>
  );
}

export function FacilitatorConsole({ world, mc, countdown, onScenario, onReset, onAlert, onClearAlert, alertActive, onFullscreen }: Props) {
  const { mode, setMode } = useTheme();
  const { mission } = mc;
  const [confirmReset, setConfirmReset] = useState(false);
  const [level, setLevel] = useState<SystemEvent['level']>('warning');
  const [duration, setDuration] = useState<number | null>(8000);
  const [custom, setCustom] = useState('');
  const [fsHint, setFsHint] = useState(false);

  const status = mission.status;
  const cdState = countdown.seconds === 0 ? 'agotado' : countdown.running ? 'corriendo' : 'detenido';

  return (
    <div style={{ font: '13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif', color: '#0E1D33', padding: 14, display: 'grid', gap: 12 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#5A6D86' }}>VÉRTICE</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 19, fontWeight: 650 }}>Consola de facilitación</h1>
        </div>
      </header>

      {/* A · Sesión */}
      <Section title="Sesión">
        <Row label="Estado" value={SESSION_LABEL[status]} tone={status === 'running' ? 'ok' : undefined} />
        <Row label="Hora simulada" value={fmtTime(world.clock)} />
        <Row label="Tiempo restante" value={countdown.display} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
          <button style={dis(primary, status !== 'idle')} disabled={status !== 'idle'} onClick={mc.startMission}>INICIAR EXPERIENCIA</button>
          <button style={dis(warnBtn, status !== 'running')} disabled={status !== 'running'} onClick={mc.pauseMission}>PAUSAR</button>
          <button style={dis(btn, status !== 'paused')} disabled={status !== 'paused'} onClick={mc.resumeMission}>REANUDAR</button>
          <button style={dangerBtn} onClick={() => setConfirmReset(true)}>RESTABLECER SESIÓN</button>
        </div>
        {confirmReset && (
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: '#FDECEC', border: '1px solid #E9A3A3' }}>
            <div style={{ fontWeight: 650 }}>¿Restablecer toda la sesión?</div>
            <div style={{ color: '#7A3A3A', fontSize: 12, margin: '2px 0 8px' }}>Vuelve todo a operación normal y las estaciones a su puesto preparado.</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={btn} onClick={() => setConfirmReset(false)}>CANCELAR</button>
              <button style={dangerBtn} onClick={() => { setConfirmReset(false); onReset(); }}>RESTABLECER</button>
            </div>
          </div>
        )}
      </Section>

      {/* B · Estado de la investigación */}
      <Section title="Estado de la investigación">
        {EVIDENCE_IDS.map((id) => {
          const found = mission.discoveredEvidence.includes(id);
          return <Row key={id} label={`${STATIONS[id]} · ${id}`} value={found ? 'encontrada' : 'pendiente'} tone={found ? 'ok' : 'muted'} />;
        })}
        <div style={{ borderTop: '1px solid #E7ECF2', margin: '6px 0' }} />
        <Row label="Correlación final" value={mission.finalCorrelationValidated ? 'validada' : 'pendiente'} tone={mission.finalCorrelationValidated ? 'ok' : 'muted'} />
        <Row label="Respuesta" value={mission.responseUnlocked ? 'autorizada' : 'bloqueada'} tone={mission.responseUnlocked ? 'ok' : 'muted'} />
        <Row label="Plan seleccionado" value={mission.selectedPlan ?? '—'} />
        <Row label="Desenlace" value={mission.outcome === 'contained' ? 'contención exitosa' : mission.outcome === 'incomplete' ? 'contención incompleta' : '—'} />
        {mission.failedCorrelationAttempts > 0 && <Row label="Intentos de correlación fallidos" value={mission.failedCorrelationAttempts} />}
      </Section>

      {/* C · Control de escenario */}
      <Section title="Control de escenario">
        <div style={{ marginBottom: 8, fontSize: 12, color: '#5A6D86' }}>Estado actual: <b style={{ color: '#0E1D33' }}>{SCENARIO[world.state]}</b></div>
        <div style={{ display: 'grid', gap: 5 }}>
          {NARRATIVE_STATES.map((s) => (
            <button key={s} style={{ ...btn, textAlign: 'left', ...(s === world.state ? on : {}) }} onClick={() => onScenario(s)}>{SCENARIO[s].toUpperCase()}</button>
          ))}
        </div>
      </Section>

      {/* D · Alertas VÉRTICE */}
      <Section title="Alertas VÉRTICE">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {LEVELS.map((l) => <button key={l} style={{ ...btn, ...(l === level ? on : {}) }} onClick={() => setLevel(l)}>{ALERT_LABEL[l]}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#5A6D86', fontSize: 12 }}>Duración</span>
          {DURATIONS.map((d) => <button key={d.label} style={{ ...btn, ...(d.ms === duration ? on : {}) }} onClick={() => setDuration(d.ms)}>{d.label}</button>)}
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {PRESETS.map((p) => <button key={p} style={{ ...btn, textAlign: 'left' }} onClick={() => onAlert(level, p, duration)}>{p}</button>)}
        </div>
        <label style={{ display: 'block', marginTop: 10, fontSize: 12, color: '#5A6D86' }}>
          Mensaje personalizado ({custom.length}/{MAX_CUSTOM})
          <input
            value={custom}
            maxLength={MAX_CUSTOM}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Texto plano, sin HTML"
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 4, padding: '8px 10px', borderRadius: 7, border: '1px solid #D2DAE4', font: 'inherit', color: '#0E1D33' }}
          />
        </label>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button style={dis(primary, !custom.trim())} disabled={!custom.trim()} onClick={() => { onAlert(level, custom.trim(), duration); setCustom(''); }}>MOSTRAR ALERTA</button>
          <button style={dis(btn, !alertActive)} disabled={!alertActive} onClick={onClearAlert}>Ocultar alerta</button>
        </div>
      </Section>

      {/* E · Velocidad */}
      <Section title="Velocidad del reloj simulado">
        <div style={{ display: 'flex', gap: 5 }}>
          {SPEEDS.map((s) => <button key={s} style={{ ...btn, flex: 1, ...(s === world.speed ? on : {}) }} onClick={() => world.setSpeed(s)}>×{s}</button>)}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#7B8DA5' }}>Sesión real: ×1. Los demás valores son para ensayo.</div>
      </Section>

      {/* F · Cuenta regresiva */}
      <Section title="Cuenta regresiva">
        <Row label="Tiempo" value={countdown.display} />
        <Row label="Estado" value={cdState} />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button style={dis(warnBtn, !countdown.running)} disabled={!countdown.running} onClick={countdown.pause}>PAUSAR</button>
          <button style={dis(btn, countdown.running || countdown.seconds === 0)} disabled={countdown.running || countdown.seconds === 0} onClick={countdown.start}>REANUDAR</button>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#7B8DA5' }}>Arranca sola con la anomalía; aquí solo se detiene o se reanuda.</div>
      </Section>

      {/* G · Tema y presentación */}
      <Section title="Tema y presentación">
        <div style={{ display: 'flex', gap: 5 }}>
          <button style={{ ...btn, flex: 1, ...(mode === 'day' ? on : {}) }} onClick={() => setMode('day')}>DAY</button>
          <button style={{ ...btn, flex: 1, ...(mode === 'midnight' ? on : {}) }} onClick={() => setMode('midnight')}>MIDNIGHT</button>
          <button style={{ ...btn, flex: 1.4 }} onClick={async () => setFsHint(!(await onFullscreen()))}>PANTALLA COMPLETA</button>
        </div>
        {fsHint && <div style={{ marginTop: 6, fontSize: 12, color: '#7A4E00' }}>El navegador no permite activarla desde esta ventana: pulsa F en la ventana de VÉRTICE.</div>}
      </Section>

      {/* H · Ensayo / contingencia */}
      <details style={{ background: '#fff', border: '1px solid #DFE5EC', borderRadius: 12, padding: '12px 16px' }}>
        <summary style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A6D86' }}>Ensayo / contingencia</summary>
        <div style={{ marginTop: 10, fontSize: 12, color: '#7B8DA5' }}>Atajos que se saltan el flujo real. Úsalos solo para ensayar o resolver una contingencia.</div>
        <div style={{ display: 'grid', gap: 5, marginTop: 8 }}>
          {EVIDENCE_IDS.map((id) => {
            const found = mission.discoveredEvidence.includes(id);
            return (
              <button key={id} style={dis({ ...btn, textAlign: 'left' }, found || status !== 'running')} disabled={found || status !== 'running'} onClick={() => mc.discoverEvidence(id, 'control')}>
                {found ? '✓ ' : ''}Registrar evidencia de prueba · {id} ({STATIONS[id]})
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gap: 5, marginTop: 10 }}>
          <button style={dis({ ...btn, textAlign: 'left' }, status !== 'running' || mission.finalCorrelationValidated)} disabled={status !== 'running' || mission.finalCorrelationValidated} onClick={() => mc.submitCorrelation('COR-512', 'ACC-417', 'NOD-204', 'AGR-27')}>
            Validar correlación canónica
          </button>
          <button style={dis({ ...btn, textAlign: 'left' }, !mission.finalCorrelationValidated || mission.responseUnlocked)} disabled={!mission.finalCorrelationValidated || mission.responseUnlocked} onClick={() => mc.dispatch({ type: 'RESPONSE_UNLOCKED' })}>
            Autorizar respuesta (ensayo)
          </button>
        </div>
        <div style={{ display: 'grid', gap: 5, marginTop: 10, opacity: mission.responseUnlocked ? 1 : 0.45 }}>
          {RESPONSE_PLANS.map((p) => (
            <button key={p} style={{ ...btn, textAlign: 'left', ...(mission.selectedPlan === p ? on : {}) }} disabled={!mission.responseUnlocked || !!mission.outcome} onClick={() => mc.selectPlan(p)}>{PLAN_LABEL[p]}</button>
          ))}
          {mission.selectedPlan && !mission.outcome && <button style={dangerBtn} onClick={mc.confirmPlan}>EJECUTAR PLAN {mission.selectedPlan}</button>}
        </div>
      </details>

      <div style={{ fontSize: 11, color: '#93A2B5' }}>Atajos en VÉRTICE: D consola · M tema · F pantalla completa.</div>
    </div>
  );
}
