import { DOMAIN_MAP, INK, STATUS, type DomainId } from '../brand/tokens';
import { DOMAIN_ICONS } from '../brand/DomainIcons';
import type { ZoneSummary } from '../world/derive';
import { ZONE_MAP, type ZoneId } from '../world/model';
import { STAGE, W, H } from '../map/scene';
import { STATUS_FILL, STATUS_TEXT, ZONE_STATUS_LABEL } from './status';

// Colocación de las tarjetas: la instrumentación vive junto a su territorio, en el espacio libre
// (hinterland al oeste, Caribe al este). `side` indica desde qué borde sale la línea de referencia.
const CARD_W = 268;
const CARD_H = 134;

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
          const c = fill ?? INK.secondary;
          return (
            <g key={z.id}>
              <line x1={sx} y1={sy} x2={ax} y2={ay} stroke={c} strokeWidth="1.6" strokeOpacity="0.7" />
              <ellipse cx={ax} cy={ay} rx="17" ry="8" fill={c} fillOpacity="0.16" stroke={c} strokeWidth="1.6" strokeOpacity="0.8" />
              <circle cx={ax} cy={ay} r="4" fill={c} stroke="#fff" strokeWidth="1.6" />
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
              left: p.x, top: p.y, width: CARD_W, height: CARD_H, borderRadius: 12, background: 'rgba(255,255,255,0.95)',
              border: '1px solid #D8E0E9', boxShadow: '0 8px 26px rgba(14,29,51,0.13)', padding: '13px 16px 0 20px', overflow: 'hidden',
              transition: 'border-color .8s, box-shadow .8s',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0" style={{ width: 5, background: accent, transition: 'background .8s' }} />
            <div style={{ fontSize: 15, fontWeight: 680, letterSpacing: '0.09em', color: INK.primary, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{z.name}</div>
            <div className="flex items-end" style={{ marginTop: 9, gap: 26 }}>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div className="flex items-baseline">
                  <span style={{ fontSize: 32, fontWeight: 640, lineHeight: 1, color: z.online < z.total ? STATUS_TEXT.warn : INK.primary }}>{z.online}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: INK.tertiary }}>/{z.total}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: INK.secondary, marginTop: 3 }}>nodos en línea</div>
              </div>
              <div style={{ whiteSpace: 'nowrap' }}>
                <div className="flex items-baseline">
                  <span style={{ fontSize: 32, fontWeight: 640, lineHeight: 1, color: z.latencyMs >= 45 ? STATUS_TEXT.crit : z.latencyMs >= 32 ? STATUS_TEXT.warn : INK.primary }}>{z.latencyMs}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: INK.tertiary, marginLeft: 2 }}>ms</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: INK.secondary, marginTop: 3 }}>latencia</div>
              </div>
            </div>
            <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 650, color: STATUS_TEXT[z.worst] }}>{ZONE_STATUS_LABEL[z.worst]}</span>
              <div className="flex items-center" style={{ gap: 6 }}>
                {z.services.map((sv) => {
                  const Icon = DOMAIN_ICONS[sv.domain as DomainId];
                  const sf = STATUS_FILL[sv.worst];
                  return (
                    <span key={sv.domain} className="relative" style={{ display: 'inline-flex' }}>
                      <Icon size={17} color={DOMAIN_MAP.get(sv.domain)!.color} />
                      {sf && <span style={{ position: 'absolute', right: -3, top: -3, width: 9, height: 9, borderRadius: 5, background: sf, border: '1.5px solid #fff' }} />}
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
