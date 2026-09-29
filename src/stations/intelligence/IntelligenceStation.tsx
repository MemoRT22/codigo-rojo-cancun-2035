import { useCallback, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import type { AssistantAction } from '../assistant/types';
import { IconTrace } from '../shell/icons';
import { InvestigationRail } from '../shell/InvestigationRail';
import { spotlight } from '../shell/spotlight';
import { StationDevPanel } from '../shell/StationDevPanel';
import { StationShell } from '../shell/StationShell';
import { useStationSession } from '../shell/useStationSession';
import { WaitingScreen } from '../shell/WaitingScreen';
import { INTELLIGENCE_ASSISTANT } from './assistant';
import { GROUPS, GROUP_MAP } from './data';
import { GroupList } from './GroupList';
import { GroupReader } from './GroupReader';
import { STATION_EVIDENCE, deriveStationPhase, feedbackFor, initialUi, submitToInvestigation, uiReducer } from './logic';
import { Timeline } from './Timeline';

const isDev = () => new URLSearchParams(location.search).get('dev') === 'true';

function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);

  const phase = deriveStationPhase(mission);
  const { paused, assistant } = useStationSession({ mission, phase, onRestart: () => act({ type: 'RESET' }), assistant: INTELLIGENCE_ASSISTANT });
  const { progress, failedAttempt } = assistant;

  const linkedGroups = GROUPS.filter((g) => g.evidence && mission.discoveredEvidence.includes(g.evidence));
  const linkedIds = linkedGroups.map((g) => g.id);
  const selected = ui.selectedId ? GROUP_MAP.get(ui.selectedId) ?? null : null;

  // Acción humana explícita: agregar a la investigación.
  const submit = useCallback(() => {
    if (!selected) return;
    const result = submitToInvestigation(selected, mission, dispatch);
    const feedback = feedbackFor(result, selected);
    if (feedback) act({ type: 'FEEDBACK', feedback });
    if (result.kind === 'no-match') failedAttempt(`attempt:${selected.id}`);
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.id}` });
  }, [selected, mission, dispatch, failedAttempt]);

  const select = useCallback((id: string) => { act({ type: 'SELECT', id }); progress(`group:${id}`); }, [progress]);

  // Acciones recomendadas: solo enfocan paneles; nunca seleccionan, descartan ni vinculan una agrupación.
  const runAssistantAction = useCallback((a: AssistantAction) => {
    act({ type: 'TRACE', entry: `Acción recomendada · ${a.label}` });
    const target = (id: string) => (document.getElementById(id) ? id : 'intel-reader');
    switch (a.id) {
      case 'focus-timeline': return spotlight('intel-timeline', T.BRAND.blue);
      case 'focus-evidence': return spotlight(target('intel-evidence'), T.BRAND.blue);
      case 'focus-hypothesis': return spotlight(target('intel-hypothesis'), T.BRAND.blue);
    }
  }, [T.BRAND.blue]);

  const requestAssistant = useCallback(() => {
    assistant.request();
    act({ type: 'TRACE', entry: 'Solicitó una recomendación a VÉRTICE' });
  }, [assistant.request]);

  const devPanel = isDev() ? (
    <StationDevPanel
      title="Inteligencia"
      evidenceId={STATION_EVIDENCE}
      mission={mission}
      dispatch={dispatch}
      phase={phase}
      assistant={assistant}
      onForceEvidence={() => submitToInvestigation(GROUP_MAP.get('AGR-27'), mission, dispatch)}
    />
  ) : null;

  return (
    <StationShell moduleName="Inteligencia" moduleSubtitle="Análisis de patrones · Agrupaciones e hipótesis" phase={phase} paused={paused} dev={devPanel}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · INTELIGENCIA" />
      ) : (
        <div className="h-full flex flex-col" style={{ padding: '1.25rem 2rem 1.5rem', gap: '0.75rem' }}>
          {paused && (
            <div role="status" style={{ padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: '0.9375rem', fontWeight: 600 }}>
              Sesión en pausa. La estación se reanudará automáticamente.
            </div>
          )}
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '24rem minmax(0,1fr) 24rem', gap: '1rem' }}>
            <GroupList groups={GROUPS} selectedId={ui.selectedId} linkedIds={linkedIds} onSelect={select} />
            <GroupReader
              group={selected}
              phase={phase}
              paused={paused}
              detailsOpen={ui.detailsOpen}
              feedback={ui.feedback}
              linked={selected ? linkedIds.includes(selected.id) : false}
              onToggleDetails={() => {
                if (selected && !ui.detailsOpen) {
                  act({ type: 'TRACE', entry: `Consultó detalles · ${selected.id}` });
                  progress(`details:${selected.id}`);
                }
                act({ type: 'TOGGLE_DETAILS' });
              }}
              onSubmit={submit}
            />
            <div className="flex flex-col min-h-0 overflow-y-auto" style={{ gap: '1rem' }}>
              <Timeline group={selected} />
              <InvestigationRail
                phase={phase}
                items={linkedGroups.map((g) => ({
                  id: g.id,
                  title: `${g.id} · ${g.name}`,
                  meta: `Confianza del modelo ${g.confidence}%`,
                  evidenceId: g.evidence ?? g.id,
                  icon: <IconTrace size={18} color={T.STATUS.info} />,
                }))}
                assistant={{ shown: assistant.shown, pending: assistant.pending, onRequest: requestAssistant, onAction: runAssistantAction }}
                trace={ui.trace}
                nouns={{ singular: 'agrupación', plural: 'agrupaciones', empty: 'Ninguna agrupación vinculada todavía. Las agrupaciones que agregues aparecerán aquí.' }}
              />
            </div>
          </div>
        </div>
      )}
    </StationShell>
  );
}

export default function IntelligenceStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
