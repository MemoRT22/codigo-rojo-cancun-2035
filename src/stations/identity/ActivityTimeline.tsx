import { useTheme } from '../../brand/ThemeContext';
import { TIMELINE } from './data';
import { toSeconds, sessionsOf, eventsOf } from './logic';
import type { AccessEvent } from './types';

const FROM = toSeconds(TIMELINE.from);
const SPAN = toSeconds(TIMELINE.to) - FROM;
const pct = (t: string) => `${Math.min(100, Math.max(0, ((toSeconds(t) - FROM) / SPAN) * 100))}%`;

/**
 * Cronología de un usuario: un carril por dispositivo (sesión), con sus eventos.
 * Se dibuja igual para todos los usuarios; no marca ni colorea ninguna sesión.
 */
export function ActivityTimeline({ userId, selectedId }: { userId: string; selectedId: string | null }) {
  const { theme: T } = useTheme();
  const sessions = sessionsOf(userId);
  const events = eventsOf(userId);
  const laneEvents = (device: string) => events.filter((e) => e.device === device);

  return (
    <div>
      <div style={{ position: 'relative', marginLeft: '11.5rem', height: '1.25rem' }}>
        {TIMELINE.ticks.map((t) => (
          <span key={t} style={{ position: 'absolute', left: pct(`${t}:00`), transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600, color: T.INK.secondary }}>{t}</span>
        ))}
      </div>
      {sessions.map((s) => (
        <div key={s.device} className="flex items-center" style={{ marginTop: '0.5rem' }}>
          <div style={{ width: '11.5rem', paddingRight: '0.75rem', flexShrink: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 620 }}>{s.device}</div>
            <div style={{ fontSize: '0.75rem', color: T.INK.secondary }}>{s.zone}</div>
          </div>
          <div style={{ position: 'relative', flex: 1, height: '2rem', borderRadius: 8, background: T.SURFACE.page, border: `1px solid ${T.SURFACE.hairlineSoft}` }}>
            {TIMELINE.ticks.map((t) => (
              <span key={t} style={{ position: 'absolute', left: pct(`${t}:00`), top: 0, bottom: 0, width: 1, background: T.SURFACE.hairline }} />
            ))}
            <span style={{ position: 'absolute', left: pct(s.since), width: `calc(${pct(s.last)} - ${pct(s.since)})`, minWidth: 4, top: '0.8rem', height: 4, borderRadius: 2, background: T.INK.faint, opacity: 0.6 }} />
            {laneEvents(s.device).map((e) => <Marker key={e.id} e={e} selected={e.id === selectedId} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Marker({ e, selected }: { e: AccessEvent; selected: boolean }) {
  const { theme: T } = useTheme();
  const size = e.kind === 'actividad' ? 8 : 12;
  return (
    <span
      title={`${e.time} · ${e.kind === 'concedido' ? 'Acceso concedido' : e.kind === 'denegado' ? 'Acceso denegado' : 'Actividad de sesión'}`}
      style={{
        position: 'absolute', left: pct(e.time), top: '50%', width: size, height: size, transform: 'translate(-50%,-50%)', borderRadius: '50%',
        background: e.kind === 'denegado' ? T.SURFACE.card : T.INK.secondary,
        border: `2px solid ${T.INK.secondary}`,
        boxShadow: selected ? `0 0 0 3px ${T.BRAND.blue}` : 'none',
        outline: selected ? `1px solid ${T.SURFACE.card}` : 'none',
      }}
    />
  );
}
