// ── Modelo único del mundo de VÉRTICE ──
//
// Todo lo que la pantalla muestra (números, colores de zona, conteos de servicios) se DERIVA de
// este modelo: 6 zonas · 6 dominios · 48 nodos. Nada se calcula con factores "visuales".
// Los identificadores canónicos del incidente (SIN-04, BUS-SEN-02) viven aquí; la LED no los
// rotula hasta el desenlace (ver scenario.ts).

import type { DomainId } from '../brand/tokens';
import { alongLine, inLagoon, mainLine, onLand } from '../map/geo';
import type { LonLat } from '../map/projection';

export type ZoneId = 'centro' | 'puertoJuarez' | 'zhNorte' | 'zhSur' | 'nichupte' | 'aeropuerto';

export interface Zone {
  id: ZoneId;
  name: string;
  anchor: LonLat;
  /** Latencia local de referencia (ms) en operación normal. */
  baseLatency: number;
}

export const ZONES: Zone[] = [
  { id: 'centro', name: 'Centro', anchor: [-86.8258, 21.1625], baseLatency: 12 },
  { id: 'puertoJuarez', name: 'Puerto Juárez', anchor: [-86.8105, 21.1935], baseLatency: 17 },
  { id: 'zhNorte', name: 'Zona Hotelera Norte', anchor: [-86.7685, 21.1395], baseLatency: 19 },
  { id: 'zhSur', name: 'Zona Hotelera Sur', anchor: [-86.7785, 21.0715], baseLatency: 21 },
  { id: 'nichupte', name: 'Laguna Nichupté', anchor: [-86.7905, 21.0935], baseLatency: 23 },
  { id: 'aeropuerto', name: 'Aeropuerto', anchor: [-86.8765, 21.0425], baseLatency: 18 },
];

export const ZONE_MAP = new Map(ZONES.map((z) => [z.id, z]));

export interface WorldNode {
  id: string;
  domain: DomainId;
  zone: ZoneId;
  at: LonLat;
  /** Nodo estructurante del dominio (se dibuja mayor). */
  hub?: boolean;
  /** Nodo sobre el agua (sensores de la laguna) o sobre el puente que la cruza. */
  water?: boolean;
  /** Movilidad: corredor sobre el que vive el nodo y su posición (fracción de longitud). */
  road?: { corridor: string; t: number };
}

// ── Ayudantes de colocación (siempre sobre geografía real) ──

const kuk = mainLine('Boulevard Kukulcán');
const tulum = mainLine('Avenida Tulum');
const bonampak = mainLine('Avenida Bonampak');
const colosio = mainLine('Boulevard Luis Donaldo Colosio');
const puente = mainLine('Puente Nichupté');

const onK = (t: number, dx = 0, dy = 0): LonLat => {
  const p = alongLine(kuk, t);
  return [p[0] + dx, p[1] + dy];
};
const on = (line: LonLat[], t: number, dx = 0, dy = 0): LonLat => {
  const p = alongLine(line, t);
  return [p[0] + dx, p[1] + dy];
};

// Playa (este / norte) y laguna (oeste / sur) respecto del eje del bulevar.
const BEACH_E = 0.0014;
const BEACH_N = 0.0013;

