import { DOMAINS, INK, SURFACE } from '../brand/tokens';
import { DOMAIN_ICONS } from '../brand/DomainIcons';
import type { WorldView } from '../world/useWorld';
import { DOCK_H, H } from '../map/scene';
import { domainLabel } from '../world/derive';
import { STATUS_FILL, STATUS_TEXT } from './status';

export function Dock({ w, countdown, countdownRunning }: { w: WorldView; countdown: string | null; countdownRunning: boolean }) {
  return (
    <div className="absolute" style={{ left: 48, top: H - DOCK_H + 8, width: 1824, height: 100 }}>
      <div className="flex" style={{ background: 'rgba(255,255,255,0.93)', borderRadius: 18, border: `1px solid ${SURFACE.hairline}`, boxShadow: `0 4px 24px ${SURFACE.shadowLg}, 0 1px 3px ${SURFACE.shadow}`, height: 100, overflow: 'hidden' }}>
        {DOMAINS.map((d, i) => {
          const s = w.derived.domains.find((x) => x.id === d.id)!;
          const Icon = DOMAIN_ICONS[d.id];
          return (
            <div key={d.id} style={{ flex: 1, padding: '12px 16px 0 20px', borderLeft: i ? `1px solid ${SURFACE.hairlineSoft}` : undefined, position: 'relative' }}>
              <div className="flex items-center" style={{ gap: 10 }}>
                <Icon size={22} color={d.color} />
                <span style={{ fontSize: 16, fontWeight: 620, color: INK.primary, whiteSpace: 'nowrap' }}>{d.label}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                <div className="flex" style={{ gap: 3 }}>
                  {s.segments.map((seg, k) => (
                    <span key={k} style={{ width: 14, height: 10, borderRadius: 3, background: STATUS_FILL[seg] ?? d.color, opacity: seg === 'ok' ? 0.85 : 1, transition: 'background 1s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.online < s.total ? STATUS_TEXT.warn : INK.tertiary }}>{s.online}/{s.total}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 620, color: STATUS_TEXT[s.worst], marginTop: 6, whiteSpace: 'nowrap' }}>{domainLabel(s)}</div>
            </div>
          );
        })}
        <div style={{ width: countdown ? 260 : 0, borderLeft: `1px solid ${SURFACE.hairlineSoft}`, padding: '12px 20px 0 24px', display: countdown ? 'block' : 'none', background: 'rgba(242,244,247,0.5)', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 12, fontWeight: 620, letterSpacing: '0.1em', color: INK.tertiary, textTransform: 'uppercase' }}>Tiempo de respuesta</div>
          <div style={{ fontSize: 48, fontWeight: 520, lineHeight: 1.05, marginTop: 6, color: countdownRunning ? INK.primary : INK.faint, letterSpacing: '0.02em' }}>{countdown}</div>
        </div>
      </div>
    </div>
  );
}
