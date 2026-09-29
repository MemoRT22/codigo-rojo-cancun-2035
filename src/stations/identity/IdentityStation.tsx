import { useCallback, useMemo, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import { StationShell } from '../shell/StationShell';
import { InvestigationRail } from '../shell/InvestigationRail';
import { StationDevPanel } from '../shell/StationDevPanel';
import { WaitingScreen } from '../shell/WaitingScreen';
import { IconShield } from '../shell/icons';
import { useStationSession } from '../shell/useStationSession';
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
  const { paused, help, setHelpOverride } = useStationSession(mission, phase, ui.misses, () => act({ type: 'RESET' }));

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
    if (result.kind === 'no-match') act({ type: 'MISS' });
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.userId} · ${selected.time}` });
  }, [selected, mission, dispatch]);

  const devPanel = isDev() ? (
    <StationDevPanel
      title="Identidad y Accesos"
      evidenceId={STATION_EVIDENCE}
      mission={mission}
      dispatch={dispatch}
      phase={phase}
      help={help}
      onHelp={setHelpOverride}
      onForceEvidence={() => submitToInvestigation(EVENT_MAP.get(STATION_EVIDENCE), mission, dispatch)}
    />
  ) : null;

  return (
    <StationShell moduleName="Identidad y Accesos" moduleSubtitle="Consola de identidad · Sesiones y accesos" phase={phase} paused={paused} dev={devPanel}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · IDENTIDAD Y ACCESOS" />
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
              onQuery={(query) => act({ type: 'QUERY', query })}
              onResult={(result) => act({ type: 'RESULT', result })}
              onZone={(zone) => act({ type: 'ZONE', zone })}
              onSelect={(id) => act({ type: 'SELECT', id })}
            />
            <IdentityEventReader
              event={selected}
              phase={phase}
              paused={paused}
              detailsOpen={ui.detailsOpen}
              feedback={ui.feedback}
              linked={selected ? linkedIds.includes(selected.id) : false}
              onToggleDetails={() => {
                if (selected && !ui.detailsOpen) act({ type: 'TRACE', entry: `Consultó detalles · ${selected.id}` });
                act({ type: 'TOGGLE_DETAILS' });
              }}
              onSubmit={submit}
            />
            <div className="flex flex-col min-h-0 overflow-y-auto" style={{ gap: '1rem' }}>
              <IdentityProfile
                userId={selected?.userId ?? null}
                onShowActivity={(userId) => {
                  act({ type: 'QUERY', query: userId });
                  act({ type: 'TRACE', entry: `Filtró actividad · ${userId}` });
                }}
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
                    help={help}
                    helpLines={[
                      'Hay identidades con actividad simultánea desde contextos distintos.',
                      'compara usuario, dispositivo, zona y comportamiento habitual.',
                    ]}
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
