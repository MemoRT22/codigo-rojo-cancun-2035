import { memo } from 'react';
import { useTheme } from '../brand/ThemeContext';
import type { DomainId, Theme } from '../brand/themes';
import type { NodeStatus } from '../types';
import type { Flags } from '../world/scenario';
import type { ZoneSummary } from '../world/derive';
import { NODES, ZONES, type WorldNode } from '../world/model';
import { W, H } from './scene';
import {
  CORRELATION_GEO, CORRIDOR_GEO, HEX_CELLS, LINK_GEO, NODE_POS, NODE_POS_NI, REMOTE_ORIGIN_POS, REMOTE_POLY,
  groundCircle, polyPath, posOf, sensorRadius,
} from './geometry';

interface Props {
  status: Record<string, NodeStatus>;
  flags: Flags;
  zones: ZoneSummary[];
  version: string;
}

export function statusColor(s: NodeStatus, T: Theme): string | null {
  switch (s) {
    case 'warn': return T.STATUS.warn;
    case 'crit': return T.STATUS.crit;
    case 'off': case 'isolated': return T.STATUS.isolated;
    case 'recovering': return T.STATUS.recover;
    default: return null;
  }
}

const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

const ZONE_WASH_R: Record<string, number> = { centro: 2300, puertoJuarez: 1500, zhNorte: 1900, zhSur: 1900, nichupte: 2000, aeropuerto: 1700 };

