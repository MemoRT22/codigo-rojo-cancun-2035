import type { ReactNode } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconCheck, IconChevron, IconClock, IconDevice, IconInfo, IconPin, IconPlus, IconShield, IconTrace, IconUser } from '../shell/icons';
import type { StationPhase } from '../shell/types';
import { ActivityTimeline } from './ActivityTimeline';
import { KindIcon } from './IdentityEventList';
import { USER_MAP } from './data';
import { RESULT_LABEL } from './logic';
import type { AccessEvent, Feedback } from './types';

interface Props {
  event: AccessEvent | null;
  phase: StationPhase;
  paused: boolean;
  detailsOpen: boolean;
  feedback: Feedback | null;
  linked: boolean;
  onToggleDetails: () => void;
  onSubmit: () => void;
}

export function IdentityEventReader({ event, phase, paused, detailsOpen, feedback, linked, onToggleDetails, onSubmit }: Props) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = {
    background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden',
  };

  if (!event) {
    return (
      <section className="flex flex-col items-center justify-center text-center min-h-0" style={{ ...card, padding: '2rem' }} aria-label="Evento abierto">
        <IconShield size={44} color={T.INK.faint} />
        <div style={{ fontSize: '1.15rem', fontWeight: 620, marginTop: '1rem' }}>Selecciona un evento</div>
        <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.4rem', maxWidth: '26rem', lineHeight: 1.5 }}>
          Abre un evento para ver su detalle, la cronología del usuario y su perfil. Usa la búsqueda y los filtros para acotar la actividad.
        </div>
      </section>
    );
  }

  const user = USER_MAP.get(event.userId);
  const canSubmit = phase !== 'MISSION_FINISHED' && !paused && !linked;
  const tiles: { label: string; value: string; icon: ReactNode }[] = [
    { label: 'Usuario', value: event.userId, icon: <IconUser size={17} color={T.INK.secondary} /> },
    { label: 'Dispositivo', value: event.device, icon: <IconDevice size={17} color={T.INK.secondary} /> },
    { label: 'Zona', value: event.zone, icon: <IconPin size={17} color={T.INK.secondary} /> },
    { label: 'Hora', value: event.time, icon: <IconClock size={17} color={T.INK.secondary} /> },
    { label: 'Resultado', value: RESULT_LABEL[event.kind], icon: <KindIcon kind={event.kind} size={17} color={T.INK.secondary} /> },
  ];

  return (
    <section className="flex flex-col min-h-0" style={card} aria-label="Evento abierto">
      <div className="flex-1 overflow-y-auto" key={event.id}>
        <div className="animate-fade-in-up" style={{ padding: '1.5rem 2rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary }}>EVENTO DE IDENTIDAD</div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 650, lineHeight: 1.25, letterSpacing: '-0.01em', marginTop: '0.35rem' }}>
            {user?.name} <span style={{ fontWeight: 480, color: T.INK.secondary }}>· {event.userId}</span>
          </h1>

          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))', gap: '0.75rem', marginTop: '1.1rem' }}>
            {tiles.map((t) => (
              <div key={t.label} style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
                <dt className="flex items-center" style={{ gap: '0.45rem', fontSize: '0.75rem', fontWeight: 650, letterSpacing: '0.08em', color: T.INK.secondary, textTransform: 'uppercase' }}>{t.icon}{t.label}</dt>
                <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem', wordBreak: 'break-word' }}>{t.value}</dd>
              </div>
            ))}
            {(event.method || event.resource) && (
              <div style={{ padding: '0.75rem 0.95rem', borderRadius: '0.7rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
                <dt style={{ fontSize: '0.75rem', fontWeight: 650, letterSpacing: '0.08em', color: T.INK.secondary, textTransform: 'uppercase' }}>{event.method ? 'Autenticación' : 'Recurso'}</dt>
                <dd style={{ fontSize: '1.05rem', fontWeight: 620, marginTop: '0.3rem' }}>{event.method ?? event.resource}</dd>
              </div>
            )}
          </dl>
        </div>

        <div style={{ padding: '0.25rem 2rem 1.25rem', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
          <div className="flex items-baseline justify-between" style={{ paddingTop: '1rem', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.9375rem', fontWeight: 650 }}>Sesiones de {event.userId} hoy</div>
            <div style={{ fontSize: '0.8125rem', color: T.INK.secondary }}>08:40 – 09:20</div>
          </div>
          <ActivityTimeline userId={event.userId} selectedId={event.id} />

          <div style={{ marginTop: '1.5rem', border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.75rem', overflow: 'hidden' }}>
            <button
              onClick={onToggleDetails}
              aria-expanded={detailsOpen}
              className="w-full flex items-center justify-between"
              style={{ padding: '0.75rem 1rem', background: T.SURFACE.page, cursor: 'pointer', color: T.INK.primary, fontSize: '0.9375rem', fontWeight: 640 }}
            >
              <span className="inline-flex items-center" style={{ gap: '0.5rem' }}><IconTrace size={17} /> Detalles del evento</span>
              <IconChevron size={18} open={detailsOpen} />
            </button>
            {detailsOpen && <Details event={event} />}
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.SURFACE.hairline}`, padding: '0.9rem 2rem 1.1rem', background: T.SURFACE.card }}>
        <div aria-live="polite">{feedback && <FeedbackCard feedback={feedback} />}</div>
        <div className="flex items-center justify-between" style={{ gap: '1.5rem', marginTop: feedback ? '0.75rem' : 0 }}>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary, lineHeight: 1.45, maxWidth: '30rem' }}>
            {linked ? 'Este evento forma parte de la investigación actual.' : 'Vincula este evento con el incidente actual para incorporarlo como evidencia.'}
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

function Details({ event }: { event: AccessEvent }) {
  const { theme: T } = useTheme();
  const user = USER_MAP.get(event.userId);
  const rows: [string, ReactNode][] = [
    ['Identificador del evento', <span style={{ fontWeight: 620, letterSpacing: '0.02em' }}>{event.id}</span>],
    ['Tipo de evento', event.kind === 'actividad' ? 'Actividad de sesión' : 'Intento de acceso'],
    ['Usuario', `${user?.name} (${event.userId})`],
    ['Dispositivo', event.device],
    ['Zona', event.zone],
    ['Hora', event.time],
    ['Resultado', RESULT_LABEL[event.kind]],
    [event.method ? 'Método de autenticación' : 'Recurso consultado', event.method ?? event.resource ?? '—'],
    ['Contexto', event.context ?? 'Sin información adicional'],
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
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: Feedback }) {
  const { theme: T } = useTheme();
  const wrap = (children: ReactNode, accent: string) => (
    <div className="animate-fade-in-up flex items-start" style={{ gap: '0.8rem', padding: '0.85rem 1.1rem', borderRadius: '0.75rem', border: `1px solid ${accent}55`, background: `${accent}12` }}>
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
            <div style={{ fontSize: '1.3rem', fontWeight: 650, letterSpacing: '0.02em', marginTop: '0.15rem' }}>{feedback.eventId}</div>
            <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '0.1rem' }}>Evento de identidad añadido a la investigación.</div>
          </div>
        </>,
        T.STATUS.info,
      );
    case 'no-match':
      return wrap(
        <>
          <span style={{ marginTop: 2 }}><IconInfo size={20} color={T.INK.secondary} /></span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>La actividad seleccionada no presenta suficiente incompatibilidad con el perfil conocido.</div>
            <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Revisa usuario, dispositivo, zona y contexto.</div>
          </div>
        </>,
        T.INK.secondary,
      );
    case 'already':
      return wrap(<><IconInfo size={20} color={T.INK.secondary} /><div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Este evento ya forma parte de la investigación.</div></>, T.INK.secondary);
  }
}
