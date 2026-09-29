import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { VerticeIsotipo } from '../../brand/VerticeLogo';
import { useMissionClient } from '../../mission/useMissionClient';
import { StationShell } from '../shell/StationShell';
import { CommunicationsDevPanel } from './CommunicationsDevPanel';
import { InvestigationRail } from './InvestigationRail';
import { MessageList } from './MessageList';
import { MessageReader } from './MessageReader';
import { INBOX, MESSAGES, MESSAGE_MAP } from './data';
import {
  deriveStationPhase, feedbackFor, filterMessages, helpLevel, initialUi, submitToInvestigation, uiReducer,
  type HelpLevel,
} from './logic';

const isDev = () => new URLSearchParams(location.search).get('dev') === 'true';

function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);
  const [helpOverride, setHelpOverride] = useState<HelpLevel | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);

  const phase = deriveStationPhase(mission);
  const paused = mission.status === 'paused';

  // ── Reinicio: la estación vuelve a su estado inicial cuando la misión se reinicia/arranca ──
  const prevStatus = useRef(mission.status);
  const prevPhase = useRef(phase);
  useEffect(() => {
    const ps = prevStatus.current;
    const pp = prevPhase.current;
    prevStatus.current = mission.status;
    prevPhase.current = phase;
    const restarted = mission.status === 'idle' || (ps === 'idle' && mission.status === 'running') || (pp === 'EVIDENCE_FOUND' && phase === 'ACTIVE');
    if (restarted) {
      act({ type: 'RESET' });
      setActiveSeconds(0);
      setHelpOverride(null);
    }
  }, [mission.status, phase]);

  // ── Ayuda progresiva: cuenta segundos de sesión activa sin evidencia (contador, no reloj del equipo) ──
  const counting = phase === 'ACTIVE' && !paused;
  useEffect(() => {
    if (!counting) return;
    const iv = setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [counting]);
  const help = helpOverride ?? helpLevel(activeSeconds, ui.misses);

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
    if (result.kind === 'no-match') act({ type: 'MISS' });
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.subject}` });
  }, [selected, mission, dispatch]);

  const dev = isDev();
  const devPanel = dev ? (
    <CommunicationsDevPanel mission={mission} dispatch={dispatch} phase={phase} help={help} onHelp={setHelpOverride} />
  ) : null;

  return (
    <StationShell moduleName="Comunicaciones" moduleSubtitle="Buzón corporativo · Análisis de comunicaciones" phase={phase} paused={paused} dev={devPanel}>
      {phase === 'WAITING' ? (
        <Waiting />
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
            <InvestigationRail phase={phase} linked={linkedMessages} help={help} trace={ui.trace} />
          </div>
        </div>
      )}
    </StationShell>
  );
}

function Waiting() {
  const { theme: T } = useTheme();
  return (
    <div className="h-full flex items-center justify-center">
      <div
        className="text-center"
        style={{ padding: '3rem 4rem', background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '1.1rem', boxShadow: `0 10px 36px ${T.SURFACE.shadow}`, minWidth: '30rem' }}
      >
        <div className="inline-flex"><VerticeIsotipo size={64} /></div>
        <div style={{ fontSize: '0.875rem', fontWeight: 650, letterSpacing: '0.2em', color: T.INK.secondary, marginTop: '1.25rem' }}>VÉRTICE · COMUNICACIONES</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 620, marginTop: '0.9rem', letterSpacing: '-0.01em' }}>Estación preparada</div>
        <div className="inline-flex items-center" style={{ gap: '0.6rem', marginTop: '0.7rem', fontSize: '1.05rem', color: T.INK.secondary }}>
          <span className="animate-status" style={{ width: 9, height: 9, borderRadius: 5, background: T.INK.faint }} />
          Esperando inicio de sesión
        </div>
      </div>
    </div>
  );
}

export default function CommunicationsStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