export const NODES: WorldNode[] = [
  // ── Identidad y Accesos · 7 ──
  { id: 'ID-01', domain: 'identidad', zone: 'centro', at: [-86.8235, 21.1636], hub: true },
  { id: 'ID-02', domain: 'identidad', zone: 'centro', at: [-86.8322, 21.1598] },
  { id: 'ID-03', domain: 'identidad', zone: 'centro', at: [-86.8205, 21.1752] },
  { id: 'ID-04', domain: 'identidad', zone: 'puertoJuarez', at: [-86.8128, 21.1892] },
  { id: 'ID-05', domain: 'identidad', zone: 'zhNorte', at: onK(0.86, 0, -0.0012) },
  { id: 'ID-06', domain: 'identidad', zone: 'zhSur', at: onK(0.44, 0.0005, 0) },
  { id: 'ID-07', domain: 'identidad', zone: 'aeropuerto', at: [-86.8792, 21.0438] },

  // ── Infraestructura · 9 ── (SIN = nodos de sincronización; TRO = troncal)
  { id: 'HUB-01', domain: 'infraestructura', zone: 'centro', at: [-86.8272, 21.1590], hub: true },
  { id: 'SIN-04', domain: 'infraestructura', zone: 'centro', at: [-86.8302, 21.1538] },
  { id: 'TRO-01', domain: 'infraestructura', zone: 'centro', at: [-86.8228, 21.1518] },
  { id: 'SIN-01', domain: 'infraestructura', zone: 'puertoJuarez', at: [-86.8152, 21.1958] },
  { id: 'SIN-02', domain: 'infraestructura', zone: 'zhNorte', at: onK(0.7, 0, 0) },
  { id: 'SIN-03', domain: 'infraestructura', zone: 'zhSur', at: onK(0.5, 0.0005, 0) },
  { id: 'SIN-05', domain: 'infraestructura', zone: 'aeropuerto', at: [-86.8712, 21.0458] },
  { id: 'TRO-02', domain: 'infraestructura', zone: 'nichupte', at: on(puente, 0.6), hub: true, water: true },
  { id: 'TRO-03', domain: 'infraestructura', zone: 'aeropuerto', at: on(colosio, 0.86) },

  // ── Movilidad · 8 ── (sobre corredores reales)
  { id: 'MOV-01', domain: 'movilidad', zone: 'centro', at: on(tulum, 0.7), hub: true, road: { corridor: 'tulum', t: 0.7 } },
  { id: 'MOV-02', domain: 'movilidad', zone: 'centro', at: on(bonampak, 0.62), road: { corridor: 'bonampak', t: 0.62 } },
  { id: 'MOV-03', domain: 'movilidad', zone: 'puertoJuarez', at: [-86.8083, 21.1912] },
  { id: 'MOV-04', domain: 'movilidad', zone: 'zhNorte', at: onK(0.94), road: { corridor: 'kukulcan', t: 0.94 } },
  { id: 'MOV-05', domain: 'movilidad', zone: 'zhSur', at: onK(0.38), road: { corridor: 'kukulcan', t: 0.38 } },
  { id: 'MOV-06', domain: 'movilidad', zone: 'zhSur', at: onK(0.55), road: { corridor: 'kukulcan', t: 0.55 } },
  { id: 'MOV-07', domain: 'movilidad', zone: 'nichupte', at: on(puente, 0.82), water: true, road: { corridor: 'puente', t: 0.82 } },
  { id: 'MOV-08', domain: 'movilidad', zone: 'aeropuerto', at: on(colosio, 0.95), road: { corridor: 'colosio', t: 0.95 } },

  // ── Servicios Turísticos · 9 ── (concentraciones)
  { id: 'TUR-01', domain: 'turismo', zone: 'centro', at: [-86.8256, 21.1672] },
  { id: 'TUR-02', domain: 'turismo', zone: 'puertoJuarez', at: [-86.8104, 21.1972] },
  { id: 'TUR-03', domain: 'turismo', zone: 'zhNorte', at: onK(0.66, BEACH_E, 0.0004), hub: true },
  { id: 'TUR-04', domain: 'turismo', zone: 'zhNorte', at: onK(0.79, 0, BEACH_N) },
  { id: 'TUR-05', domain: 'turismo', zone: 'zhNorte', at: onK(0.9, 0, BEACH_N) },
  { id: 'TUR-06', domain: 'turismo', zone: 'zhSur', at: onK(0.57, BEACH_E, 0) },
  { id: 'TUR-07', domain: 'turismo', zone: 'zhSur', at: onK(0.47, BEACH_E, 0), hub: true },
  { id: 'TUR-08', domain: 'turismo', zone: 'zhSur', at: onK(0.36, BEACH_E, 0) },
  { id: 'TUR-09', domain: 'turismo', zone: 'aeropuerto', at: [-86.8738, 21.0392] },

  // ── Sensores y Monitoreo · 10 ── (BUS-SEN-02 = SEN-04, en la laguna)
  { id: 'SEN-01', domain: 'sensores', zone: 'centro', at: [-86.8392, 21.1702] },
  { id: 'SEN-02', domain: 'sensores', zone: 'centro', at: [-86.8312, 21.1452] },
  { id: 'SEN-03', domain: 'sensores', zone: 'puertoJuarez', at: [-86.8078, 21.2012] },
  { id: 'SEN-04', domain: 'sensores', zone: 'nichupte', at: [-86.7905, 21.1035], water: true },
  { id: 'SEN-05', domain: 'sensores', zone: 'nichupte', at: [-86.7975, 21.0785], water: true },
  { id: 'SEN-06', domain: 'sensores', zone: 'nichupte', at: [-86.7885, 21.0625], water: true },
  { id: 'SEN-07', domain: 'sensores', zone: 'nichupte', at: [-86.7925, 21.1235], water: true },
  { id: 'SEN-08', domain: 'sensores', zone: 'zhNorte', at: onK(0.69, BEACH_E, 0) },
  { id: 'SEN-09', domain: 'sensores', zone: 'zhSur', at: onK(0.41, BEACH_E, 0) },
  { id: 'SEN-10', domain: 'sensores', zone: 'aeropuerto', at: [-86.8852, 21.0505] },

  // ── Núcleo de Inteligencia · 5 ── (capa transversal; el núcleo está sobre el Centro de Operaciones)
  { id: 'NI-01', domain: 'inteligencia', zone: 'centro', at: [-86.8272, 21.1596], hub: true },
  { id: 'NI-02', domain: 'inteligencia', zone: 'puertoJuarez', at: [-86.8178, 21.1932] },
  { id: 'NI-03', domain: 'inteligencia', zone: 'zhNorte', at: onK(0.75, 0, -0.0008) },
  { id: 'NI-04', domain: 'inteligencia', zone: 'zhSur', at: onK(0.34, -0.0009, 0.0006) },
  { id: 'NI-05', domain: 'inteligencia', zone: 'aeropuerto', at: [-86.8668, 21.0332] },
];

