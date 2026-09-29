import { useTheme } from '../brand/ThemeContext';
import type { SystemEvent } from '../types';
import { ZONE_MAP, type ZoneId } from '../world/model';

const zoneName = (z?: string) => (z ? ZONE_MAP.get(z as ZoneId)?.name : undefined);

export function Feed({ events }: { events: SystemEvent[] }) {
  const { theme: T } = useTheme();
  const LEVEL_COLOR: Record<SystemEvent['level'], string> = {
    info: T.mode === 'midnight' ? '#5A80A8' : '#8AA0BE',
    warning: T.STATUS.warn,
    critical: T.STATUS.crit,
    recovery: T.STATUS.recover,
  };
  return (
    <div className="absolute" style={{ left: 48, top: 668, width: 400 }}>
      <div className="absolute pointer-events-none" style={{ left: -60, top: -40, width: 560, height: 350, background: T.ui.fogFeed }} />
      <div className="relative" style={{ fontSize: 12, fontWeight: 620, letterSpacing: '0.14em', color: T.INK.faint, marginBottom: 12, textTransform: 'uppercase' }}>Actividad reciente</div>
      <div className="relative" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.slice(0, 5).map((e, i) => (
          <div key={e.id} className="animate-fade-in-up" style={{ display: 'flex', gap: 12, opacity: Math.max(0.55, 1 - i * 0.1) }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, marginTop: 8, background: LEVEL_COLOR[e.level], flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 520, color: T.INK.primary, lineHeight: 1.3 }}>{e.message}</div>
              <div style={{ fontSize: 13, fontWeight: 540, color: T.INK.tertiary, marginTop: 2 }}>
                {e.time}{zoneName(e.zone) ? ` \u00B7 ${zoneName(e.zone)}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
