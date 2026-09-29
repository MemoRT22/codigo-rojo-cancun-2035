import { useTheme } from '../../brand/ThemeContext';
import { IconCheck, IconChevron, IconClip, IconFlag, IconInfo, IconLink, IconMail, IconPlus, IconTrace } from '../shell/icons';
import type { StationPhase } from '../shell/types';
import { MAILBOX, domainOf } from './data';
import type { Feedback, Message } from './types';

interface Props {
  message: Message | null;
  phase: StationPhase;
  paused: boolean;
  detailsOpen: boolean;
  feedback: Feedback | null;
  /** Este mensaje ya forma parte de la investigación. */
  linked: boolean;
  onToggleDetails: () => void;
  onSubmit: () => void;
  onLinkClick: () => void;
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

export function MessageReader({ message, phase, paused, detailsOpen, feedback, linked, onToggleDetails, onSubmit, onLinkClick }: Props) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = {
    background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden',
  };

  if (!message) {
    return (
      <section className="flex flex-col items-center justify-center text-center min-h-0" style={{ ...card, padding: '2rem' }} aria-label="Comunicación abierta">
        <IconMail size={44} color={T.INK.faint} />
        <div style={{ fontSize: '1.15rem', fontWeight: 620, marginTop: '1rem' }}>Selecciona una comunicación</div>
        <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.4rem', maxWidth: '26rem', lineHeight: 1.5 }}>
          Abre un mensaje para revisar su contenido y sus detalles. Usa la búsqueda y los filtros para acotar la bandeja.
        </div>
      </section>
    );
  }

  const canSubmit = phase !== 'MISSION_FINISHED' && !paused && !linked;
  const domain = domainOf(message.senderAddress);

