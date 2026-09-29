import type { ReactNode } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconCheck, IconChevron, IconInfo, IconPlus, IconPulse, IconTrace } from '../shell/icons';
import type { StationPhase } from '../shell/types';
import { ActivityChart } from './ActivityChart';
import { RANGE } from './data';
import { sessionRefOf } from './logic';
import type { Feedback, InfraNode } from './types';

interface Props {
  node: InfraNode | null;
  phase: StationPhase;
  paused: boolean;
  detailsOpen: boolean;
  feedback: Feedback | null;
  linked: boolean;
  onToggleDetails: () => void;
  onSubmit: () => void;
}

const changeText = (n: InfraNode) => (n.change ? `≈${n.change.to} solicitudes/s` : 'Sin cambio destacado');

export function NodeReader({ node, phase, paused, detailsOpen, feedback, linked, onToggleDetails, onSubmit }: Props) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = { background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' };

  if (!node) {
    return (
      <section id="infra-reader" className="flex flex-col items-center justify-center text-center min-h-0" style={{ ...card, padding: '2rem' }} aria-label="Nodo abierto">
        <IconPulse size={44} color={T.INK.faint} />
        <div style={{ fontSize: '1.15rem', fontWeight: 620, marginTop: '1rem' }}>Selecciona un nodo</div>
        <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.4rem', maxWidth: '26rem', lineHeight: 1.5 }}>
          Abre un nodo para ver su actividad a lo largo del tiempo, los eventos del servicio y sus conexiones. Compara varios antes de decidir qué vincular.
        </div>
      </section>
    );
  }

  const canSubmit = phase !== 'MISSION_FINISHED' && !paused && !linked;
  const sessionRef = sessionRefOf(node);
  const tiles: { label: string; value: string }[] = [
    { label: 'Actividad habitual', value: `≈${node.usual} solicitudes/s` },
    { label: 'Cambio observado', value: changeText(node) },
    { label: 'Inicio del cambio', value: node.change?.at ?? '—' },
    { label: 'Referencia de sesión', value: sessionRef ?? '—' },
  ];
  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary };

  return (
    <section id="infra-reader" className="flex flex-col min-h-0" style={card} aria-label="Nodo abierto">
      <div className="flex-1 overflow-y-auto" key={node.id}>
        <div className="animate-fade-in-up" style={{ padding: '1.5rem 2rem 1rem' }}>
          <div style={label}>NODO</div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 650, lineHeight: 1.25, letterSpacing: '-0.01em', marginTop: '0.35rem' }}>
            {node.id} <span style={{ fontWeight: 480, color: T.INK.secondary }}>· {node.name}</span>
          </h1>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '0.75rem', marginTop: '1.1rem' }}>
            {tiles.map((t) => (
              <div key={t.label} style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 650, letterSpacing: '0.08em', color: T.INK.secondary, textTransform: 'uppercase' }}>{t.label}</dt>
                <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem', wordBreak: 'break-word' }}>{t.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div style={{ padding: '0.25rem 2rem 1.25rem', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
          <div id="infra-chart" style={{ paddingTop: '1rem', borderRadius: '0.6rem' }}>
            <div className="flex items-baseline justify-between">
              <div style={{ fontSize: '0.9375rem', fontWeight: 650 }}>Actividad del nodo</div>
              <div style={{ fontSize: '0.8125rem', color: T.INK.secondary }}>{RANGE.from.slice(0, 5)} – {RANGE.to.slice(0, 5)}</div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.15rem' }}>
              Solicitudes por segundo: cuántas veces se consulta el servicio cada segundo.
            </div>
            <div style={{ marginTop: '0.5rem' }}><ActivityChart node={node} /></div>
          </div>

          <div id="infra-events" style={{ marginTop: '1rem', borderRadius: '0.6rem' }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 650 }}>Eventos del servicio</div>
            {node.events.length === 0 ? (
              <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.4rem' }}>Sin eventos registrados en este periodo.</div>
            ) : (
              <ul style={{ listStyle: 'none', marginTop: '0.4rem' }}>
                {node.events.map((e) => (
                  <li key={e.time + e.text} className="flex items-baseline" style={{ gap: '1rem', padding: '0.5rem 0', borderTop: `1px solid ${T.SURFACE.hairlineSoft}`, fontSize: '0.9375rem' }}>
                    <span style={{ fontWeight: 620, minWidth: '4.5rem', color: T.INK.secondary }}>{e.time}</span>
                    <span style={{ flex: 1 }}>{e.text}</span>
                    {e.ref && <span style={{ fontWeight: 620, fontSize: '0.875rem' }}><span style={{ fontWeight: 480, color: T.INK.secondary }}>Ref. </span>{e.ref}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '1.25rem', border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
            <button
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              className="w-full flex items-center justify-between"
              style={{ padding: '0.75rem 1rem', background: T.SURFACE.page, cursor: 'pointer', color: T.INK.primary, fontSize: '0.9375rem', fontWeight: 640 }}
            >
              <span className="inline-flex items-center" style={{ gap: '0.5rem' }}><IconTrace size={17} /> Detalles del nodo</span>
              <IconChevron size={18} open={detailsOpen} />
            </button>
            {detailsOpen && <Details node={node} sessionRef={sessionRef} />}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.SURFACE.hairline}`, padding: '0.9rem 2rem 1.1rem', background: T.SURFACE.card }}>
        <div aria-live="polite">{feedback && <FeedbackCard feedback={feedback} />}</div>
        <div className="flex items-center justify-between" style={{ gap: '1.5rem', marginTop: feedback ? '0.75rem' : 0 }}>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary, lineHeight: 1.45, maxWidth: '30rem' }}>
            {linked ? 'Este nodo forma parte de la investigación actual.' : 'Vincula este nodo con el incidente actual para incorporarlo como evidencia.'}
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

function Details({ node, sessionRef }: { node: InfraNode; sessionRef?: string }) {
  const { theme: T } = useTheme();
  const rows: [string, ReactNode][] = [
    ['Identificador de la observación', <span style={{ fontWeight: 620, letterSpacing: '0.02em' }}>{node.obs}</span>],
    ['Nodo', `${node.id} · ${node.name}`],
    ['Servicio', node.service],
    ['Zona', node.zone],
    ['Estado', node.status],
    ['Actividad habitual', `≈${node.usual} solicitudes/s`],
    ['Cambio observado', node.change ? `≈${node.change.to} solicitudes/s` : 'Sin cambio destacado'],
    ['Inicio del cambio', node.change?.at ?? '—'],
    ['Referencia de sesión', sessionRef ?? '—'],
    ['Documentación operativa', node.docs ?? 'Sin información adicional'],
  ];
  return (
    <div className="animate-fade-in-up" style={{ padding: '0.5rem 1rem 1rem' }}>
      <dl style={{ display: 'grid', gridTemplateColumns: '14rem 1fr', rowGap: '0.55rem', columnGap: '1rem', fontSize: '0.9rem', paddingTop: '0.5rem' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>{k}</dt>
            <dd style={{ color: T.INK.primary }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
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
            <div style={{ fontSize: '1.3rem', fontWeight: 650, letterSpacing: '0.02em', marginTop: '0.15rem' }}>{feedback.obs}</div>
            <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.1rem' }}>Evento de infraestructura añadido a la investigación.</div>
          </div>
        </>,
        T.STATUS.info,
      );
    case 'no-match':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconInfo size={20} color={T.INK.secondary} /></span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>La actividad seleccionada no presenta suficiente relación temporal con el incidente actual.</div>
            <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Revisa la hora, la magnitud del cambio y las referencias del nodo.</div>
          </div>
        </>,
        T.INK.secondary,
      );
    case 'explained':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconInfo size={20} color={T.INK.secondary} /></span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>El cambio observado tiene contexto operativo suficiente para no vincularlo todavía.</div>
            <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Revisa los eventos del servicio y su documentación.</div>
          </div>
        </>,
        T.INK.secondary,
      );
    case 'already':
      return wrap(<><IconInfo size={20} color={T.INK.secondary} /><div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Este nodo ya forma parte de la investigación.</div></>, T.INK.secondary);
  }
}
