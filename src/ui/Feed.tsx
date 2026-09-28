import { INK, STATUS } from '../brand/tokens';
import type { SystemEvent } from '../types';
import { ZONE_MAP, type ZoneId } from '../world/model';

const LEVEL_COLOR: Record<SystemEvent['level'], string> = {
  info: '#8AA0BE',
  warning: STATUS.warn,
  critical: STATUS.crit,
  recovery: STATUS.recover,
};

const zoneName = (z?: string) => (z ? ZONE_MAP.get(z as ZoneId)?.name : undefined);

export function Feed({ events }: { events: SystemEvent[] }) {
  return (
    <div className="absolute" style={{ left: 48, top: 668, width: 400 }}>
      <div className="absolute pointer-events-none" style={{ left: -60, top: -40, width: 560, height: 350, background: 'radial-gradient(ellipse at 30% 45%, rgba(243,241,235,0.93) 0%, rgba(243,241,235,0.8) 50%, rgba(243,241,235,0) 78%)' }} />
      <div className="relative" style={{ fontSize: 14, fontWeight: 650, letterSpacing: '0.14em', color: INK.secondary, marginBottom: 10 }}>ACTIVIDAD RECIENTE</div>
      <div className="relative" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {events.slice(0, 5).map((e, i) => (
          <div key={e.id} className="animate-fade-in-up" style={{ display: 'flex', gap: 11, opacity: Math.max(0.6, 1 - i * 0.1) }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, marginTop: 8, background: LEVEL_COLOR[e.level], flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 560, color: INK.primary, lineHeight: 1.25 }}>{e.message}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: LEVEL_COLOR[e.level] ?? INK.tertiary, opacity: 0.85, marginTop: 1 }}>
                {e.time}{zoneName(e.zone) ? ` · ${zoneName(e.zone)}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
