import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTheme } from '../brand/ThemeContext';
import { VerticeBrand } from '../brand/VerticeLogo';
import { W, H } from '../map/scene';
import { EVIDENCE_IDS, type ResponsePlan } from '../mission/types';
import type { MissionControls } from '../mission/useMission';
import { LOCK_FIELDS, OUTCOMES, PLANS, PLAN_MAP, normalizeId, type LockKey, type OutcomeRow, type Stage } from '../stations/response/logic';
import { planName } from '../stations/response/ResponsePlans';
import { useResponseFlow } from '../stations/response/useResponseFlow';

// ── VÉRTICE · CONSOLA DE RESPUESTA (pantalla LED) ──
//
// Segunda presentación del MISMO flujo de `/station/respuesta` (misma lógica, mismos eventos, mismo contenido de planes y consecuencias):
// cuando las cuatro evidencias están reunidas, el Centro de Operaciones «cambia de modo» y el equipo se reúne frente a la LED.
// Todo se DERIVA de MissionState; solo la introducción de 3 s y el «ya lo leímos» del desenlace son estado local de presentación.
// Se dibuja sobre el mapa (que queda como fondo atenuado) en el lienzo 1920×1080 de la LED.

const INTRO_MS = 3200;
const STEPS: { stage: Stage[]; label: string }[] = [
  { stage: ['lock'], label: 'Correlación' },
  { stage: ['pending'], label: 'Autorización' },
  { stage: ['plans'], label: 'Planes' },
  { stage: ['confirm'], label: 'Confirmación' },
  { stage: ['outcome'], label: 'Consecuencia' },
];

