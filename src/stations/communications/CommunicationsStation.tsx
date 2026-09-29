import { useCallback, useMemo, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import { StationShell } from '../shell/StationShell';
import { InvestigationRail } from '../shell/InvestigationRail';
import { IconMail } from '../shell/icons';
import { ROLES } from '../shell/roles';
import { WaitingScreen } from '../shell/WaitingScreen';
import { useStationSession } from '../shell/useStationSession';
import { COMMUNICATIONS_ASSISTANT } from './assistant';
import { MessageList } from './MessageList';
import { MessageReader } from './MessageReader';
import { INBOX, MESSAGES, MESSAGE_MAP } from './data';
import {
  deriveStationPhase, feedbackFor, filterMessages, initialUi, submitToInvestigation, uiReducer,
} from './logic';


function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch, source } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);

  const phase = deriveStationPhase(mission);
  const { paused, assistant } = useStationSession({ mission, phase, onRestart: () => act({ type: 'RESET' }), assistant: COMMUNICATIONS_ASSISTANT });

  // ── Datos derivados ──
  const visible = useMemo(() => filterMessages(INBOX, { query: ui.query, filter: ui.filter, readIds: ui.readIds }), [ui.query, ui.filter, ui.readIds]);
  const linkedMessages = useMemo(
    () => MESSAGES.filter((m) => m.evidence && mission.discoveredEvidence.includes(m.evidence)),
    [mission.discoveredEvidence],
  );
  const linkedIds = linkedMessages.map((m) => m.id);
  const selected = ui.selectedId ? MESSAGE_MAP.get(ui.selectedId) ?? null : null;

  // ── Acción humana explícita: agregar a la investigación ──
  const submit = useCallback(() => {
    if (!selected) return;
    const result = submitToInvestigation(selected, mission, dispatch);
    const feedback = feedbackFor(result, selected.id);
    if (feedback) act({ type: 'FEEDBACK', feedback });
    if (result.kind === 'no-match') {
      act({ type: 'MISS' });
      assistant.failedAttempt(`attempt:${selected.id}`);
    }
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.subject}` });
  }, [selected, mission, dispatch, assistant.failedAttempt]);

  return (
    <StationShell moduleName="Comunicaciones" moduleSubtitle="Buzón corporativo · Revisión de mensajes" roleTitle={ROLES.comunicaciones.title} phase={phase} paused={paused} source={source}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · COMUNICACIONES" role={ROLES.comunicaciones} />
      ) : (
        <div className="h-full flex flex-col" style={{ padding: '1.25rem 2rem 1.5rem', gap: '0.75rem' }}>
          {paused && (
            <div role="status" style={{ padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: '0.9375rem', fontWeight: 600 }}>
              Sesión en pausa. La estación se reanudará automáticamente.
            </div>
          )}
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '26rem minmax(0,1fr) 23rem', gap: '1rem' }}>
            <MessageList
              messages={visible}
              total={INBOX.length}
              selectedId={ui.selectedId}
              readIds={ui.readIds}
              linkedIds={linkedIds}
              query={ui.query}
              filter={ui.filter}
              onQuery={(query) => act({ type: 'QUERY', query })}
              onFilter={(filter) => act({ type: 'FILTER', filter })}
              onSelect={(id) => act({ type: 'SELECT', id })}
            />
            <MessageReader
              message={selected}
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
              onLinkClick={() => act({ type: 'FEEDBACK', feedback: { kind: 'link-blocked' } })}
            />
            <InvestigationRail
              phase={phase}
              items={linkedMessages.map((m) => ({
                id: m.id,
                title: m.subject,
                meta: `${m.senderName} · ${m.time}`,
                evidenceId: m.evidence ?? m.id,
                icon: <IconMail size={18} color={T.STATUS.info} />,
              }))}
              assistant={{ shown: assistant.shown, pending: assistant.pending, onRequest: assistant.request }}
              trace={ui.trace}
              nouns={{
                singular: 'comunicación',
                plural: 'comunicaciones',
                empty: 'Ninguna comunicación vinculada todavía. Las comunicaciones que agregues aparecerán aquí.',
              }}
            />
          </div>
        </div>
      )}
    </StationShell>
  );
}

export default function CommunicationsStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