function Glyph({ n, s, reveal, T }: { n: WorldNode; s: NodeStatus; reveal: boolean; T: Theme }) {
  const [x, y] = posOf(n);
  const dcolor = (d: DomainId) => T.DOMAIN_MAP.get(d)!.color;
  const base = dcolor(n.domain);
  const off = s === 'off' || s === 'isolated';
  const fill = off ? T.STATUS.isolated : base;
  const ring = statusColor(s, T);
  const R = n.hub ? 1.35 : 1;
  const W = T.ui.nodeWhite;
  const shape = (() => {
    switch (n.domain) {
      case 'identidad':
        return (<><circle r={9 * R} fill={W} stroke={fill} strokeWidth="2.2" /><circle r={3.2 * R} fill={fill} /></>);
      case 'infraestructura':
        return <rect x={-7 * R} y={-7 * R} width={14 * R} height={14 * R} rx="3.5" fill={fill} stroke={W} strokeWidth="1.8" />;
      case 'movilidad':
        return <rect x={-5.5 * R} y={-5.5 * R} width={11 * R} height={11 * R} rx="2" transform="rotate(45)" fill={fill} stroke={W} strokeWidth="1.6" />;
      case 'sensores':
        return <circle r={5 * R} fill={fill} stroke={W} strokeWidth="1.8" />;
      case 'turismo':
        return <circle r={4.2 * R} fill={W} stroke={fill} strokeWidth="2.2" />;
      case 'inteligencia':
        return (<><rect x={-8 * R} y={-8 * R} width={16 * R} height={16 * R} rx="3" transform="rotate(45)" fill={fill} stroke={W} strokeWidth="1.8" /><circle r={2.6 * R} fill={W} /></>);
    }
  })();
  const ringR = (n.domain === 'infraestructura' ? 12 : n.domain === 'inteligencia' ? 15 : 13) * R;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.28)`}>
      {n.domain !== 'inteligencia' && <ellipse cy="8" rx="9" ry="3" fill={T.INK.primary} opacity={T.mode === 'midnight' ? 0.15 : 0.08} />}
      {ring && s !== 'off' && s !== 'isolated' && (
        <circle r={ringR} fill="none" stroke={ring} strokeWidth="2" strokeDasharray={s === 'recovering' ? '3 4' : undefined} opacity="0.85" />
      )}
      {s === 'watch' && <circle r={ringR} fill="none" stroke={base} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.6" />}
      {(s === 'off' || s === 'isolated') && <circle r={ringR} fill="none" stroke={T.STATUS.isolated} strokeWidth="1.4" strokeDasharray="2 4" opacity="0.7" />}
      {s === 'ok' && <circle r={ringR * 0.9} fill={fill} fillOpacity={T.mode === 'midnight' ? 0.1 : 0.06} />}
      {shape}
      {s === 'off' && <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke={W} strokeWidth="1.6" strokeLinecap="round" />}
      {reveal && n.id === 'SIN-04' && (
        <g transform="translate(16 -16)">
          <rect x="-4" y="-13" width="66" height="22" rx="6" fill={T.ui.sevBadgeBg} stroke={T.INK.faint} strokeWidth="0.8" />
          <text x="29" y="3" textAnchor="middle" fontSize="13" fontWeight="600" fill={T.INK.primary}>SIN-04</text>
        </g>
      )}
    </g>
  );
}

export const DomainLayers = memo(function DomainLayers({ status, flags, zones }: Props) {
  const { theme: T } = useTheme();
  const dcolor = (d: DomainId) => T.DOMAIN_MAP.get(d)!.color;

  const linkStatus = (a: string, b: string): NodeStatus => {
    const sa = status[a]!, sb = status[b]!;
    for (const s of ['crit', 'off', 'warn', 'recovering', 'isolated', 'watch'] as NodeStatus[]) if (sa === s || sb === s) return s;
    return 'ok';
  };

  const hubs = NODES.filter((n) => n.domain !== 'inteligencia');
  const ni = NODES.filter((n) => n.domain === 'inteligencia');
  const W2 = T.ui.nodeWhite;

  return (
    <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      {zones.map((z) => {
        const anchor = ZONES.find((zz) => zz.id === z.id)!.anchor;
        const intensity = Math.min(1, z.stress / 14);
        if (intensity < 0.05) return null;
        const crit = z.worst === 'crit';
        const color = crit ? T.STATUS.crit : T.STATUS.warn;
        const ring = groundCircle(anchor[0], anchor[1], ZONE_WASH_R[z.id] ?? 2200);
        return (
          <g key={z.id} style={{ transition: 'opacity 1.4s' }}>
            <path d={`${polyPath(ring)}Z`} fill={color} opacity={crit ? 0.04 + 0.08 * intensity : 0.025} />
            <path d={`${polyPath(ring)}Z`} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="6 8" opacity={0.2 + 0.35 * intensity} />
          </g>
        );
      })}

      {NODES.filter((n) => n.domain === 'sensores').map((n) => {
        const s = status[n.id]!;
        const c = s === 'off' ? T.STATUS.isolated : dcolor('sensores');
        const ring = groundCircle(n.at[0], n.at[1], sensorRadius(n.id));
        return (
          <g key={n.id}>
            <path d={`${polyPath(ring)}Z`} fill={c} fillOpacity={s === 'off' ? 0.03 : T.mode === 'midnight' ? 0.1 : 0.08} stroke={c} strokeOpacity={T.mode === 'midnight' ? 0.5 : 0.45} strokeWidth="1.2" strokeDasharray={s === 'off' ? '3 6' : undefined} />
          </g>
        );
      })}

      <g strokeLinejoin="round">
        {HEX_CELLS.map((c, i) => {
          const ns = status[c.node]!;
          const stress = ns === 'warn' || ns === 'crit';
          const top = stress ? mixHex(dcolor('turismo'), T.STATUS.warn, 0.5) : dcolor('turismo');
          const side = stress ? mixHex('#0E8C82', '#B07600', 0.5) : T.mode === 'midnight' ? '#0A6860' : '#0E8C82';
          const sideL = stress ? mixHex('#12A098', '#C98A08', 0.5) : T.mode === 'midnight' ? '#0E7E74' : '#12A098';
          const faces = [];
          for (let k = 0; k < 6; k++) {
            const k2 = (k + 1) % 6;
            const bmid = (c.base[k]![1] + c.base[k2]![1]) / 2;
            const cy = c.base.reduce((a, p) => a + p[1], 0) / 6;
            if (bmid <= cy) continue;
            const q = `M${c.base[k]![0].toFixed(1)},${c.base[k]![1].toFixed(1)} L${c.base[k2]![0].toFixed(1)},${c.base[k2]![1].toFixed(1)} L${c.top[k2]![0].toFixed(1)},${c.top[k2]![1].toFixed(1)} L${c.top[k]![0].toFixed(1)},${c.top[k]![1].toFixed(1)}Z`;
            const left = c.base[k]![0] + c.base[k2]![0] < 2 * (c.base.reduce((a, p) => a + p[0], 0) / 6);
            faces.push(<path key={k} d={q} fill={left ? sideL : side} stroke={W2} strokeOpacity={T.mode === 'midnight' ? 0.2 : 0.5} strokeWidth="0.5" />);
          }
          return (
            <g key={i}>
              {faces}
              <path d={`${polyPath(c.top)}Z`} fill={top} fillOpacity={c.ring === 0 ? 0.95 : c.ring === 1 ? 0.82 : 0.68} stroke={W2} strokeWidth={T.mode === 'midnight' ? 0.5 : 0.8} strokeOpacity={T.mode === 'midnight' ? 0.3 : 1} />
            </g>
          );
        })}
      </g>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {CORRIDOR_GEO.map((c) =>
          c.paths.map((d, i) => (
            <g key={`${c.id}-${i}`}>
              <path d={d} stroke={W2} strokeWidth={3.4 + c.load * 1.0} opacity={T.mode === 'midnight' ? 0.15 : 0.8} />
              <path d={d} stroke={dcolor('movilidad')} strokeWidth={1.6 + c.load * 0.8} opacity={T.mode === 'midnight' ? 0.65 : 0.5 + c.load * 0.2} />
            </g>
          )),
        )}
      </g>

      <g fill="none" strokeLinecap="round">
        {LINK_GEO.map((l) => {
          const ls = linkStatus(l.a, l.b);
          const col = statusColor(ls, T);
          if (l.kind === 'troncal') {
            return (
              <g key={`${l.a}-${l.b}`}>
                <path d={l.path} stroke={W2} strokeWidth="5.5" opacity={T.mode === 'midnight' ? 0.12 : 0.85} />
                <path d={l.path} stroke={ls === 'off' || ls === 'isolated' ? T.STATUS.isolated : dcolor('infraestructura')} strokeWidth="2.8" strokeDasharray={ls === 'isolated' ? '2 7' : undefined} />
                {col && ls !== 'off' && ls !== 'isolated' && <path d={l.path} stroke={col} strokeWidth="2.8" strokeDasharray="8 8" className="flow-dash" />}
              </g>
            );
          }
          const c = l.kind === 'acceso' ? dcolor('identidad') : dcolor('sensores');
          return <path key={`${l.a}-${l.b}`} d={l.path} stroke={col && ls !== 'off' ? col : c} strokeWidth="1.3" strokeDasharray="1.5 6" opacity={ls === 'off' ? 0.3 : T.mode === 'midnight' ? 0.65 : 0.75} />;
        })}
      </g>

      {flags.remoteSession === 'active' && (
        <g fill="none">
          <path d={polyPath(REMOTE_POLY.pts)} stroke={W2} strokeWidth="5" opacity={T.mode === 'midnight' ? 0.2 : 0.65} />
          <path d={polyPath(REMOTE_POLY.pts)} stroke={dcolor('identidad')} strokeWidth="2.2" strokeDasharray="7 8" className="flow-dash" />
          <g transform={`translate(${REMOTE_ORIGIN_POS[0]} ${REMOTE_ORIGIN_POS[1] - 20})`}>
            <circle r="9" fill={W2} stroke={dcolor('identidad')} strokeWidth="2.2" />
            <circle r="3.2" fill={dcolor('identidad')} />
          </g>
        </g>
      )}

      {hubs.map((n) => <Glyph key={n.id} n={n} s={status[n.id]!} reveal={flags.reveal} T={T} />)}

      <g>
        {(() => {
          const pts = ni.map((n) => NODE_POS_NI[n.id]!);
          const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
          const pad = 46;
          const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
          const corner = (cx: number, cy: number, dx: number, dy: number) => `M${cx},${cy + dy * 16}L${cx},${cy}L${cx + dx * 16},${cy}`;
          return (
            <g fill="none" stroke={dcolor('inteligencia')} strokeOpacity={T.mode === 'midnight' ? 0.4 : 0.35} strokeWidth="1.2">
              <path d={corner(x0, y0, 1, 1)} /><path d={corner(x1, y0, -1, 1)} />
              <path d={corner(x0, y1, 1, -1)} /><path d={corner(x1, y1, -1, -1)} />
            </g>
          );
        })()}
        {ni.map((n) => {
          const g = NODE_POS[n.id]!, t = NODE_POS_NI[n.id]!;
          return (
            <g key={`drop-${n.id}`}>
              <line x1={g[0]} y1={g[1]} x2={t[0]} y2={t[1]} stroke={dcolor('inteligencia')} strokeWidth="1.1" strokeDasharray="2 5" opacity="0.5" />
              <ellipse cx={g[0]} cy={g[1]} rx="7" ry="2.6" fill={dcolor('inteligencia')} opacity="0.2" />
            </g>
          );
        })}
        {CORRELATION_GEO.map((a) => {
          const s = status[a.a] === 'off' || status[a.b] === 'off';
          const col = s ? T.STATUS.isolated : dcolor('inteligencia');
          return (
            <g key={`${a.a}-${a.b}`} fill="none">
              <path d={a.path} stroke={W2} strokeWidth="3.2" opacity={T.mode === 'midnight' ? 0.1 : 0.5} />
              <path d={a.path} stroke={col} strokeWidth={flags.correlated ? 2 : 1.2} opacity={flags.correlated ? 0.9 : 0.45} strokeDasharray={s ? '3 7' : undefined} />
            </g>
          );
        })}
        {ni.map((n) => <Glyph key={n.id} n={n} s={status[n.id]!} reveal={flags.reveal} T={T} />)}
      </g>
    </svg>
  );
});
