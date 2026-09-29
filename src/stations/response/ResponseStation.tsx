import { useCallback, useEffect, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import type { ResponsePlan } from '../../mission/types';
import { AnalysisAssistantCard } from '../assistant/AnalysisAssistantCard';
import type { AssistantAction } from '../assistant/types';
import { spotlight } from '../shell/spotlight';
import { StationDevPanel } from '../shell/StationDevPanel';
import { StationShell } from '../shell/StationShell';
import { useStationSession } from '../shell/useStationSession';
import { WaitingScreen } from '../shell/WaitingScreen';
import { RESPONSE_ASSISTANT } from './assistant';
import { CorrelationLock } from './CorrelationLock';
import { deriveStage, deriveStationPhase, PLAN_MAP, type LockKey, type Stage } from './logic';
import { OutcomePanel } from './OutcomePanel';
import { PlanDetail, PlanGrid, planName } from './ResponsePlans';

const isDev = () => new URLSearchParams(location.search).get('dev') === 'true';
const EVIDENCE = ['COR-512', 'ACC-417', 'NOD-204', 'AGR-27'] as const;

// UI local: plan que se está revisando, si se volvió a la lista y el intento de correlación en curso. Se reinicia con la misión.
interface Ui { reviewing: ResponsePlan | null; changing: boolean; attemptBase: number | null }
type UiAct = { type: 'RESET' } | { type: 'REVIEW'; plan: ResponsePlan } | { type: 'SELECTED' } | { type: 'CHANGE' } | { type: 'ATTEMPT'; base: number };
const initialUi = (): Ui => ({ reviewing: null, changing: false, attemptBase: null });
function uiReducer(s: Ui, a: UiAct): Ui {
  switch (a.type) {
    case 'RESET': return initialUi();
    case 'REVIEW': return { ...s, reviewing: a.plan };
    case 'SELECTED': return { ...s, changing: false };
    case 'CHANGE': return { ...s, changing: true };
    case 'ATTEMPT': return { ...s, attemptBase: a.base };
  }
}

const STEPS: { stage: Stage[]; label: string }[] = [
  { stage: ['lock'], label: 'Correlación' },
  { stage: ['pending'], label: 'Autorización' },
  { stage: ['plans'], label: 'Planes' },
  { stage: ['confirm'], label: 'Confirmación' },
  { stage: ['outcome'], label: 'Consecuencia' },
];

function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);

  const phase = deriveStationPhase(mission);
  const { paused, assistant } = useStationSession({ mission, phase, onRestart: () => act({ type: 'RESET' }), assistant: RESPONSE_ASSISTANT });
  const stage = deriveStage(mission, ui.changing);
  const inDecision = stage === 'plans' || stage === 'confirm';

  // La orientación de Respuesta solo cuenta desde que se autoriza la respuesta.
  const { reset: resetAssistant, progress } = assistant;
  useEffect(() => { if (inDecision) resetAssistant(); }, [inDecision, resetAssistant]);

  const rejected = ui.attemptBase !== null && mission.failedCorrelationAttempts > ui.attemptBase && !mission.finalCorrelationValidated;
  const submitLock = useCallback((ids: Record<LockKey, string>) => {
    act({ type: 'ATTEMPT', base: mission.failedCorrelationAttempts });
    dispatch({ type: 'FINAL_CORRELATION_SUBMITTED', ...ids });
  }, [mission.failedCorrelationAttempts, dispatch]);

  const review = useCallback((plan: ResponsePlan) => { act({ type: 'REVIEW', plan }); progress(`plan:${plan}`); }, [progress]);
  const selectPlan = (plan: ResponsePlan) => { dispatch({ type: 'PLAN_SELECTED', plan }); act({ type: 'SELECTED' }); };

  const runAssistantAction = useCallback((a: AssistantAction) => {
    if (a.id === 'focus-plans') spotlight('resp-plans', T.BRAND.blue);
  }, [T.BRAND.blue]);

  const devPanel = isDev() ? (
    <StationDevPanel
      title="Respuesta"
      evidenceId={EVIDENCE.join(', ')}
      mission={mission}
      dispatch={dispatch}
      phase={phase === 'MISSION_FINISHED' ? 'ACTIVE' : phase}
      assistant={assistant}
      onForceEvidence={() => EVIDENCE.forEach((evidenceId) => dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId, source: 'control' }))}
    />
  ) : null;

  const reviewed = ui.reviewing ? PLAN_MAP.get(ui.reviewing) : undefined;
  const chosen = mission.selectedPlan ? PLAN_MAP.get(mission.selectedPlan) : undefined;
  const btn = (primary: boolean, enabled = true): React.CSSProperties => ({
    padding: '0.8rem 1.5rem', borderRadius: '0.7rem', fontSize: '0.9375rem', fontWeight: 660, cursor: enabled ? 'pointer' : 'default', letterSpacing: '0.01em',
    background: primary && enabled ? T.BRAND.blue : 'transparent', color: primary && enabled ? '#fff' : T.INK.primary,
    border: `1px solid ${primary && enabled ? T.BRAND.blue : T.SURFACE.hairline}`, boxShadow: primary && enabled ? `0 4px 14px ${T.BRAND.blue}44` : 'none',
  });
  const banner = (title: string, sub: string, pulse = false) => (
    <div className="animate-fade-in-up flex items-center" style={{ gap: '0.9rem', padding: '0.9rem 1.25rem', borderRadius: '0.8rem', border: `1px solid ${T.STATUS.info}55`, background: `${T.STATUS.info}10` }}>
      <span className={pulse ? 'animate-status' : ''} style={{ width: 10, height: 10, borderRadius: 5, background: pulse ? T.STATUS.warn : T.STATUS.info, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.14em', color: T.STATUS.info }}>{title}</div>
        <div style={{ fontSize: '0.9375rem', marginTop: '0.1rem' }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <StationShell moduleName="Respuesta" moduleSubtitle="Consola de autorización operativa" phase={phase} paused={paused} dev={devPanel}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · RESPUESTA" />
      ) : (
        <div className="h-full flex flex-col overflow-y-auto" style={{ padding: '1.25rem 2rem 1.5rem', gap: '1rem' }}>
          {paused && (
            <div role="status" style={{ padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: '0.9375rem', fontWeight: 600 }}>
              Sesión en pausa. La estación se reanudará automáticamente.
            </div>
          )}

          <ol className="flex items-center justify-center" style={{ listStyle: 'none', gap: '0.6rem', flexWrap: 'wrap' }} aria-label="Etapas de la respuesta">
            {STEPS.map((s, i) => {
              const on = s.stage.includes(stage);
              return (
                <li key={s.label} className="flex items-center" style={{ gap: '0.6rem', fontSize: '0.8125rem', fontWeight: on ? 700 : 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: on ? T.BRAND.blue : T.INK.secondary, opacity: on ? 1 : 0.7 }}>
                  {s.label}
                  {i < STEPS.length - 1 && <span aria-hidden style={{ color: T.INK.faint }}>→</span>}
                </li>
              );
            })}
          </ol>

          {stage === 'lock' && (
            <CorrelationLock paused={paused} evidenceCount={mission.discoveredEvidence.length} rejected={rejected} onSubmit={submitLock} />
          )}

          {stage === 'pending' && (
            <div style={{ width: '100%', maxWidth: '44rem', margin: '0 auto' }}>
              {banner('CORRELACIÓN VERIFICADA', 'VÉRTICE está completando la validación operacional. Autorización de respuesta pendiente.', true)}
            </div>
          )}

          {inDecision && (
            <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 24rem', gap: '1.25rem', alignItems: 'start' }}>
              <div className="flex flex-col" style={{ gap: '1rem' }}>
                {banner('CORRELACIÓN VERIFICADA', 'Autorización de respuesta concedida. Revisa los planes disponibles.')}
                {stage === 'plans' && (
                  <>
                    <PlanGrid reviewing={ui.reviewing} disabled={paused} onReview={review} />
                    {reviewed && (
                      <PlanDetail plan={reviewed}>
                        <div className="flex items-center justify-between" style={{ gap: '1rem' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 650 }}>Plan {planName(reviewed.id)}</div>
                          <button style={btn(true, !paused)} disabled={paused} onClick={() => selectPlan(reviewed.id)}>Seleccionar plan</button>
                        </div>
                      </PlanDetail>
                    )}
                  </>
                )}
                {stage === 'confirm' && chosen && (
                  <PlanDetail plan={chosen}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: T.STATUS.info }}>PLAN SELECCIONADO</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 650, marginTop: '0.2rem' }}>{planName(chosen.id)}</div>
                    <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.3rem' }}>Revisa las consecuencias antes de autorizar.</div>
                    <div className="flex items-center" style={{ gap: '0.75rem', marginTop: '1rem' }}>
                      <button style={btn(true, !paused)} disabled={paused} onClick={() => dispatch({ type: 'PLAN_CONFIRMED' })}>AUTORIZAR RESPUESTA</button>
                      <button style={btn(false)} onClick={() => act({ type: 'CHANGE' })}>Volver a los planes</button>
                    </div>
                  </PlanDetail>
                )}
              </div>

              <div className="flex flex-col" style={{ gap: '1rem' }}>
                <section aria-label="Decisión de respuesta" style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' }}>Decisión de respuesta</div>
                  <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.55, marginTop: '0.6rem' }}>
                    Cada plan tiene un alcance distinto. Compara qué contiene, qué deja activo y qué interrumpe antes de elegir. La ejecución requiere selección y confirmación.
                  </div>
                </section>
                <AnalysisAssistantCard shown={assistant.shown} pending={assistant.pending} onRequest={assistant.request} onAction={runAssistantAction} />
              </div>
            </div>
          )}

          {stage === 'outcome' && mission.selectedPlan && <OutcomePanel plan={mission.selectedPlan} />}
        </div>
      )}
    </StationShell>
  );
}

export default function ResponseStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
