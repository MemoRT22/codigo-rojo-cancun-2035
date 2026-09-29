import { useCallback, useMemo, useReducer } from 'react';
import { ThemeProvider, useTheme } from '../../brand/ThemeContext';
import { useMissionClient } from '../../mission/useMissionClient';
import type { AssistantAction } from '../assistant/types';
import { IconPulse } from '../shell/icons';
import { InvestigationRail } from '../shell/InvestigationRail';
import { spotlight } from '../shell/spotlight';
import { StationShell } from '../shell/StationShell';
import { useStationSession } from '../shell/useStationSession';
import { ROLES } from '../shell/roles';
import { WaitingScreen } from '../shell/WaitingScreen';
import { INFRASTRUCTURE_ASSISTANT } from './assistant';
import { NODES, NODE_MAP } from './data';
import { deriveStationPhase, feedbackFor, initialUi, submitToInvestigation, uiReducer, visibleNodes } from './logic';
import { NodeList } from './NodeList';
import { NodeReader } from './NodeReader';
import type { InfraNode } from './types';


function Station() {
  const { theme: T } = useTheme();
  const { mission, dispatch, source } = useMissionClient('client');
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);

  const phase = deriveStationPhase(mission);
  const { paused, assistant } = useStationSession({ mission, phase, onRestart: () => act({ type: 'RESET' }), assistant: INFRASTRUCTURE_ASSISTANT });
  const { progress, failedAttempt } = assistant;

  const nodes = useMemo(() => visibleNodes(ui.filter, ui.sort), [ui.filter, ui.sort]);
  const linkedNodes = useMemo(() => NODES.filter((n) => n.evidence && mission.discoveredEvidence.includes(n.evidence)), [mission.discoveredEvidence]);
  const linkedIds = linkedNodes.map((n) => n.id);
  const selected = ui.selectedId ? NODE_MAP.get(ui.selectedId) ?? null : null;

  // Acción humana explícita: agregar a la investigación.
  const submit = useCallback(() => {
    if (!selected) return;
    const result = submitToInvestigation(selected, mission, dispatch);
    const feedback = feedbackFor(result, selected);
    if (feedback) act({ type: 'FEEDBACK', feedback });
    if (result.kind === 'no-match') failedAttempt(`attempt:${selected.id}`);
    if (result.kind === 'registered') act({ type: 'TRACE', entry: `Agregó a la investigación · ${selected.id}` });
  }, [selected, mission, dispatch, failedAttempt]);

  const select = useCallback((id: string) => { act({ type: 'SELECT', id }); progress(`node:${id}`); }, [progress]);

  // Acciones recomendadas: enfocan paneles o aplican un filtro; nunca seleccionan ni vinculan un nodo.
  const runAssistantAction = useCallback((a: AssistantAction) => {
    act({ type: 'TRACE', entry: `Acción recomendada · ${a.label}` });
    const target = (id: string) => (document.getElementById(id) ? id : 'infra-reader');
    switch (a.id) {
      case 'focus-chart': return spotlight(target('infra-chart'), T.BRAND.blue);
      case 'focus-refs': return spotlight(target('infra-events'), T.BRAND.blue);
      case 'recent-changes': act({ type: 'FILTER', filter: 'cambios' }); progress('filter:cambios'); return spotlight('infra-filters', T.BRAND.blue);
    }
  }, [T.BRAND.blue, progress]);

  const requestAssistant = useCallback(() => {
    assistant.request();
    act({ type: 'TRACE', entry: 'Solicitó una recomendación a VÉRTICE' });
  }, [assistant.request]);

  return (
    <StationShell moduleName="Infraestructura" moduleSubtitle="Actividad y estado de servicios" roleTitle={ROLES.infraestructura.title} phase={phase} paused={paused} source={source}>
      {phase === 'WAITING' ? (
        <WaitingScreen label="VÉRTICE · INFRAESTRUCTURA" role={ROLES.infraestructura} />
      ) : (
        <div className="h-full flex flex-col" style={{ padding: '1.25rem 2rem 1.5rem', gap: '0.75rem' }}>
          {paused && (
            <div role="status" style={{ padding: '0.6rem 1rem', borderRadius: '0.6rem', border: `1px solid ${T.STATUS.warn}66`, background: `${T.STATUS.warn}14`, fontSize: '0.9375rem', fontWeight: 600 }}>
              Sesión en pausa. La estación se reanudará automáticamente.
            </div>
          )}
          <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: '25rem minmax(0,1fr) 24rem', gap: '1rem' }}>
            <NodeList
              nodes={nodes}
              total={NODES.length}
              selectedId={ui.selectedId}
              linkedIds={linkedIds}
              filter={ui.filter}
              sort={ui.sort}
              onFilter={(filter) => { act({ type: 'FILTER', filter }); if (filter !== 'todos') progress(`filter:${filter}`); }}
              onSort={(sort) => { act({ type: 'SORT', sort }); progress(`sort:${sort}`); }}
              onSelect={select}
            />
            <NodeReader
              node={selected}
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
              <NodeContext node={selected} onSelect={select} />
              <div className="flex-1 min-h-0" style={{ display: 'flex' }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <InvestigationRail
                    phase={phase}
                    items={linkedNodes.map((n) => ({
                      id: n.id,
                      title: `${n.id} · ${n.name}`,
                      meta: n.change ? `Cambio desde ${n.change.at}` : n.zone,
                      evidenceId: n.evidence ?? n.obs,
                      icon: <IconPulse size={18} color={T.STATUS.info} />,
                    }))}
                    assistant={{ shown: assistant.shown, pending: assistant.pending, onRequest: requestAssistant, onAction: runAssistantAction }}
                    trace={ui.trace}
                    nouns={{ singular: 'nodo', plural: 'nodos', empty: 'Ningún nodo vinculado todavía. Los nodos que agregues aparecerán aquí.' }}
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

/** Contexto del nodo abierto: servicio, estado y conexiones (navegables). Igual para todos los nodos. */
function NodeContext({ node, onSelect }: { node: InfraNode | null; onSelect: (id: string) => void }) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = { background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem' };
  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' };

  if (!node) {
    return (
      <section id="infra-context" style={card} aria-label="Contexto del servicio">
        <span style={label}>Contexto del servicio</span>
        <div style={{ marginTop: '0.9rem', fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.5 }}>Selecciona un nodo para consultar su servicio, estado y conexiones.</div>
      </section>
    );
  }
  return (
    <section id="infra-context" key={node.id} className="animate-fade-in-up" style={card} aria-label="Contexto del servicio">
      <span style={label}>Contexto del servicio</span>
      <div style={{ fontSize: '0.9375rem', lineHeight: 1.5, marginTop: '0.7rem' }}>{node.service}</div>
      <dl style={{ display: 'grid', gridTemplateColumns: '6rem 1fr', rowGap: '0.45rem', columnGap: '0.75rem', fontSize: '0.875rem', marginTop: '0.85rem' }}>
        <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>Zona</dt><dd style={{ fontWeight: 560 }}>{node.zone}</dd>
        <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>Estado</dt><dd style={{ fontWeight: 560 }}>{node.status}</dd>
      </dl>
      <div style={{ ...label, marginTop: '1rem' }}>Conexiones · {node.links.length}</div>
      <div className="flex flex-wrap" style={{ gap: '0.4rem', marginTop: '0.5rem' }}>
        {node.links.map((id) => {
          const known = NODE_MAP.has(id);
          return (
            <button
              key={id}
              disabled={!known}
              onClick={() => onSelect(id)}
              style={{
                padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600, cursor: known ? 'pointer' : 'default',
                border: `1px solid ${T.SURFACE.hairline}`, background: 'transparent', color: known ? T.INK.primary : T.INK.secondary,
              }}
            >
              {id}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function InfrastructureStation() {
  return (
    <ThemeProvider>
      <Station />
    </ThemeProvider>
  );
}
