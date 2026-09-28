import { memo } from 'react';
import { DOMAIN_MAP, INK, STATUS, type DomainId } from '../brand/tokens';
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

const dcolor = (d: DomainId) => DOMAIN_MAP.get(d)!.color;

export function statusColor(s: NodeStatus): string | null {
  switch (s) {
    case 'warn': return STATUS.warn;
    case 'crit': return STATUS.crit;
    case 'off': case 'isolated': return STATUS.isolated;
    case 'recovering': return STATUS.recover;
    default: return null;
  }
}

const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t).toString(16).padStart(2, '0')).join('')}`;
};

const ZONE_WASH_R: Record<string, number> = { centro: 2300, puertoJuarez: 1500, zhNorte: 1900, zhSur: 1900, nichupte: 2000, aeropuerto: 1700 };

// ── Glifos de nodo ──

function Glyph({ n, s, reveal }: { n: WorldNode; s: NodeStatus; reveal: boolean }) {
  const [x, y] = posOf(n);
  const base = dcolor(n.domain);
  const off = s === 'off' || s === 'isolated';
  const fill = off ? STATUS.isolated : base;
  const ring = statusColor(s);
  const R = n.hub ? 1.35 : 1;
  const shape = (() => {
    switch (n.domain) {
      case 'identidad':
        return (
          <>
            <circle r={9 * R} fill="#fff" stroke={fill} strokeWidth="2.6" />
            <circle r={3.4 * R} fill={fill} />
          </>
        );
      case 'infraestructura':
        return <rect x={-7 * R} y={-7 * R} width={14 * R} height={14 * R} rx="3" fill={fill} stroke="#fff" strokeWidth="2" />;
      case 'movilidad':
        return <rect x={-5.5 * R} y={-5.5 * R} width={11 * R} height={11 * R} rx="1.5" transform="rotate(45)" fill={fill} stroke="#fff" strokeWidth="1.8" />;
      case 'sensores':
        return <circle r={5 * R} fill={fill} stroke="#fff" strokeWidth="2" />;
      case 'turismo':
        return <circle r={4.2 * R} fill="#fff" stroke={fill} strokeWidth="2.4" />;
      case 'inteligencia':
        return (
          <>
            <rect x={-8 * R} y={-8 * R} width={16 * R} height={16 * R} rx="2.5" transform="rotate(45)" fill={fill} stroke="#fff" strokeWidth="2" />
            <circle r={2.6 * R} fill="#fff" />
          </>
        );
    }
  })();
  const ringR = (n.domain === 'infraestructura' ? 12 : n.domain === 'inteligencia' ? 15 : 13) * R;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.28)`}>
      {n.domain !== 'inteligencia' && <ellipse cy="9" rx="8" ry="2.6" fill="#0E1D33" opacity="0.14" />}
      {ring && s !== 'off' && s !== 'isolated' && (
        <circle r={ringR} fill="none" stroke={ring} strokeWidth="2.2" strokeDasharray={s === 'recovering' ? '3 3' : undefined} />
      )}
      {s === 'watch' && <circle r={ringR} fill="none" stroke={base} strokeWidth="1.4" strokeDasharray="2.5 3" />}
      {(s === 'off' || s === 'isolated') && <circle r={ringR} fill="none" stroke={STATUS.isolated} strokeWidth="1.6" strokeDasharray="2 3" />}
      {shape}
      {s === 'off' && <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />}
      {reveal && n.id === 'SIN-04' && (
        <g transform="translate(16 -16)">
          <rect x="-4" y="-13" width="66" height="22" rx="4" fill="#fff" stroke={INK.faint} strokeWidth="1" />
          <text x="29" y="3" textAnchor="middle" fontSize="13" fontWeight="600" fill={INK.primary}>SIN-04</text>
        </g>
      )}
    </g>
  );
}

// ── Capas ──

