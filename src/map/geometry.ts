// ── Geometría proyectada de las capas de dominio (se calcula una sola vez) ──

import { STAGE } from './scene';
import { onLand, roadLines } from './geo';
import type { LonLat, Pt } from './projection';
import { CORRIDORS, LINKS, NODES, NODE_MAP, CORRELATION, type WorldNode } from '../world/model';

// ── Polilíneas muestreables (para partículas que viajan por rutas reales) ──

export interface Poly { pts: Pt[]; cum: number[]; len: number }

export function makePoly(pts: Pt[]): Poly {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    cum.push(cum[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  return { pts, cum, len: cum[cum.length - 1]! };
}

export function pointAt(p: Poly, d: number): Pt {
  const dd = Math.min(Math.max(d, 0), p.len);
  let lo = 0, hi = p.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (p.cum[mid]! <= dd) lo = mid; else hi = mid;
  }
  const seg = p.cum[hi]! - p.cum[lo]!;
  const u = seg === 0 ? 0 : (dd - p.cum[lo]!) / seg;
  const a = p.pts[lo]!, b = p.pts[hi]!;
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
}

export const polyPath = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');

// ── Altura de la capa de inteligencia (m sobre el terreno) ──
export const NI_Z = 1500;

export const NODE_POS: Record<string, Pt> = Object.fromEntries(NODES.map((n) => [n.id, STAGE.project(n.at[0], n.at[1])]));
export const NODE_POS_NI: Record<string, Pt> = Object.fromEntries(
  NODES.filter((n) => n.domain === 'inteligencia').map((n) => [n.id, STAGE.project(n.at[0], n.at[1], NI_Z)]),
);

/** Posición de un nodo en pantalla (los del Núcleo de Inteligencia viven en la capa elevada). */
export const posOf = (n: WorldNode): Pt => (n.domain === 'inteligencia' ? NODE_POS_NI[n.id]! : NODE_POS[n.id]!);

// ── Movilidad: corredores reales ──

export interface CorridorGeo { id: string; name: string; load: number; polys: Poly[]; paths: string[] }

export const CORRIDOR_GEO: CorridorGeo[] = CORRIDORS.map((c) => {
  const polys = roadLines(c.name)
    .filter((l) => l.length > 2)
    .map((l) => makePoly(l.map((p) => STAGE.project(p[0], p[1]))));
  return { id: c.id, name: c.name, load: c.load, polys, paths: polys.map((p) => polyPath(p.pts)) };
});

// ── Infraestructura y accesos: enlaces ──

export interface LinkGeo { a: string; b: string; kind: string; poly: Poly; path: string }

export const LINK_GEO: LinkGeo[] = LINKS.map((l) => {
  const a = NODE_POS[l.a]!, b = NODE_POS[l.b]!;
  const poly = makePoly([a, b]);
  return { a: l.a, b: l.b, kind: l.kind, poly, path: polyPath([a, b]) };
});

// ── Turismo: concentraciones en celdas hexagonales con altura ──

export interface HexCell {
  node: string;
  ring: number;
  h: number;
  top: Pt[];
  base: Pt[];
  sortY: number;
}

const HEX_R = 250; // m (radio del hexágono)
const RING_H = [620, 380, 210];

function pseudo(n: number) {
  const x = Math.sin(n * 91.7 + 13.1) * 24634.6345;
  return x - Math.floor(x);
}

export const HEX_CELLS: HexCell[] = (() => {
  const out: HexCell[] = [];
  const tourism = NODES.filter((n) => n.domain === 'turismo');
  const taken = new Set<string>();
  tourism.forEach((nd, ni) => {
    const [cx, cy] = STAGE.toLocal(nd.at[0], nd.at[1]);
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        const s = -q - r;
        const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
        if (ring > 2) continue;
        const x = cx + HEX_R * Math.sqrt(3) * (q + r / 2);
        const y = cy + HEX_R * 1.5 * r;
        const key = `${Math.round(x / 60)}:${Math.round(y / 60)}`;
        if (taken.has(key)) continue;
        const ll = STAGE.toLonLat(x, y);
        if (!onLand(ll)) continue;
        // Descartar celdas cuyos vértices caen en el mar o la laguna: mantiene la ZH dentro de su franja.
        const corners: Pt[] = [];
        let inside = 0;
        for (let k = 0; k < 6; k++) {
          const ang = (Math.PI / 180) * (60 * k - 30);
          const vx = x + HEX_R * 0.92 * Math.cos(ang);
          const vy = y + HEX_R * 0.92 * Math.sin(ang);
          if (onLand(STAGE.toLonLat(vx, vy))) inside++;
          corners.push([vx, vy]);
        }
        if (inside < 5) continue;
        taken.add(key);
        const v = 0.72 + 0.4 * pseudo(ni * 31 + q * 7 + r * 13);
        const h = (RING_H[ring] ?? 100) * v * (nd.hub ? 1.25 : 1);
        const top = corners.map(([vx, vy]) => STAGE.projectLocal(vx, vy, h));
        const base = corners.map(([vx, vy]) => STAGE.projectLocal(vx, vy, 0));
        out.push({ node: nd.id, ring, h, top, base, sortY: STAGE.projectLocal(x, y, 0)[1] });
      }
    }
  });
  return out.sort((a, b) => a.sortY - b.sortY);
})();

// ── Sensores: coberturas sobre el territorio ──

export function groundCircle(lon: number, lat: number, radiusM: number, n = 48): Pt[] {
  const [cx, cy] = STAGE.toLocal(lon, lat);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return STAGE.projectLocal(cx + radiusM * Math.cos(a), cy + radiusM * Math.sin(a), 0);
  });
}

export const SENSOR_RADIUS: Record<string, number> = {
  'SEN-04': 950, 'SEN-05': 950, 'SEN-06': 950, 'SEN-07': 950,
};
export const sensorRadius = (id: string) => SENSOR_RADIUS[id] ?? 650;

// ── Inteligencia: arcos de correlación sobre el territorio ──

export function liftedArc(a: Pt, b: Pt, lift: number, n = 36): Poly {
  // Curva cuadrática en pantalla con control elevado; la elevación real ya está en a y b.
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - lift];
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * a[0] + 2 * u * t * mid[0] + t * t * b[0], u * u * a[1] + 2 * u * t * mid[1] + t * t * b[1]]);
  }
  return makePoly(pts);
}

export interface ArcGeo { a: string; b: string; poly: Poly; path: string }

export const CORRELATION_GEO: ArcGeo[] = CORRELATION.map(([a, b]) => {
  const pa = NODE_POS_NI[a]!, pb = NODE_POS_NI[b]!;
  const dist = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
  const poly = liftedArc(pa, pb, Math.min(90, dist * 0.22));
  return { a, b, poly, path: polyPath(poly.pts) };
});

// ── Sesión remota: llega desde fuera del territorio ──

const REMOTE_ORIGIN: LonLat = [-86.93, 21.235];
export const REMOTE_ORIGIN_POS = STAGE.project(REMOTE_ORIGIN[0], REMOTE_ORIGIN[1], 0);

export const REMOTE_POLY: Poly = (() => {
  const a = STAGE.project(REMOTE_ORIGIN[0], REMOTE_ORIGIN[1], 900);
  const b = NODE_POS['ID-02']!;
  const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return liftedArc(a, b, Math.min(140, dist * 0.2), 48);
})();

export const nodeById = (id: string) => NODE_MAP.get(id)!;
