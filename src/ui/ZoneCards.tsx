import { DOMAIN_MAP, INK, STATUS, SURFACE, type DomainId } from '../brand/tokens';
import { DOMAIN_ICONS } from '../brand/DomainIcons';
import type { ZoneSummary } from '../world/derive';
import { ZONE_MAP, type ZoneId } from '../world/model';
import { STAGE, W, H } from '../map/scene';
import { STATUS_FILL, STATUS_TEXT, ZONE_STATUS_LABEL } from './status';

const CARD_W = 268;
const CARD_H = 138;

const PLACEMENT: Record<ZoneId, { x: number; y: number; side: 'l' | 'r' | 'b' }> = {
  centro: { x: 770, y: 128, side: 'r' },
  puertoJuarez: { x: 1420, y: 128, side: 'l' },
  zhNorte: { x: 1592, y: 380, side: 'l' },
  zhSur: { x: 1480, y: 652, side: 'l' },
  nichupte: { x: 690, y: 640, side: 'r' },
  aeropuerto: { x: 64, y: 452, side: 'r' },
};

export function ZoneCards({ zones }: { zones: ZoneSummary[] }) {
  return (
    <>
      <svg className="absolute inset-0 pointer-events-none" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
        {zones.map((z) => {
          const zone = ZONE_MAP.get(z.id)!;
          const [ax, ay] = STAGE.project(zone.anchor[0], zone.anchor[1]);
          const p = PLACEMENT[z.id];
          const sx = p.side === 'r' ? p.x + CARD_W : p.x;
          const sy = p.y + CARD_H / 2;
          const fill = STATUS_FILL[z.worst];
          const c = fill ?? INK.faint;
          return (
            <g key={z.id}>
              <line x1={sx} y1={sy} x2={ax} y2={ay} stroke={c} strokeWidth="1.2" strokeOpacity="0.55" />
              <ellipse cx={ax} cy={ay} rx="16" ry="7" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.2" strokeOpacity="0.6" />
              <circle cx={ax} cy={ay} r="3.5" fill={c} stroke="#fff" strokeWidth="1.4" />
            </g>
          );
        })}
      </svg>
      {zones.map((z) => {
        const p = PLACEMENT[z.id];
        const fill = STATUS_FILL[z.worst];
        const accent = fill ?? STATUS.ok;
        return (
          <div
            key={z.id}
            className="absolute"
            style={{
              left: p.x, top: p.y, width: CARD_W, height: CARD_H, borderRadius: 16, background: 'rgba(255,255,255,0.94)',
              border: `1px solid ${SURFACE.hairline}`, boxShadow: `0 4px 20px ${SURFACE.shadowLg}, 0 1px 3px ${SURFACE.shadow}`, padding: '14px 16px 0 22px', overflow: 'hidden',
              transition: 'border-color 1s, box-shadow 1s',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0" style={{ width: 4, borderRadius: '16px 0 0 16px', background: accent, transition: 'background 1s' }} />
            <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: '0.08em', color: INK.primary, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{z.name}</div>
            <div className="flex items-end" style={{ marginTop: 10, gap: 28 }}>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div className="flex items-baseline">
                  <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1, color: z.online < z.total ? STATUS_TEXT.warn : INK.primary }}>{z.online}</span>
                  <span style={{ fontSize: 16, fontWeight: 480, color: INK.faint }}>/{z.total}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 560, color: INK.tertiary, marginTop: 4, letterSpacing: '0.02em' }}>nodos en línea</div>
              </div>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div className="flex items-baseline">
                  <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1, color: z.latencyMs >= 45 ? STATUS_TEXT.crit : z.latencyMs >= 32 ? STATUS_TEXT.warn : INK.primary }}>{z.latencyMs}</span>
                  <span style={{ fontSize: 16, fontWeight: 480, color: INK.faint, marginLeft: 2 }}>ms</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 560, color: INK.tertiary, marginTop: 4, letterSpacing: '0.02em' }}>latencia</div>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 620, color: STATUS_TEXT[z.worst] }}>{ZONE_STATUS_LABEL[z.worst]}</span>
              <div className="flex items-center" style={{ gap: 7 }}>
                {z.services.map((sv) => {
                  const Icon = DOMAIN_ICONS[sv.domain as DomainId];
                  const sf = STATUS_FILL[sv.worst];
                  return (
                    <span key={sv.domain} className="relative" style={{ display: 'inline-flex' }}>
                      <Icon size={16} color={DOMAIN_MAP.get(sv.domain)!.color} />
                      {sf && <span style={{ position: 'absolute', right: -3, top: -3, width: 8, height: 8, borderRadius: 4, background: sf, border: '1.5px solid #fff' }} />}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