export const DomainLayers = memo(function DomainLayers({ status, flags, zones }: Props) {
  const linkStatus = (a: string, b: string): NodeStatus => {
    const sa = status[a]!, sb = status[b]!;
    for (const s of ['crit', 'off', 'warn', 'recovering', 'isolated', 'watch'] as NodeStatus[]) if (sa === s || sb === s) return s;
    return 'ok';
  };

  const hubs = NODES.filter((n) => n.domain !== 'inteligencia');
  const ni = NODES.filter((n) => n.domain === 'inteligencia');

  return (
    <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        {ZONES.map((z) => (
          <radialGradient key={z.id} id={`wash-${z.id}`}>
            <stop offset="0" stopColor="#F0A100" stopOpacity="1" />
            <stop offset="1" stopColor="#F0A100" stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      {/* Deterioro espacial: el área de una zona se tiñe según su estrés real */}
      {zones.map((z) => {
        const anchor = ZONES.find((zz) => zz.id === z.id)!.anchor;
        const intensity = Math.min(1, z.stress / 14);
        if (intensity < 0.05) return null;
        const crit = z.worst === 'crit';
        const color = crit ? STATUS.crit : STATUS.warn;
        const ring = groundCircle(anchor[0], anchor[1], ZONE_WASH_R[z.id] ?? 2200);
        return (
          <g key={z.id} style={{ transition: 'opacity 1.2s' }}>
            <path d={`${polyPath(ring)}Z`} fill={color} opacity={crit ? 0.05 + 0.1 * intensity : 0.03} />
            <path d={`${polyPath(ring)}Z`} fill="none" stroke={color} strokeWidth="1.4" strokeDasharray="5 6" opacity={0.25 + 0.4 * intensity} />
          </g>
        );
      })}

      {/* Sensores: cobertura */}
      {NODES.filter((n) => n.domain === 'sensores').map((n) => {
        const s = status[n.id]!;
        const c = s === 'off' ? STATUS.isolated : dcolor('sensores');
        const ring = groundCircle(n.at[0], n.at[1], sensorRadius(n.id));
        return (
          <g key={n.id}>
            <path d={`${polyPath(ring)}Z`} fill={c} fillOpacity={s === 'off' ? 0.04 : 0.12} stroke={c} strokeOpacity="0.65" strokeWidth="1.4" strokeDasharray={s === 'off' ? '3 5' : undefined} />
          </g>
        );
      })}

      {/* Turismo: concentraciones territoriales (columnas hexagonales) */}
      <g strokeLinejoin="round">
        {HEX_CELLS.map((c, i) => {
          const ns = status[c.node]!;
          const stress = ns === 'warn' || ns === 'crit';
          const top = stress ? mixHex(dcolor('turismo'), '#F0A100', 0.5) : dcolor('turismo');
          const side = stress ? mixHex('#0A7F78', '#B07600', 0.5) : '#0A7F78';
          const sideL = stress ? mixHex('#0E948B', '#C98A08', 0.5) : '#0E948B';
          const faces = [];
          for (let k = 0; k < 6; k++) {
            const k2 = (k + 1) % 6;
            const bmid = (c.base[k]![1] + c.base[k2]![1]) / 2;
            const cy = c.base.reduce((a, p) => a + p[1], 0) / 6;
            if (bmid <= cy) continue; // cara trasera
            const q = `M${c.base[k]![0].toFixed(1)},${c.base[k]![1].toFixed(1)} L${c.base[k2]![0].toFixed(1)},${c.base[k2]![1].toFixed(1)} L${c.top[k2]![0].toFixed(1)},${c.top[k2]![1].toFixed(1)} L${c.top[k]![0].toFixed(1)},${c.top[k]![1].toFixed(1)}Z`;
            const left = c.base[k]![0] + c.base[k2]![0] < 2 * (c.base.reduce((a, p) => a + p[0], 0) / 6);
            faces.push(<path key={k} d={q} fill={left ? sideL : side} stroke="#fff" strokeOpacity="0.55" strokeWidth="0.6" />);
          }
          return (
            <g key={i}>
              {faces}
              <path d={`${polyPath(c.top)}Z`} fill={top} fillOpacity={c.ring === 0 ? 1 : c.ring === 1 ? 0.9 : 0.76} stroke="#fff" strokeWidth="1" />
            </g>
          );
        })}
      </g>

      {/* Movilidad: corredores reales */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {CORRIDOR_GEO.map((c) =>
          c.paths.map((d, i) => (
            <g key={`${c.id}-${i}`}>
              <path d={d} stroke="#fff" strokeWidth={3.6 + c.load * 1.2} opacity="0.85" />
              <path d={d} stroke={dcolor('movilidad')} strokeWidth={1.8 + c.load * 1.0} opacity={0.55 + c.load * 0.25} />
            </g>
          )),
        )}
      </g>

      {/* Infraestructura y accesos: enlaces */}
      <g fill="none" strokeLinecap="round">
        {LINK_GEO.map((l) => {
          const ls = linkStatus(l.a, l.b);
          const col = statusColor(ls);
          if (l.kind === 'troncal') {
            return (
              <g key={`${l.a}-${l.b}`}>
                <path d={l.path} stroke="#fff" strokeWidth="6" opacity="0.9" />
                <path d={l.path} stroke={ls === 'off' || ls === 'isolated' ? STATUS.isolated : dcolor('infraestructura')} strokeWidth="3" strokeDasharray={ls === 'isolated' ? '2 7' : undefined} />
                {col && ls !== 'off' && ls !== 'isolated' && <path d={l.path} stroke={col} strokeWidth="3" strokeDasharray="8 8" className="flow-dash" />}
              </g>
            );
          }
          const c = l.kind === 'acceso' ? dcolor('identidad') : dcolor('sensores');
          return <path key={`${l.a}-${l.b}`} d={l.path} stroke={col && ls !== 'off' ? col : c} strokeWidth="1.5" strokeDasharray="1.5 5" opacity={ls === 'off' ? 0.35 : 0.9} />;
        })}
      </g>

      {/* Sesión remota: llega desde fuera del territorio hacia el acceso remoto del Centro */}
      {flags.remoteSession === 'active' && (
        <g fill="none">
          <path d={polyPath(REMOTE_POLY.pts)} stroke="#fff" strokeWidth="5" opacity="0.7" />
          <path d={polyPath(REMOTE_POLY.pts)} stroke={dcolor('identidad')} strokeWidth="2.4" strokeDasharray="7 7" className="flow-dash" />
          <g transform={`translate(${REMOTE_ORIGIN_POS[0]} ${REMOTE_ORIGIN_POS[1] - 20})`}>
            <circle r="9" fill="#fff" stroke={dcolor('identidad')} strokeWidth="2.6" />
            <circle r="3.4" fill={dcolor('identidad')} />
          </g>
        </g>
      )}

      {/* Nodos de superficie */}
      {hubs.map((n) => <Glyph key={n.id} n={n} s={status[n.id]!} reveal={flags.reveal} />)}

      {/* Núcleo de Inteligencia: capa transversal elevada de correlación */}
      <g>
        {(() => {
          const pts = ni.map((n) => NODE_POS_NI[n.id]!);
          // Marco de la capa: envolvente elevada sobre los nodos de correlación.
          const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
          const pad = 46;
          const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
          const corner = (cx: number, cy: number, dx: number, dy: number) => `M${cx},${cy + dy * 16}L${cx},${cy}L${cx + dx * 16},${cy}`;
          return (
            <g fill="none" stroke={dcolor('inteligencia')} strokeOpacity="0.45" strokeWidth="1.4">
              <path d={corner(x0, y0, 1, 1)} /><path d={corner(x1, y0, -1, 1)} />
              <path d={corner(x0, y1, 1, -1)} /><path d={corner(x1, y1, -1, -1)} />
            </g>
          );
        })()}
        {ni.map((n) => {
          const g = NODE_POS[n.id]!, t = NODE_POS_NI[n.id]!;
          return (
            <g key={`drop-${n.id}`}>
              <line x1={g[0]} y1={g[1]} x2={t[0]} y2={t[1]} stroke={dcolor('inteligencia')} strokeWidth="1.3" strokeDasharray="2 4" opacity="0.6" />
              <ellipse cx={g[0]} cy={g[1]} rx="7" ry="2.6" fill={dcolor('inteligencia')} opacity="0.3" />
            </g>
          );
        })}
        {CORRELATION_GEO.map((a) => {
          const s = status[a.a] === 'off' || status[a.b] === 'off';
          const col = s ? STATUS.isolated : dcolor('inteligencia');
          return (
            <g key={`${a.a}-${a.b}`} fill="none">
              <path d={a.path} stroke="#fff" strokeWidth="3.4" opacity="0.55" />
              <path d={a.path} stroke={col} strokeWidth={flags.correlated ? 2.2 : 1.4} opacity={flags.correlated ? 0.95 : 0.55} strokeDasharray={s ? '3 6' : undefined} />
            </g>
          );
        })}
        {ni.map((n) => <Glyph key={n.id} n={n} s={status[n.id]!} reveal={flags.reveal} />)}
      </g>
    </svg>
  );
});

