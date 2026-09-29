import { useTheme } from '../../brand/ThemeContext';
import { RANGE, SPAN, seriesOf, toSeconds } from './data';
import type { InfraNode } from './types';

const FROM = toSeconds(RANGE.from);
const W = 960, H = 250, L = 46, R = 26, TOP = 14, BOT = 34;

const niceMax = (v: number) => { const step = v > 120 ? 50 : v > 40 ? 20 : 10; return Math.ceil((v * 1.08) / step) * step; };

/** Gráfica de actividad de un nodo (solicitudes por segundo). SVG simple, sin librerías; la misma para todos los nodos. */
export function ActivityChart({ node }: { node: InfraNode }) {
  const { theme: T } = useTheme();
  const data = seriesOf(node.id);
  const max = niceMax(Math.max(...data.map((d) => d.v)));
  const x = (s: number) => L + ((s - FROM) / SPAN) * (W - L - R);
  const y = (v: number) => TOP + (1 - v / max) * (H - TOP - BOT);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(d.s).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(FROM + SPAN)},${y(0)} L${x(FROM)},${y(0)} Z`;
  const grid = [0, max / 2, max];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Actividad de ${node.id}: solicitudes por segundo de ${RANGE.from.slice(0, 5)} a ${RANGE.to.slice(0, 5)}`} style={{ display: 'block' }}>
      {grid.map((g) => (
        <g key={g}>
          <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke={T.SURFACE.hairline} strokeWidth={1} />
          <text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize={12} fill={T.INK.secondary}>{Math.round(g)}</text>
        </g>
      ))}
      {RANGE.ticks.map((t) => (
        <g key={t}>
          <line x1={x(toSeconds(`${t}:00`))} x2={x(toSeconds(`${t}:00`))} y1={TOP} y2={H - BOT} stroke={T.SURFACE.hairlineSoft} strokeWidth={1} />
          <text x={x(toSeconds(`${t}:00`))} y={H - BOT + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={T.INK.secondary}>{t}</text>
        </g>
      ))}
      <path d={area} fill={T.BRAND.blue} opacity={0.1} />
      <path d={line} fill="none" stroke={T.BRAND.blue} strokeWidth={2.2} strokeLinejoin="round" />
      {node.events.map((e) => (
        <g key={e.time + e.text}>
          <circle cx={x(toSeconds(e.time))} cy={H - BOT + 4} r={4.5} fill={T.SURFACE.card} stroke={T.INK.secondary} strokeWidth={2}>
            <title>{`${e.time} · ${e.text}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

/** Miniatura para la lista de nodos: misma escala (0 → máximo propio) para que un nodo estable se vea plano. */
export function Sparkline({ id, color }: { id: string; color: string }) {
  const data = seriesOf(id);
  const max = Math.max(...data.map((d) => d.v));
  const w = 84, h = 26;
  const pts = data.map((d) => `${(((d.s - FROM) / SPAN) * w).toFixed(1)},${(h - 2 - (d.v / max) * (h - 4)).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </svg>
  );
}
