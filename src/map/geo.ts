// ── Geografía real de Cancún ──
// Fuente: OpenStreetMap (ODbL 1.0), procesada por scripts/build-cancun-geo.mjs.
// Ver src/map/data/SOURCE.md.

import raw from './data/cancun-osm.json';
import { pointInRing, type LonLat } from './projection';

interface RawData {
  land: { kind: 'mainland' | 'island'; pts: LonLat[] }[];
  water: { name: string; rings: { role: 'outer' | 'inner'; pts: LonLat[] }[] }[];
  roads: { name: string | null; cls: 'trunk' | 'primary' | 'secondary'; lines: LonLat[][] }[];
  airport: { runways: LonLat[][]; aprons: LonLat[][]; terminals: LonLat[][] };
  fabric: { use: 'r' | 'c' | 'i'; pts: LonLat[] }[];
  places: { name: string; kind: string; lon: number; lat: number }[];
}

const data = raw as unknown as RawData;

export const LAND = data.land;
export const MAINLAND: LonLat[] = data.land.find((l) => l.kind === 'mainland')!.pts;
export const WATER = data.water;
export const FABRIC = data.fabric;
export const AIRPORT = data.airport;
export const PLACES = data.places;

export const LAGOON_NICHUPTE = data.water.find((w) => w.name === 'Laguna Nichupté')!;
const lagoonOuter = LAGOON_NICHUPTE.rings.find((r) => r.role === 'outer')!.pts;
const lagoonHoles = LAGOON_NICHUPTE.rings.filter((r) => r.role === 'inner').map((r) => r.pts);
const minorWaters = data.water.filter((w) => w.name !== 'Laguna Nichupté');

/** Punto sobre agua de la laguna (dentro del contorno y fuera de sus islas). */
export function inLagoon(p: LonLat): boolean {
  return pointInRing(p, lagoonOuter) && !lagoonHoles.some((h) => pointInRing(p, h));
}

/** Punto sobre tierra firme (continente o barra de la Zona Hotelera), fuera de la laguna y las dársenas. */
export function onLand(p: LonLat): boolean {
  return (
    pointInRing(p, MAINLAND) &&
    !inLagoon(p) &&
    !minorWaters.some((w) => w.rings.some((r) => r.role === 'outer' && pointInRing(p, r.pts)))
  );
}

// ── Vialidad ──

export type RoadClass = 'trunk' | 'primary' | 'secondary';

export function roadLines(name: string): LonLat[][] {
  return data.roads.filter((r) => r.name === name).flatMap((r) => r.lines);
}

export function roadsByClass(cls: RoadClass): LonLat[][] {
  return data.roads.filter((r) => r.cls === cls).flatMap((r) => r.lines);
}

const M_LON = 104_000; // metros por grado de longitud a 21°N
const M_LAT = 111_320;

export function lineLength(line: LonLat[]): number {
  let s = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!, b = line[i]!;
    s += Math.hypot((b[0] - a[0]) * M_LON, (b[1] - a[1]) * M_LAT);
  }
  return s;
}

/** La calzada más larga de un corredor, para colocar elementos sobre ella. */
export function mainLine(name: string): LonLat[] {
  const lines = roadLines(name);
  return lines.reduce((best, l) => (lineLength(l) > lineLength(best) ? l : best), lines[0] ?? []);
}

/** Punto a fracción t∈[0,1] de la longitud de una polilínea. */
export function alongLine(line: LonLat[], t: number): LonLat {
  let target = lineLength(line) * Math.min(1, Math.max(0, t));
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1]!, b = line[i]!;
    const seg = Math.hypot((b[0] - a[0]) * M_LON, (b[1] - a[1]) * M_LAT);
    if (target <= seg || i === line.length - 1) {
      const u = seg === 0 ? 0 : Math.min(1, target / seg);
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    }
    target -= seg;
  }
  return line[0]!;
}

/** Tramo [t0,t1] (fracciones de longitud) de una polilínea. */
export function sliceLine(line: LonLat[], t0: number, t1: number, step = 0.01): LonLat[] {
  const out: LonLat[] = [];
  for (let t = t0; t < t1; t += step) out.push(alongLine(line, t));
  out.push(alongLine(line, t1));
  return out;
}

// ── Encuadre ──

/**
 * Puntos que deben quedar dentro del área segura. El encuadre se calcula a partir de sus límites
 * proyectados (no de constantes): costa norte, Punta Cancún, Punta Nizuc, aeropuerto y oeste urbano.
 */
export const FOCUS_POINTS: LonLat[] = [
  [-86.8035, 21.2075], // costa norte (Puerto Juárez / Punta Sam)
  [-86.7395, 21.1375], // Punta Cancún
  [-86.7775, 21.0025], // Punta Nizuc
  [-86.8925, 21.0525], // pista oeste del aeropuerto
  [-86.8905, 21.1975], // oeste de la ciudad
];

/** Extensión geográfica de la placa (plano de terreno) en torno al área de enfoque. */
export const PLATE = {
  lon0: -86.93,
  lon1: -86.7,
  lat0: 20.98,
  lat1: 21.245,
};