export function ResponseStage({ mc, countdown }: { mc: MissionControls; countdown: string | null }) {
  const { theme: T } = useTheme();
  const { mission, dispatch } = mc;
  const flow = useResponseFlow(mission, dispatch);
  const { stage, reviewing } = flow;

  const allEvidence = EVIDENCE_IDS.every((id) => mission.discoveredEvidence.includes(id));
  const [intro, setIntro] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const hadAll = useRef(false);

  // La cuarta evidencia dispara el momento de transición (una sola vez por sesión).
  useEffect(() => {
    if (allEvidence && !hadAll.current && mission.status === 'running') setIntro(true);
    hadAll.current = allEvidence;
  }, [allEvidence, mission.status]);
  useEffect(() => {
    if (!intro) return;
    const t = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(t);
  }, [intro]);

  // Reset (o sesión nueva): se limpia toda la presentación local.
  const { reset } = flow;
  useEffect(() => {
    if (mission.status === 'idle' || (!allEvidence && !mission.finalCorrelationValidated && !mission.outcome)) {
      reset(); setAcknowledged(false); setIntro(false);
    }
  }, [mission.status, allEvidence, mission.finalCorrelationValidated, mission.outcome, reset]);

  const engaged = mission.status !== 'idle' && (allEvidence || mission.finalCorrelationValidated || !!mission.selectedPlan || !!mission.outcome);
  const visible = engaged && !(mission.outcome && acknowledged);
  if (!visible) return null;

  const paused = mission.status === 'paused';
  const chosen = mission.selectedPlan ? PLAN_MAP.get(mission.selectedPlan) : undefined;
  const label: React.CSSProperties = { fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: T.INK.secondary, textTransform: 'uppercase' };

  const Btn = ({ primary, disabled, onClick, children }: { primary?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 92, padding: '0 64px', borderRadius: 18, fontSize: 32, fontWeight: 660, letterSpacing: '0.03em', cursor: disabled ? 'default' : 'pointer',
        background: primary && !disabled ? T.BRAND.blue : 'transparent', color: primary && !disabled ? '#fff' : disabled ? T.INK.faint : T.INK.primary,
        border: `2px solid ${primary && !disabled ? T.BRAND.blue : T.SURFACE.hairline}`, boxShadow: primary && !disabled ? `0 8px 28px ${T.BRAND.blue}44` : 'none',
      }}
    >
      {children}
    </button>
  );

  const chain = (
    <div className="flex items-center justify-center" style={{ gap: 28 }}>
      {LOCK_FIELDS.map((f, i) => (
        <div key={f.key} className="flex items-center" style={{ gap: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...label, fontSize: 18 }}>{f.label}</div>
            <div style={{ fontSize: 44, fontWeight: 650, letterSpacing: '0.04em', marginTop: 6 }}>{EVIDENCE_IDS[i]}</div>
          </div>
          {i < LOCK_FIELDS.length - 1 && <span aria-hidden style={{ fontSize: 44, color: T.INK.faint }}>→</span>}
        </div>
      ))}
    </div>
  );

  let body: ReactNode;
  if (intro) {
    body = (
      <div className="flex flex-col items-center justify-center text-center" style={{ height: '100%' }} onClick={() => setIntro(false)}>
        <div className="animate-fade-in-up" style={{ ...label, fontSize: 30, color: T.BRAND.blue }}>Investigación consolidada</div>
        <div className="animate-fade-in-up" style={{ fontSize: 34, color: T.INK.secondary, marginTop: 14, animationDelay: '250ms' }}>Cuatro evidencias vinculadas al incidente.</div>
        <div className="animate-fade-in-up" style={{ fontSize: 104, fontWeight: 640, letterSpacing: '-0.015em', lineHeight: 1.05, marginTop: 70, animationDelay: '1100ms' }}>Célula de respuesta requerida</div>
        <div className="animate-fade-in-up" style={{ fontSize: 46, fontWeight: 520, marginTop: 26, animationDelay: '1500ms' }}>Reúnan al equipo frente a VÉRTICE.</div>
      </div>
    );
  } else if (stage === 'lock') {
    body = <LockBoard rejected={flow.rejected} paused={paused} onSubmit={flow.submitLock} />;
  } else if (stage === 'pending') {
    body = (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ height: '100%' }}>
        <div style={{ ...label, fontSize: 30, color: T.BRAND.blue }}>Correlación verificada</div>
        <div style={{ fontSize: 84, fontWeight: 640, letterSpacing: '-0.01em', marginTop: 16 }}>Autorización operativa en curso</div>
        <div className="flex items-center" style={{ gap: 18, marginTop: 30, fontSize: 34, color: T.INK.secondary }}>
          <span className="animate-status" style={{ width: 18, height: 18, borderRadius: 9, background: T.STATUS.warn }} />
          VÉRTICE está completando la validación operacional.
        </div>
        <div style={{ marginTop: 70 }}>{chain}</div>
        <div style={{ fontSize: 34, marginTop: 60 }}>Revisen con su equipo la cadena reconstruida.</div>
      </div>
    );
  } else if (stage === 'plans') {
    body = (
      <div className="flex flex-col animate-fade-in-up" style={{ height: '100%' }}>
        <div className="text-center">
          <div style={{ ...label, fontSize: 28, color: T.BRAND.blue }}>Respuesta autorizada</div>
          <div style={{ fontSize: 46, fontWeight: 600, marginTop: 8 }}>Comparen los planes y decidan como equipo.</div>
        </div>
        <div className="grid flex-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 26, marginTop: 30, minHeight: 0 }}>
          {PLANS.map((p, i) => {
            const on = p.id === reviewing;
            const rows: [string, string][] = [['Alcance', p.summary], ['Deja activo', p.stays], ['Interrumpe', p.interrupts], ['Riesgo residual', p.residual]];
            return (
              <button
                key={p.id}
                onClick={() => flow.review(p.id)}
                aria-pressed={on}
                className="text-left animate-fade-in-up"
                style={{
                  animationDelay: `${i * 90}ms`, padding: '26px 28px', borderRadius: 22, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
                  background: T.SURFACE.card, color: T.INK.primary, border: `3px solid ${on ? T.BRAND.blue : T.SURFACE.hairline}`,
                  boxShadow: on ? `0 0 0 6px ${T.BRAND.blue}22` : `0 8px 28px ${T.SURFACE.shadow}`, transition: 'border-color .15s, box-shadow .15s',
                }}
              >
                <div>
                  <div style={{ ...label, fontSize: 20 }}>Plan {p.id}</div>
                  <div style={{ fontSize: 38, fontWeight: 650, lineHeight: 1.15, marginTop: 6 }}>{p.title}</div>
                </div>
                {rows.map(([k, v]) => (
                  <div key={k}>
                    <div style={{ ...label, fontSize: 16, letterSpacing: '0.12em' }}>{k}</div>
                    <div style={{ fontSize: 23, lineHeight: 1.35, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 26, minHeight: 92 }}>
          <div style={{ fontSize: 30, color: T.INK.secondary }}>{reviewing ? <>Plan en revisión: <b style={{ color: T.INK.primary }}>{planName(reviewing)}</b></> : 'Seleccionen un plan para revisarlo.'}</div>
          <Btn primary disabled={!reviewing || paused} onClick={() => reviewing && flow.selectPlan(reviewing)}>{reviewing ? `SELECCIONAR PLAN ${reviewing}` : 'SELECCIONAR PLAN'}</Btn>
        </div>
      </div>
    );
  } else if (stage === 'confirm' && chosen) {
    body = (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ height: '100%' }}>
        <div style={{ ...label, fontSize: 30, color: T.BRAND.blue }}>Plan seleccionado</div>
        <div style={{ fontSize: 92, fontWeight: 650, letterSpacing: '-0.015em', lineHeight: 1.05, marginTop: 10 }}>{chosen.id}</div>
        <div style={{ fontSize: 50, fontWeight: 560, marginTop: 4 }}>{chosen.title.toUpperCase()}</div>
        <div style={{ ...label, fontSize: 18, marginTop: 30 }}>Actúa sobre</div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, auto)', columnGap: 70, rowGap: 6, marginTop: 8, fontSize: 28, textAlign: 'left' }}>
          {chosen.contains.map((c) => <div key={c}>· {c}</div>)}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 44, marginTop: 30, width: 1500, textAlign: 'left' }}>
          {([['Preserva / deja activo', chosen.stays], ['Interrumpe', chosen.interrupts], ['Riesgo residual', chosen.residual]] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ borderTop: `2px solid ${T.SURFACE.hairline}`, paddingTop: 12 }}>
              <div style={{ ...label, fontSize: 18 }}>{k}</div>
              <div style={{ fontSize: 26, lineHeight: 1.3, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 32, color: T.INK.secondary, marginTop: 30 }}>La ejecución afectará el estado operativo de VÉRTICE.</div>
        <div className="flex items-center" style={{ gap: 32, marginTop: 34 }}>
          <Btn onClick={flow.change}>VOLVER A PLANES</Btn>
          <Btn primary disabled={paused} onClick={flow.confirm}>AUTORIZAR RESPUESTA</Btn>
        </div>
      </div>
    );
  } else if (stage === 'outcome' && mission.selectedPlan) {
    body = <OutcomeBoard plan={mission.selectedPlan} onDone={() => setAcknowledged(true)} />;
  } else {
    body = null;
  }

  return (
    <div className="absolute" style={{ left: 0, top: 0, width: W, height: H, zIndex: 60, background: `${T.SURFACE.page}F2`, backdropFilter: 'blur(18px)', color: T.INK.primary, display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between" style={{ height: 104, padding: '0 64px', flexShrink: 0 }}>
        <div className="flex items-center" style={{ gap: 28 }}>
          <VerticeBrand size={42} />
          <span style={{ width: 2, height: 34, background: T.SURFACE.hairline }} />
          <span style={{ ...label, fontSize: 22, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Consola de respuesta</span>
        </div>
        {!intro && (
          <ol className="flex items-center" style={{ listStyle: 'none', gap: 12, whiteSpace: 'nowrap' }} aria-label="Etapas de la respuesta">
            {STEPS.map((s, i) => {
              const on = s.stage.includes(stage);
              return (
                <li key={s.label} className="flex items-center" style={{ gap: 12, fontSize: 18, fontWeight: on ? 700 : 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: on ? T.BRAND.blue : T.INK.secondary, opacity: on ? 1 : 0.65 }}>
                  {s.label}{i < STEPS.length - 1 && <span aria-hidden style={{ color: T.INK.faint }}>→</span>}
                </li>
              );
            })}
          </ol>
        )}
        {countdown ? <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><div style={{ ...label, fontSize: 15, letterSpacing: '0.12em' }}>Tiempo de respuesta</div><div style={{ fontSize: 44, fontWeight: 560, lineHeight: 1.1 }}>{countdown}</div></div> : <span />}
      </div>
      {paused && <div role="status" style={{ margin: '0 64px', padding: '12px 22px', borderRadius: 12, border: `2px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: 26, fontWeight: 600 }}>Sesión en pausa.</div>}
      <div style={{ flex: 1, minHeight: 0, padding: '8px 64px 44px' }}>{body}</div>
    </div>
  );
}

/** Candado en la LED: la cadena ORIGEN → IDENTIDAD → PROPAGACIÓN → CORRELACIÓN, campos grandes, sin autocompletar. */
function LockBoard({ rejected, paused, onSubmit }: { rejected: boolean; paused: boolean; onSubmit: (ids: Record<LockKey, string>) => void }) {
  const { theme: T } = useTheme();
  const [vals, setVals] = useState<Record<LockKey, string>>({ origin: '', identity: '', propagation: '', correlation: '' });
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { first.current?.focus(); }, []);
  const ready = LOCK_FIELDS.every((f) => vals[f.key].trim()) && !paused;
  const submit = () => { if (ready) onSubmit({ origin: normalizeId(vals.origin), identity: normalizeId(vals.identity), propagation: normalizeId(vals.propagation), correlation: normalizeId(vals.correlation) }); };

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex flex-col items-center justify-center animate-fade-in-up" style={{ height: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: T.BRAND.blue, textTransform: 'uppercase' }}>Célula de respuesta</div>
      <div style={{ fontSize: 78, fontWeight: 640, letterSpacing: '-0.012em', marginTop: 10 }}>Reconstruyan el incidente</div>
      <div style={{ fontSize: 32, color: T.INK.secondary, marginTop: 10 }}>Introduzcan el identificador de cada eslabón de la cadena.</div>

      <div className="flex items-end justify-center" style={{ gap: 26, marginTop: 64 }}>
        {LOCK_FIELDS.map((f, i) => (
          <div key={f.key} className="flex items-end" style={{ gap: 26 }}>
            <label style={{ display: 'block' }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.16em', color: T.INK.secondary, marginBottom: 14 }}>{i + 1} · {f.label}</div>
              <input
                ref={i === 0 ? first : undefined}
                value={vals[f.key]}
                onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
                aria-label={f.label}
                placeholder="—"
                autoComplete="off"
                spellCheck={false}
                style={{ width: 372, height: 104, padding: '0 18px', borderRadius: 18, border: `3px solid ${T.SURFACE.hairline}`, background: T.SURFACE.card, color: T.INK.primary, fontSize: 46, fontWeight: 620, letterSpacing: '0.05em', textAlign: 'center', textTransform: 'uppercase', outline: 'none', boxShadow: `0 8px 28px ${T.SURFACE.shadow}` }}
                onFocus={(e) => { e.currentTarget.style.borderColor = T.BRAND.blue; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = T.SURFACE.hairline; }}
              />
            </label>
            {i < LOCK_FIELDS.length - 1 && <span aria-hidden style={{ fontSize: 52, color: T.INK.faint, lineHeight: '104px' }}>→</span>}
          </div>
        ))}
      </div>

      <div aria-live="polite" style={{ minHeight: 120, marginTop: 34, textAlign: 'center' }}>
        {rejected && (
          <div className="animate-fade-in-up" style={{ display: 'inline-block', padding: '18px 34px', borderRadius: 16, border: `2px solid ${T.INK.secondary}55`, background: `${T.INK.secondary}12` }}>
            <div style={{ fontSize: 30, fontWeight: 620 }}>La correlación propuesta no puede validarse con la evidencia disponible.</div>
            <div style={{ fontSize: 26, color: T.INK.secondary, marginTop: 6 }}>Revisen origen, identidad, propagación y correlación.</div>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!ready}
        style={{ height: 100, padding: '0 90px', borderRadius: 20, fontSize: 36, fontWeight: 680, letterSpacing: '0.04em', cursor: ready ? 'pointer' : 'default', background: ready ? T.BRAND.blue : T.SURFACE.hairlineSoft, color: ready ? '#fff' : T.INK.faint, border: `2px solid ${ready ? T.BRAND.blue : T.SURFACE.hairline}`, boxShadow: ready ? `0 10px 32px ${T.BRAND.blue}44` : 'none' }}
      >
        VALIDAR CORRELACIÓN
      </button>
    </form>
  );
}

/** Consecuencia del plan ejecutado, en grande; después, el grupo decide cuándo volver al estado de VÉRTICE. */
function OutcomeBoard({ plan, onDone }: { plan: ResponsePlan; onDone: () => void }) {
  const { theme: T } = useTheme();
  const o = OUTCOMES[plan];
  const tone = (t: OutcomeRow['tone']) => (t === 'ok' ? T.STATUS.ok : t === 'warn' ? T.STATUS.warn : t === 'crit' ? T.STATUS.crit : T.INK.secondary);
  const step = 300;
  const end = 400 + o.rows.length * step;
  return (
    <div className="flex flex-col items-center animate-fade-in-up" style={{ height: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: T.INK.secondary, textTransform: 'uppercase', textAlign: 'center' }}>Respuesta ejecutada · Plan {planName(plan)}<br />Consecuencias operativas</div>
      <ul style={{ listStyle: 'none', width: 1240, marginTop: 16 }}>
        {o.rows.map((r, i) => (
          <li key={r.label} className="animate-fade-in-up flex items-center justify-between" style={{ animationDelay: `${400 + i * step}ms`, padding: '10px 0', borderTop: `2px solid ${T.SURFACE.hairlineSoft}` }}>
            <span style={{ fontSize: 34, fontWeight: 560, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.label}</span>
            <span className="flex items-center" style={{ gap: 16, fontSize: 32, fontWeight: 700, letterSpacing: '0.06em' }}>
              {r.steps.map((s, k) => (
                <span key={s} className="flex items-center" style={{ gap: 16, color: k === r.steps.length - 1 ? tone(r.tone) : T.INK.secondary }}>
                  {k > 0 && <span aria-hidden style={{ color: T.INK.faint }}>→</span>}{s}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="animate-fade-in-up text-center" style={{ animationDelay: `${end}ms`, marginTop: 18 }}>
        <div style={{ fontSize: 72, fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.1, color: plan === 'DELTA' ? T.STATUS.recover : T.INK.primary }}>{o.banner}</div>
        {o.sub && <div style={{ fontSize: 40, fontWeight: 600, marginTop: 2 }}>{o.sub}</div>}
        <div style={{ fontSize: 28, lineHeight: 1.35, marginTop: 10, maxWidth: 1300 }}>{o.message}</div>
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: `${end + 500}ms`, marginTop: 'auto', paddingTop: 16 }}>
        <button onClick={onDone} style={{ height: 92, padding: '0 72px', borderRadius: 18, fontSize: 32, fontWeight: 660, letterSpacing: '0.04em', cursor: 'pointer', background: T.BRAND.blue, color: '#fff', border: `2px solid ${T.BRAND.blue}`, boxShadow: `0 8px 28px ${T.BRAND.blue}44` }}>
          VER ESTADO DE VÉRTICE
        </button>
      </div>
    </div>
  );
}
