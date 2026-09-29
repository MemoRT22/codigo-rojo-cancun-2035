import type { ReactNode } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconCheck, IconChevron, IconInfo, IconPlus, IconTrace } from '../shell/icons';
import type { StationPhase } from '../shell/types';
import { EVENT_MAP } from './data';
import { ConfidenceBar } from './GroupList';
import type { Feedback, Group } from './types';

interface Props {
  group: Group | null;
  phase: StationPhase;
  paused: boolean;
  detailsOpen: boolean;
  feedback: Feedback | null;
  linked: boolean;
  onToggleDetails: () => void;
  onSubmit: () => void;
}

export function GroupReader({ group, phase, paused, detailsOpen, feedback, linked, onToggleDetails, onSubmit }: Props) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = { background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' };
  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' };

  if (!group) {
    return (
      <section id="intel-reader" className="flex flex-col items-center justify-center text-center min-h-0" style={{ ...card, padding: '2rem' }} aria-label="Agrupación abierta">
        <IconTrace size={44} color={T.INK.faint} />
        <div style={{ fontSize: '1.15rem', fontWeight: 620, marginTop: '1rem' }}>Selecciona una agrupación</div>
        <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.4rem', maxWidth: '27rem', lineHeight: 1.5 }}>
          Cada agrupación reúne señales que el sistema considera relacionadas y propone una interpretación. Revisa su evidencia y su cronología antes de vincularla.
        </div>
      </section>
    );
  }

  const canSubmit = phase !== 'MISSION_FINISHED' && !paused && !linked;
  const signals = group.signals.map((id) => EVENT_MAP.get(id)!);

  return (
    <section id="intel-reader" className="flex flex-col min-h-0" style={card} aria-label="Agrupación abierta">
      <div className="flex-1 overflow-y-auto" key={group.id}>
        <div className="animate-fade-in-up" style={{ padding: '1.5rem 2rem 1rem' }}>
          <div style={{ ...label }}>Agrupación</div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 650, lineHeight: 1.25, letterSpacing: '-0.01em', marginTop: '0.35rem' }}>
            {group.id} <span style={{ fontWeight: 480, color: T.INK.secondary }}>· {group.name}</span>
          </h1>

          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))', gap: '0.75rem', marginTop: '1.1rem' }}>
            <div style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
              <dt style={{ ...label, fontSize: '0.75rem', letterSpacing: '0.08em' }}>Nivel de confianza</dt>
              <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem' }}>{group.confidence}%</dd>
              <div style={{ marginTop: '0.4rem' }}><ConfidenceBar value={group.confidence} /></div>
            </div>
            <div style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
              <dt style={{ ...label, fontSize: '0.75rem', letterSpacing: '0.08em' }}>Señales asociadas</dt>
              <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem' }}>{group.signals.length}</dd>
            </div>
            <div style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
              <dt style={{ ...label, fontSize: '0.75rem', letterSpacing: '0.08em' }}>Estado</dt>
              <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem' }}>Requiere validación humana</dd>
            </div>
          </dl>

          <div id="intel-hypothesis" style={{ marginTop: '1.1rem', padding: '1rem 1.2rem', borderRadius: '0.75rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
            <div style={{ ...label, color: T.BRAND.blue }}>Hipótesis del sistema</div>
            <div style={{ fontSize: '1rem', lineHeight: 1.55, marginTop: '0.5rem' }}>{group.statement}</div>
            <div style={{ fontSize: '1rem', lineHeight: 1.55, marginTop: '0.4rem' }}>
              <span style={{ fontWeight: 650 }}>Posible interpretación:</span> {group.interpretation}
            </div>
            <div style={{ fontSize: '0.875rem', color: T.INK.secondary, marginTop: '0.55rem' }}>Confianza del modelo: {group.confidence}%</div>
          </div>
        </div>

        <div style={{ padding: '0.25rem 2rem 1.25rem', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
          <div style={{ paddingTop: '1rem', fontSize: '0.9375rem', fontWeight: 650 }}>Relaciones propuestas</div>
          <div className="flex items-stretch" style={{ marginTop: '0.6rem', gap: '0.25rem' }}>
            {group.relation.nodes.map((n, i) => (
              <div key={n.title + i} className="flex items-center" style={{ gap: '0.25rem', flex: i === group.relation.nodes.length - 1 ? '0 1 auto' : '1 1 0', minWidth: 0 }}>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, minWidth: '9.5rem' }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 650 }}>{n.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: T.INK.secondary }}>{n.sub}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 650, marginTop: '0.2rem' }}>{n.time}</div>
                </div>
                {i < group.relation.edges.length && (
                  <div className="flex flex-col items-center" style={{ flex: 1, minWidth: '4.5rem', color: T.INK.secondary }}>
                    <span style={{ fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.2 }}>{group.relation.edges[i]}</span>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div id="intel-evidence" style={{ marginTop: '1.25rem', borderRadius: '0.6rem' }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 650 }}>Evidencia asociada</div>
            <ul style={{ listStyle: 'none', marginTop: '0.4rem' }}>
              {signals.map((e) => (
                <li key={e.id} className="flex items-baseline" style={{ gap: '1rem', padding: '0.5rem 0', borderTop: `1px solid ${T.SURFACE.hairlineSoft}`, fontSize: '0.9375rem' }}>
                  <span style={{ fontWeight: 620, minWidth: '4.5rem', color: T.INK.secondary }}>{e.time}</span>
                  <span style={{ flex: 1 }}>{e.label}</span>
                  {e.ref && <span style={{ fontWeight: 620, fontSize: '0.875rem' }}>{e.ref}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '1.25rem', border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
            <button
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              className="w-full flex items-center justify-between"
              style={{ padding: '0.75rem 1rem', background: T.SURFACE.page, cursor: 'pointer', color: T.INK.primary, fontSize: '0.9375rem', fontWeight: 640 }}
            >
              <span className="inline-flex items-center" style={{ gap: '0.5rem' }}><IconTrace size={17} /> Detalles de la agrupación</span>
              <IconChevron size={18} open={detailsOpen} />
            </button>
            {detailsOpen && (
              <dl className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: '14rem 1fr', rowGap: '0.55rem', columnGap: '1rem', fontSize: '0.9rem', padding: '1rem' }}>
                {([
                  ['Identificador de la agrupación', <span key="i" style={{ fontWeight: 620, letterSpacing: '0.02em' }}>{group.id}</span>],
                  ['Nombre', group.name],
                  ['Nivel de confianza', `${group.confidence}% (confianza del modelo; no equivale a certeza)`],
                  ['Señales asociadas', `${group.signals.length}`],
                  ['Estado', 'Requiere validación humana'],
                ] as [string, ReactNode][]).map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.SURFACE.hairline}`, padding: '0.9rem 2rem 1.1rem', background: T.SURFACE.card }}>
        <div aria-live="polite">{feedback && <FeedbackCard feedback={feedback} />}</div>
        <div className="flex items-center justify-between" style={{ gap: '1.5rem', marginTop: feedback ? '0.75rem' : 0 }}>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary, lineHeight: 1.45, maxWidth: '30rem' }}>
            {linked ? 'Esta agrupación forma parte de la investigación actual.' : 'Vincula esta agrupación con el incidente actual para incorporarla como evidencia.'}
          </div>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center shrink-0"
            style={{
              gap: '0.55rem', padding: '0.8rem 1.4rem', borderRadius: '0.7rem', fontSize: '0.9375rem', fontWeight: 660, letterSpacing: '0.01em',
              cursor: canSubmit ? 'pointer' : 'default', background: canSubmit ? T.BRAND.blue : T.SURFACE.hairlineSoft, color: canSubmit ? '#fff' : T.INK.secondary,
              border: `1px solid ${canSubmit ? T.BRAND.blue : T.SURFACE.hairline}`, boxShadow: canSubmit ? `0 4px 14px ${T.BRAND.blue}44` : 'none',
            }}
          >
            {linked ? <IconCheck size={18} /> : <IconPlus size={18} />}
            {linked ? 'En la investigación' : phase === 'MISSION_FINISHED' ? 'Sesión finalizada' : 'Agregar a la investigación'}
          </button>
        </div>
      </div>
    </section>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const { theme: T } = useTheme();
  const wrap = (children: ReactNode, accent: string) => (
    <div className="animate-fade-in-up flex items-start" style={{ gap: '0.8rem', padding: '0.85rem 1.1rem', borderRadius: '0.75rem', border: `1px solid ${accent}55`, background: `${accent}12` }}>{children}</div>
  );
  switch (feedback.kind) {
    case 'registered':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconCheck size={22} color={T.STATUS.info} /></span>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: T.STATUS.info }}>EVIDENCIA REGISTRADA</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 650, letterSpacing: '0.02em', marginTop: '0.15rem' }}>{feedback.id}</div>
            <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.1rem' }}>Correlación analítica añadida a la investigación.</div>
          </div>
        </>,
        T.STATUS.info,
      );
    case 'no-match':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconInfo size={20} color={T.INK.secondary} /></span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>{feedback.title}</div>
            <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>{feedback.detail}</div>
          </div>
        </>,
        T.INK.secondary,
      );
    case 'already':
      return wrap(<><IconInfo size={20} color={T.INK.secondary} /><div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Esta agrupación ya forma parte de la investigación.</div></>, T.INK.secondary);
  }
}
