import { useTheme } from '../../brand/ThemeContext';
import { IconUser } from '../shell/icons';
import { USER_MAP } from './data';
import { sessionsOf } from './logic';

/** Perfil de la identidad del evento abierto: datos habituales y sesiones. Igual para todos los usuarios. */
export function IdentityProfile({ userId, onShowActivity }: { userId: string | null; onShowActivity: (userId: string) => void }) {
  const { theme: T } = useTheme();
  const user = userId ? USER_MAP.get(userId) : undefined;
  const card: React.CSSProperties = {
    background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem',
  };
  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' };

  if (!user) {
    return (
      <section id="identity-profile" style={card} aria-label="Perfil de identidad">
        <span style={label}>Perfil de identidad</span>
        <div style={{ marginTop: '0.9rem', fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.5 }}>
          Selecciona un evento para consultar el perfil de la identidad asociada.
        </div>
      </section>
    );
  }

  const sessions = sessionsOf(user.id);
  const initials = user.name.split(/\s+/).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  const row = (k: string, v: string) => (
    <div key={k} style={{ display: 'contents' }}>
      <dt style={{ color: T.INK.secondary, fontWeight: 560 }}>{k}</dt>
      <dd style={{ color: T.INK.primary, fontWeight: 560 }}>{v}</dd>
    </div>
  );

  return (
    <section id="identity-profile" style={card} aria-label="Perfil de identidad" key={user.id} className="animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span style={label}>Perfil de identidad</span>
        <IconUser size={16} color={T.INK.secondary} />
      </div>
      <div className="flex items-center" style={{ gap: '0.85rem', marginTop: '0.9rem' }}>
        <span
          className="inline-flex items-center justify-center shrink-0"
          aria-hidden
          style={{ width: 48, height: 48, borderRadius: 24, background: T.SURFACE.hairlineSoft, border: `1px solid ${T.SURFACE.hairline}`, fontWeight: 650, color: T.INK.secondary }}
        >
          {initials}
        </span>
        <div className="min-w-0">
          <div style={{ fontSize: '1.05rem', fontWeight: 650 }}>{user.name}</div>
          <div style={{ fontSize: '0.875rem', color: T.INK.secondary }}>{user.id} · {user.role}</div>
        </div>
      </div>

      <dl style={{ display: 'grid', gridTemplateColumns: '8.5rem 1fr', rowGap: '0.5rem', columnGap: '0.75rem', fontSize: '0.875rem', marginTop: '1rem' }}>
        {row('Equipo habitual', user.habitualDevice)}
        {row('Zona habitual', user.habitualZone)}
        {row('Dispositivos registrados', user.knownDevices.join(', '))}
      </dl>

      <div style={{ ...label, marginTop: '1.15rem' }}>Sesiones activas · {sessions.length}</div>
      <ul style={{ listStyle: 'none', marginTop: '0.55rem', display: 'grid', gap: '0.5rem' }}>
        {sessions.map((s) => (
          <li key={s.device} style={{ padding: '0.6rem 0.75rem', borderRadius: '0.6rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page }}>
            <div className="flex items-center justify-between" style={{ gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 640 }}>{s.device}</span>
              <span style={{ fontSize: '0.8125rem', color: T.INK.secondary }}>{s.zone}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Desde {s.since} · última actividad {s.last}</div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onShowActivity(user.id)}
        style={{ marginTop: '1rem', padding: '0.45rem 0.8rem', borderRadius: '0.6rem', border: `1px solid ${T.SURFACE.hairline}`, background: 'transparent', color: T.INK.primary, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
      >
        Ver toda su actividad
      </button>
    </section>
  );
}