  return (
    <section className="flex flex-col min-h-0" style={card} aria-label="Comunicación abierta">
      <div className="flex-1 overflow-y-auto" key={message.id}>
        <div className="animate-fade-in-up" style={{ padding: '1.5rem 2rem 1rem' }}>
          <div className="flex items-start justify-between" style={{ gap: '1rem' }}>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 650, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{message.subject}</h1>
            {message.priority === 'Alta' && (
              <span className="inline-flex items-center shrink-0" style={{ gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 999, border: `1px solid ${T.SURFACE.hairline}`, fontSize: '0.8125rem', fontWeight: 620, color: T.INK.secondary }}>
                <IconFlag size={14} /> Prioridad alta
              </span>
            )}
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: '1.1rem', gap: '1rem' }}>
            <div className="flex items-center" style={{ gap: '0.85rem' }}>
              <span
                className="inline-flex items-center justify-center shrink-0"
                aria-hidden
                style={{ width: 44, height: 44, borderRadius: 22, background: T.SURFACE.hairlineSoft, border: `1px solid ${T.SURFACE.hairline}`, fontWeight: 650, fontSize: '0.95rem', color: T.INK.secondary }}
              >
                {initials(message.senderName)}
              </span>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 650 }}>{message.senderName}</div>
                <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.1rem' }}>&lt;{message.senderAddress}&gt;</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{message.time}</div>
              <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.1rem' }}>Recibido</div>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary, marginTop: '0.75rem', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 620 }}>Para:</span> {MAILBOX.owner} &lt;{MAILBOX.address}&gt;
            {message.cc && <> · <span style={{ fontWeight: 620 }}>Cc:</span> {message.cc.join(', ')}</>}
          </div>
        </div>

        <div style={{ padding: '0.25rem 2rem 1rem', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
          <div style={{ fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: '46rem', paddingTop: '1.25rem' }}>
            {message.body.map((p, i) => <p key={i} style={{ marginBottom: '0.9rem' }}>{p}</p>)}
            {message.links.map((l) => (
              <p key={l.label} style={{ marginBottom: '0.9rem' }}>
                <a
                  href="#"
                  title={`Destino: ${l.destination}`}
                  onClick={(e) => { e.preventDefault(); onLinkClick(); }}
                  className="inline-flex items-center"
                  style={{ gap: '0.4rem', padding: '0.5rem 0.95rem', borderRadius: '0.6rem', background: `${T.BRAND.blue}12`, border: `1px solid ${T.BRAND.blue}44`, color: T.BRAND.blue, fontWeight: 620, fontSize: '0.9375rem', textDecoration: 'none' }}
                >
                  <IconLink size={16} /> {l.label}
                </a>
              </p>
            ))}
            <div style={{ color: T.INK.secondary, fontSize: '0.95rem', lineHeight: 1.5, marginTop: '1.1rem' }}>
              {message.signature.map((s, i) => <div key={i} style={{ fontWeight: i === 0 ? 620 : 450 }}>{s}</div>)}
            </div>
          </div>

          {message.attachments.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: '0.5rem', marginTop: '1.1rem' }}>
              {message.attachments.map((a) => (
                <span key={a.name} className="inline-flex items-center" style={{ gap: '0.5rem', padding: '0.45rem 0.8rem', borderRadius: '0.6rem', border: `1px solid ${T.SURFACE.hairline}`, fontSize: '0.875rem', fontWeight: 560 }}>
                  <IconClip size={16} /> {a.name} <span style={{ color: T.INK.secondary, fontWeight: 450 }}>{a.size}</span>
                </span>
              ))}
            </div>
          )}

          {/* Detalles del mensaje (metadatos inspeccionables) */}
          <div style={{ marginTop: '1.5rem', border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
            <button
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              className="w-full flex items-center justify-between"
              style={{ padding: '0.75rem 1rem', background: T.SURFACE.page, cursor: 'pointer', color: T.INK.primary, fontSize: '0.9375rem', fontWeight: 640 }}
            >
              <span className="inline-flex items-center" style={{ gap: '0.5rem' }}><IconTrace size={17} /> Detalles del mensaje</span>
              <IconChevron size={18} open={detailsOpen} />
            </button>
            {detailsOpen && <Details message={message} domain={domain} />}
          </div>
        </div>
      </div>

      {/* Zona de acción */}
      <div style={{ borderTop: `1px solid ${T.SURFACE.hairline}`, padding: '0.9rem 2rem 1.1rem', background: T.SURFACE.card }}>
        <div aria-live="polite" style={{ minHeight: feedback ? undefined : 0 }}>
          {feedback && <FeedbackCard feedback={feedback} />}
        </div>
        <div className="flex items-center justify-between" style={{ gap: '1.5rem', marginTop: feedback ? '0.75rem' : 0 }}>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary, lineHeight: 1.45, maxWidth: '30rem' }}>
            {linked
              ? 'Esta comunicación forma parte de la investigación actual.'
              : 'Vincula esta comunicación con el incidente actual para incorporarla como evidencia.'}
          </div>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center shrink-0"
            style={{
              gap: '0.55rem', padding: '0.8rem 1.4rem', borderRadius: '0.7rem', fontSize: '0.9375rem', fontWeight: 660, letterSpacing: '0.01em',
              cursor: canSubmit ? 'pointer' : 'default',
              background: canSubmit ? T.BRAND.blue : T.SURFACE.hairlineSoft,
              color: canSubmit ? '#fff' : T.INK.secondary,
              border: `1px solid ${canSubmit ? T.BRAND.blue : T.SURFACE.hairline}`,
              boxShadow: canSubmit ? `0 4px 14px ${T.BRAND.blue}44` : 'none',
              transition: 'transform .12s, box-shadow .2s',
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

function Details({ message, domain }: { message: Message; domain: string }) {
  const { theme: T } = useTheme();
  const rows: [string, React.ReactNode][] = [
    ['Identificador del mensaje', <span style={{ fontWeight: 620, letterSpacing: '0.02em' }}>{message.id}</span>],
    ['Remitente', `${message.senderName} <${message.senderAddress}>`],
    ['Dominio del remitente', domain],
    ['Responder a', message.senderAddress],
    ['Destinatario', MAILBOX.address],
    ['Recibido', message.time],
    ['Prioridad', message.priority],
    ['Historial con el remitente', message.previousFromSender === 0 ? 'Sin mensajes anteriores' : `${message.previousFromSender} mensajes anteriores`],
    ['Enlaces (destino)', message.links.length ? (
      <div>{message.links.map((l) => <div key={l.label} style={{ wordBreak: 'break-all' }}>{l.destination}</div>)}</div>
    ) : 'Sin enlaces'],
    ['Adjuntos', message.attachments.length ? message.attachments.map((a) => a.name).join(', ') : 'Sin adjuntos'],
  ];
  return (
    <div className="animate-fade-in-up" style={{ padding: '0.5rem 1rem 1rem' }}>
      <dl style={{ display: 'grid', gridTemplateColumns: '13rem 1fr', rowGap: '0.55rem', columnGap: '1rem', fontSize: '0.9rem', paddingTop: '0.5rem' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>{k}</dt>
            <dd style={{ color: T.INK.primary }}>{v}</dd>
          </div>
        ))}
      </dl>
      <div style={{ marginTop: '1rem', fontSize: '0.8125rem', fontWeight: 620, color: T.INK.secondary, letterSpacing: '0.06em' }}>RUTA DE ENTREGA</div>
      <ol className="flex items-stretch" style={{ gap: '0.5rem', marginTop: '0.5rem', listStyle: 'none' }}>
        {message.route.map((h, i) => (
          <li key={h.host} className="flex items-center" style={{ gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <div style={{ flex: 1, minWidth: 0, padding: '0.55rem 0.7rem', borderRadius: '0.6rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
              <div style={{ fontSize: '0.75rem', color: T.INK.secondary, fontWeight: 600 }}>{h.role}</div>
              <div className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 560, marginTop: '0.1rem' }}>{h.host}</div>
            </div>
            {i < message.route.length - 1 && <span style={{ color: T.INK.faint, fontSize: '1rem' }} aria-hidden>→</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const { theme: T } = useTheme();
  const wrap = (children: React.ReactNode, accent: string) => (
    <div
      className="animate-fade-in-up flex items-start"
      style={{ gap: '0.8rem', padding: '0.85rem 1.1rem', borderRadius: '0.75rem', border: `1px solid ${accent}55`, background: `${accent}12` }}
    >
      {children}
    </div>
  );
  switch (feedback.kind) {
    case 'registered':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconCheck size={22} color={T.STATUS.info} /></span>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: T.STATUS.info }}>EVIDENCIA REGISTRADA</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 650, letterSpacing: '0.02em', marginTop: '0.15rem' }}>{feedback.messageId}</div>
            <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.1rem' }}>Comunicación añadida a la investigación.</div>
          </div>
        </>,
        T.STATUS.info,
      );
    case 'no-match':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconInfo size={20} color={T.INK.secondary} /></span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>Sin coincidencia suficiente con el incidente actual.</div>
            <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Revisa la comunicación y sus metadatos.</div>
          </div>
        </>,
        T.INK.secondary,
      );
    case 'already':
      return wrap(<><IconInfo size={20} color={T.INK.secondary} /><div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Esta comunicación ya forma parte de la investigación.</div></>, T.INK.secondary);
    case 'link-blocked':
      return wrap(
        <>
          <IconInfo size={20} color={T.INK.secondary} />
          <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Enlace neutralizado: no se abre en el entorno de análisis.</div>
        </>,
        T.INK.secondary,
      );
  }
}