export const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));
export const node = (id: string) => NODE_MAP.get(id)!;

export const nodesOfDomain = (d: DomainId) => NODES.filter((n) => n.domain === d);
export const nodesOfZone = (z: ZoneId) => NODES.filter((n) => n.zone === z);

// ── Enlaces ──

export type LinkKind = 'troncal' | 'acceso' | 'sensor';
export interface Link { a: string; b: string; kind: LinkKind }

export const LINKS: Link[] = [
  // Troncal de infraestructura
  { a: 'HUB-01', b: 'TRO-01', kind: 'troncal' },
  { a: 'HUB-01', b: 'SIN-04', kind: 'troncal' },
  { a: 'TRO-01', b: 'SIN-04', kind: 'troncal' },
  { a: 'TRO-01', b: 'SIN-01', kind: 'troncal' },
  { a: 'TRO-01', b: 'TRO-03', kind: 'troncal' },
  { a: 'TRO-03', b: 'SIN-05', kind: 'troncal' },
  { a: 'TRO-01', b: 'TRO-02', kind: 'troncal' },
  { a: 'TRO-02', b: 'SIN-02', kind: 'troncal' },
  { a: 'TRO-02', b: 'SIN-03', kind: 'troncal' },
  { a: 'SIN-02', b: 'SIN-03', kind: 'troncal' },
  // Accesos de identidad
  { a: 'ID-01', b: 'HUB-01', kind: 'acceso' },
  { a: 'ID-02', b: 'SIN-04', kind: 'acceso' },
  { a: 'ID-03', b: 'HUB-01', kind: 'acceso' },
  { a: 'ID-04', b: 'SIN-01', kind: 'acceso' },
  { a: 'ID-05', b: 'SIN-02', kind: 'acceso' },
  { a: 'ID-06', b: 'SIN-03', kind: 'acceso' },
  { a: 'ID-07', b: 'SIN-05', kind: 'acceso' },
  // Sensores hacia su bus / troncal
  { a: 'SEN-01', b: 'HUB-01', kind: 'sensor' },
  { a: 'SEN-02', b: 'TRO-01', kind: 'sensor' },
  { a: 'SEN-03', b: 'SIN-01', kind: 'sensor' },
  { a: 'SEN-04', b: 'TRO-02', kind: 'sensor' },
  { a: 'SEN-05', b: 'TRO-02', kind: 'sensor' },
  { a: 'SEN-06', b: 'SIN-03', kind: 'sensor' },
  { a: 'SEN-07', b: 'TRO-02', kind: 'sensor' },
  { a: 'SEN-08', b: 'SIN-02', kind: 'sensor' },
  { a: 'SEN-09', b: 'SIN-03', kind: 'sensor' },
  { a: 'SEN-10', b: 'SIN-05', kind: 'sensor' },
];

/** Capa de correlación (Núcleo de Inteligencia): arcos sobre el territorio. */
export const CORRELATION: [string, string][] = [
  ['NI-01', 'NI-02'], ['NI-01', 'NI-03'], ['NI-01', 'NI-04'], ['NI-01', 'NI-05'],
  ['NI-02', 'NI-03'], ['NI-03', 'NI-04'], ['NI-04', 'NI-05'],
];

// ── Corredores de movilidad (calzadas reales) ──

export interface Corridor {
  id: string;
  name: string;
  /** Peso de tráfico relativo (densidad de flujo). */
  load: number;
}

export const CORRIDORS: Corridor[] = [
  { id: 'kukulcan', name: 'Boulevard Kukulcán', load: 1 },
  { id: 'puente', name: 'Puente Nichupté', load: 0.75 },
  { id: 'colosio', name: 'Boulevard Luis Donaldo Colosio', load: 0.9 },
  { id: 'bonampak', name: 'Avenida Bonampak', load: 0.85 },
  { id: 'tulum', name: 'Avenida Tulum', load: 0.7 },
  { id: 'lopezPortillo', name: 'Avenida José López Portillo', load: 0.6 },
  { id: 'kabah', name: 'Avenida Kabah', load: 0.45 },
  { id: 'nichupteAv', name: 'Avenida Nichupté', load: 0.5 },
];

// ── Totales derivados (única fuente de verdad de los conteos) ──

export const TOTALS = {
  nodes: NODES.length,
  services: 6, // dominios de servicio de la plataforma
  zones: ZONES.length,
};

// ── Verificación en desarrollo: ningún nodo terrestre sobre el agua, ni al revés ──

if (import.meta.env.DEV) {
  const bad = NODES.filter((n) => (n.water ? !inLagoon(n.at) : !onLand(n.at)));
  if (bad.length) console.warn('[mundo] nodos fuera de su medio:', bad.map((n) => n.id).join(', '));
  if (NODES.length !== 48) console.warn('[mundo] se esperaban 48 nodos, hay', NODES.length);
  const ids = new Set(NODES.map((n) => n.id));
  const orphan = LINKS.filter((l) => !ids.has(l.a) || !ids.has(l.b));
  if (orphan.length) console.warn('[mundo] enlaces con nodos inexistentes', orphan);
}
