import { useCallback, useMemo, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import { StationShell } from '../shell/StationShell';
import { InvestigationRail } from '../shell/InvestigationRail';
import { StationDevPanel } from '../shell/StationDevPanel';
import { ROLES } from '../shell/roles';
import { WaitingScreen } from '../shell/WaitingScreen';
import { IconShield } from '../shell/icons';
import { spotlight } from '../shell/spotlight';
import type { AssistantAction } from '../assistant/types';
import { useStationSession } from '../shell/useStationSession';
import { IDENTITY_ASSISTANT } from './assistant';
import { IdentityEventList } from './IdentityEventList';
import { IdentityEventReader } from './IdentityEventReader';
import { IdentityProfile } from './IdentityProfile';
import { EVENTS, EVENT_MAP, FEED, USER_MAP } from './data';
import {
  STATION_EVIDENCE, deriveStationPhase, feedbackFor, filterEvents, initialUi, submitToInvestigation, uiReducer,
} from './logic';

const isDev = () => new URLSearchParams(location.search).get('dev') === 'true';

function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);

  const phase = deriveStationPhase(mission);
  const { paused, assistant } = useStationSession({ mission, phase, onRestart: () => act({ type: 'RESET' }), assistant: IDENTITY_ASSISTANT });
  const { progress, failedAttempt } = assistant;

  const visible = useMemo(
    () => filterEvents(FEED, { query: ui.query, result: ui.result, zone: ui.zone, nameOf: (id) => USER_MAP.get(id)?.name ?? id }),
    [ui.query, ui.result, ui.zone],
  );
  const linkedEvents = useMemo(
    () => EVENTS.filter((e) => e.evidence && mission.discoveredEvidence.includes(e.evidence)),
    [mission.discoveredEvidence],
  );
  const linkedIds = linkedEvents.map((e) => e.id);
  const selected = ui.selectedId ? EVENT_MAP.get(ui.selectedId) ?? null : null;

  // Acción humana explícita: agregar a la investigación.
  const submit = useCallback(() => {
    if (!selected) return;
    const result = submitToInvestigation(selected, mission, dispatch);
    const feedback = feedbackFor(result, selected.id);
    if (feedback) act({ type: 'FEEDBACK', feedback });
    if (result.kind === 'no-match') {
      act({ type: 'MISS' });
      failedAttempt(`attempt:${selected.id}`);
    }
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.userId} · ${selected.time}` });
  }, [selected, mission, dispatch, failedAttempt]);

  // ── Actividad significativa para el asistente: solo lo nuevo cuenta (repetir la misma acción no es avanzar) ──
  const select = useCallback((id: string) => {
    act({ type: 'SELECT', id });
    progress(`event:${id}`);
    const e = EVENT_MAP.get(id);
    if (e) progress(`profile:${e.userId}`);
  }, [progress]);

  const showActivity = useCallback((userId: string) => {
    act({ type: 'QUERY', query: userId });
    act({ type: 'TRACE', entry: `Filtró actividad · ${userId}` });
    progress(`activity:${userId}`);
  }, [progress]);

  // ── Acciones recomendadas: enfocan paneles o aplican filtros; nunca seleccionan ni vinculan un evento ──
  const runAssistantAction = useCallback((a: AssistantAction) => {
    act({ type: 'TRACE', entry: `Acción recomendada · ${a.label}` });
    switch (a.id) {
      case 'focus-profile': return spotlight('identity-profile', T.BRAND.blue);
      case 'focus-sessions': return spotlight(document.getElementById('identity-timeline') ? 'identity-timeline' : 'identity-reader', T.BRAND.blue);
      case 'focus-zones': return spotlight('identity-zone-filter', T.BRAND.blue, { focus: true });
      case 'show-user-activity': if (a.payload) showActivity(a.payload); return;
    }
  }, [T.BRAND.blue, showActivity]);

  const requestAssistant = useCallback(() => {
    assistant.request();
    act({ type: 'TRACE', entry: 'Solicitó una recomendación a VÉRTICE' });
  }, [assistant.request]);

  const devPanel = isDev() ? (
    <StationDevPanel
      title="Identidad y Accesos"
      evidenceId={STATION_EVIDENCE}
      mission={mission}
      dispatch={dispatch}
      phase={phase}
      assistant={assistant}
      onForceEvidence={() => submitToInvestigation(EVENT_MAP.get(STATION_EVIDENCE), mission, dispatch)}
    />
  ) : null;

  return (
    <StationShell moduleName="Identidad" moduleSubtitle="Usuarios, sesiones y accesos" roleTitle={ROLES.identidad.title} phase={phase} paused={paused} dev={devPanel}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · IDENTIDAD" role={ROLES.identidad} />
      ) : (
        <div className="h-full flex flex-col" style={{ padding: '1.25rem 2rem 1.5rem', gap: '0.75rem' }}>
          {paused && (
            <div role="status" style={{ padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: '0.9375rem', fontWeight: 600 }}>
              Sesión en pausa. La estación se reanudará automáticamente.
            </div>
          )}
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '26rem minmax(0,1fr) 24rem', gap: '1rem' }}>
            <IdentityEventList
              events={visible}
              total={FEED.length}
              selectedId={ui.selectedId}
              linkedIds={linkedIds}
              query={ui.query}
              result={ui.result}
              zone={ui.zone}
              onQuery={(query) => {
                act({ type: 'QUERY', query });
                const q = query.trim().toLowerCase();
                if (q.length >= 3) progress(`query:${q}`);
              }}
              onResult={(result) => {
                act({ type: 'RESULT', result });
                if (result !== 'todos') progress(`filter:result:${result}`);
              }}
              onZone={(zone) => {
                act({ type: 'ZONE', zone });
                if (zone !== 'todas') progress(`filter:zone:${zone}`);
              }}
              onSelect={select}
            />
            <IdentityEventReader
              event={selected}
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
              <IdentityProfile
                userId={selected?.userId ?? null}
                onShowActivity={showActivity}
              />
              <div className="flex-1 min-h-0" style={{ display: 'flex' }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <InvestigationRail
                    phase={phase}
                    items={linkedEvents.map((e) => ({
                      id: e.id,
                      title: `${USER_MAP.get(e.userId)?.name ?? e.userId} · ${e.device}`,
                      meta: `${e.zone} · ${e.time}`,
                      evidenceId: e.evidence ?? e.id,
                      icon: <IconShield size={18} color={T.STATUS.info} />,
                    }))}
                    assistant={{ shown: assistant.shown, pending: assistant.pending, onRequest: requestAssistant, onAction: runAssistantAction }}
                    trace={ui.trace}
                    nouns={{
                      singular: 'evento',
                      plural: 'eventos',
                      empty: 'Ningún evento vinculado todavía. Los eventos que agregues aparecerán aquí.',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StationShell>
  );
}

export default function IdentityStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
