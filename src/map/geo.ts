// ── Real Cancún geographic data + projection ──
// Source: OpenStreetMap via Nominatim (ODbL 1.0), retrieved 2026-09-25
// See src/map/data/SOURCE.md for details

import geoData from './data/cancun-geo.json';

export type Coord = [number, number]; // [longitude, latitude]

// ── Projection ──
// Equirectangular centred on Cancún. Fine for this small area (~20km).
const CENTER_LON = -86.82;
const CENTER_LAT = 21.10;
const SCALE = 6800;
const COS_LAT = Math.cos((CENTER_LAT * Math.PI) / 180);
const OFFSET_X = 960;
const OFFSET_Y = 520;

export function project(coord: Coord): [number, number] {
  const x = (coord[0] - CENTER_LON) * SCALE * COS_LAT + OFFSET_X;
  const y = -(coord[1] - CENTER_LAT) * SCALE + OFFSET_Y;
  return [x, y];
}

export function projectPath(coords: Coord[]): string {
  return coords.map((c, i) => {
    const [x, y] = project(c);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';
}

export function projectLine(coords: Coord[]): string {
  return coords.map((c, i) => {
    const [x, y] = project(c);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

// ── Real geographic polygons ──
interface GeoData {
  cancun: { coordinates: number[][] };
  nichupte: { coordinates: number[][] };
  hotelZone: { north: number[][]; south: number[][] };
  roads: { [key: string]: number[][] };
}

const raw: GeoData = geoData as GeoData;

export const MAINLAND: Coord[] = raw.cancun.coordinates.map(c => [c[0]!, c[1]!] as Coord);
export const LAGOON: Coord[] = raw.nichupte.coordinates.map(c => [c[0]!, c[1]!] as Coord);
export const HOTEL_ZONE_NORTH: Coord[] = raw.hotelZone.north.map(c => [c[0]!, c[1]!] as Coord);
export const HOTEL_ZONE_SOUTH: Coord[] = raw.hotelZone.south.map(c => [c[0]!, c[1]!] as Coord);

// ── Road corridors ──
export const BLVD_KUKULCAN: Coord[] = (raw.roads['blvdKukulcan'] ?? []).map(c => [c[0]!, c[1]!] as Coord);
export const AV_TULUM: Coord[] = (raw.roads['avTulum'] ?? []).map(c => [c[0]!, c[1]!] as Coord);
export const AV_BONAMPAK: Coord[] = (raw.roads['avBonampak'] ?? []).map(c => [c[0]!, c[1]!] as Coord);
export const RUTA_AEROPUERTO: Coord[] = (raw.roads['rutaAeropuerto'] ?? []).map(c => [c[0]!, c[1]!] as Coord);
export const PUENTE_NICHUPTE: Coord[] = (raw.roads['puenteNichupte'] ?? []).map(c => [c[0]!, c[1]!] as Coord);

// ── Place labels ──
export interface PlaceLabel {
  name: string;
  coord: Coord;
  size: 'lg' | 'sm';
}

export const PLACE_LABELS: PlaceLabel[] = [
  { name: 'CENTRO',            coord: [-86.845, 21.165],  size: 'lg' },
  { name: 'PUERTO JUÁREZ',     coord: [-86.810, 21.200],  size: 'sm' },
  { name: 'LAGUNA NICHUPTÉ',   coord: [-86.790, 21.100],  size: 'lg' },
  { name: 'ZONA HOTELERA',     coord: [-86.760, 21.145],  size: 'lg' },
  { name: 'CORREDOR KUKULCÁN', coord: [-86.755, 21.090],  size: 'sm' },
  { name: 'AEROPUERTO',        coord: [-86.880, 21.038],  size: 'sm' },
];

// ── Zone context micro-data ──
export interface ZoneInfo {
  coord: Coord;
  label: string;
  getValue: (telemetry: { servicesUp: number; nodesLinked: number }, escalating: boolean) => string;
}

export const ZONE_CONTEXT: ZoneInfo[] = [
  {
    coord: [-86.760, 21.155],
    label: 'ZONA HOTELERA',
    getValue: (t) => `${Math.round(t.servicesUp * 1.5)} servicios activos`,
  },
  {
    coord: [-86.848, 21.172],
    label: 'CENTRO',
    getValue: (t) => `${Math.min(12, Math.round(t.nodesLinked * 0.25))} nodos operativos`,
  },
  {
    coord: [-86.885, 21.038],
    label: 'AEROPUERTO',
    getValue: (_, esc) => esc ? 'Enlace degradado' : 'Enlace estable',
  },
  {
    coord: [-86.765, 21.088],
    label: 'CORREDOR KUKULCÁN',
    getValue: (_, esc) => esc ? 'Movilidad restringida' : 'Movilidad normal',
  },
  {
    coord: [-86.790, 21.095],
    label: 'LAGUNA NICHUPTÉ',
    getValue: (_, esc) => esc ? 'Sensores intermitentes' : 'Sensores activos',
  },
];

// ── Service nodes — 53 nodes across 6 domains ──
export interface ServiceNode {
  coord: Coord;
  domain: string;
  label?: string;
  hub?: boolean;
}

export const SERVICE_NODES: ServiceNode[] = [
  // ── Identidad y Accesos (violet) — access points, admin centers ──
  { coord: [-86.845, 21.172], domain: 'identidad', label: 'ID-CENTRAL', hub: true },
  { coord: [-86.830, 21.165], domain: 'identidad' },
  { coord: [-86.855, 21.155], domain: 'identidad' },
  { coord: [-86.815, 21.195], domain: 'identidad' },
  { coord: [-86.765, 21.160], domain: 'identidad' },
  { coord: [-86.840, 21.140], domain: 'identidad' },
  { coord: [-86.870, 21.100], domain: 'identidad' },
  { coord: [-86.800, 21.170], domain: 'identidad', label: 'ID-PJUÁREZ' },

  // ── Infraestructura (amber) — hubs, processing, data centers ──
  { coord: [-86.845, 21.148], domain: 'infraestructura', label: 'HUB-01', hub: true },
  { coord: [-86.855, 21.108], domain: 'infraestructura', label: 'SIN-04', hub: true },
  { coord: [-86.870, 21.070], domain: 'infraestructura' },
  { coord: [-86.825, 21.130], domain: 'infraestructura' },
  { coord: [-86.895, 21.045], domain: 'infraestructura', label: 'INF-AERO' },
  { coord: [-86.760, 21.100], domain: 'infraestructura' },
  { coord: [-86.840, 21.180], domain: 'infraestructura' },
  { coord: [-86.830, 21.110], domain: 'infraestructura' },
  { coord: [-86.860, 21.138], domain: 'infraestructura' },

  // ── Movilidad (blue) — along corridors ──
  { coord: [-86.842, 21.185], domain: 'movilidad', label: 'MOV-TULUM', hub: true },
  { coord: [-86.780, 21.170], domain: 'movilidad' },
  { coord: [-86.755, 21.150], domain: 'movilidad' },
  { coord: [-86.750, 21.118], domain: 'movilidad' },
  { coord: [-86.758, 21.078], domain: 'movilidad' },
  { coord: [-86.860, 21.060], domain: 'movilidad' },
  { coord: [-86.830, 21.148], domain: 'movilidad' },
  { coord: [-86.810, 21.140], domain: 'movilidad', label: 'MOV-PUENTE' },
  { coord: [-86.875, 21.048], domain: 'movilidad' },

  // ── Servicios Turísticos (turquoise) — concentrated in Hotel Zone ──
  { coord: [-86.768, 21.165], domain: 'turismo', label: 'TUR-NORTE', hub: true },
  { coord: [-86.755, 21.145], domain: 'turismo' },
  { coord: [-86.750, 21.125], domain: 'turismo' },
  { coord: [-86.752, 21.108], domain: 'turismo' },
  { coord: [-86.758, 21.088], domain: 'turismo' },
  { coord: [-86.770, 21.065], domain: 'turismo' },
  { coord: [-86.782, 21.048], domain: 'turismo' },
  { coord: [-86.748, 21.155], domain: 'turismo', label: 'TUR-PUNTA', hub: true },
  { coord: [-86.762, 21.135], domain: 'turismo' },
  { coord: [-86.845, 21.162], domain: 'turismo' },

  // ── Sensores y Monitoreo (green) — distributed across territory ──
  { coord: [-86.810, 21.205], domain: 'sensores' },
  { coord: [-86.870, 21.185], domain: 'sensores' },
  { coord: [-86.900, 21.095], domain: 'sensores' },
  { coord: [-86.850, 21.135], domain: 'sensores' },
  { coord: [-86.790, 21.080], domain: 'sensores' },
  { coord: [-86.782, 21.148], domain: 'sensores' },
  { coord: [-86.835, 21.200], domain: 'sensores', label: 'SEN-NORTE', hub: true },
  { coord: [-86.905, 21.058], domain: 'sensores' },
  { coord: [-86.770, 21.115], domain: 'sensores' },
  { coord: [-86.800, 21.060], domain: 'sensores' },
  { coord: [-86.815, 21.160], domain: 'sensores' },
  { coord: [-86.860, 21.170], domain: 'sensores' },

  // ── Núcleo de Inteligencia (magenta) — central correlation ──
  { coord: [-86.842, 21.138], domain: 'inteligencia', label: 'NI-CENTRAL', hub: true },
  { coord: [-86.825, 21.155], domain: 'inteligencia' },
  { coord: [-86.855, 21.122], domain: 'inteligencia' },
  { coord: [-86.845, 21.095], domain: 'inteligencia' },
  { coord: [-86.830, 21.170], domain: 'inteligencia' },
];

// ── Route connections between service nodes (by index) ──
export const ROUTES: [number, number][] = [
  // Identidad ↔ Infraestructura
  [0, 8], [1, 11], [5, 8], [6, 10],
  // Infraestructura ↔ Inteligencia
  [8, 48], [9, 50], [16, 50],
  // Movilidad ↔ Turismo
  [19, 27], [20, 28], [22, 32],
  // Sensores ↔ Inteligencia
  [38, 48], [41, 49], [43, 50],
  // Turismo ↔ Sensores
  [29, 44], [31, 40], [34, 46],
  // Cross-domain
  [0, 48], [9, 17], [27, 48],
  [8, 0], [50, 9], [12, 25],
  // Movilidad ↔ Infraestructura
  [17, 8], [23, 11], [25, 12],
  // Intelligence correlation arcs
  [48, 0], [48, 9], [48, 27], [49, 38], [50, 17],
];

// ── Urban grid (simplified major blocks in downtown) ──
export const URBAN_GRID: Coord[][] = [
  [[-86.862, 21.180], [-86.825, 21.180]],
  [[-86.862, 21.170], [-86.825, 21.170]],
  [[-86.862, 21.160], [-86.825, 21.160]],
  [[-86.862, 21.150], [-86.825, 21.150]],
  [[-86.862, 21.140], [-86.825, 21.140]],
  [[-86.862, 21.130], [-86.825, 21.130]],
  [[-86.857, 21.185], [-86.857, 21.125]],
  [[-86.850, 21.185], [-86.850, 21.125]],
  [[-86.843, 21.185], [-86.843, 21.125]],
  [[-86.836, 21.185], [-86.836, 21.125]],
  [[-86.829, 21.185], [-86.829, 21.125]],
];
