// Real Cancún geographic coordinates (lon, lat).
// Traced from public geographic data of the Cancún metropolitan area.
// Simplified for display; not meant for navigation.

export type Coord = [number, number]; // [longitude, latitude]

// ── Projection ──
// Equirectangular centred on Cancún. Fine for this small area (~20km).
const CENTER_LON = -86.835;
const CENTER_LAT = 21.115;
const SCALE = 6200; // px per degree
const COS_LAT = Math.cos((CENTER_LAT * Math.PI) / 180);
const OFFSET_X = 860; // shift map slightly left of screen centre
const OFFSET_Y = 540;

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

// ── Mainland (Ciudad Cancún / zona continental) ──
export const MAINLAND: Coord[] = [
  [-86.885, 21.210], [-86.865, 21.215], [-86.842, 21.218],
  [-86.825, 21.215], [-86.812, 21.208], [-86.803, 21.196],
  [-86.798, 21.182], [-86.795, 21.170],
  // coast turns south along lagoon
  [-86.808, 21.162], [-86.812, 21.148], [-86.815, 21.132],
  [-86.818, 21.115], [-86.822, 21.098], [-86.828, 21.078],
  [-86.835, 21.060], [-86.845, 21.048], [-86.858, 21.038],
  // south toward airport
  [-86.870, 21.032], [-86.882, 21.028], [-86.895, 21.025],
  [-86.905, 21.028],
  // west side going north
  [-86.912, 21.045], [-86.910, 21.070], [-86.907, 21.095],
  [-86.904, 21.120], [-86.900, 21.145], [-86.896, 21.168],
  [-86.892, 21.188], [-86.885, 21.210],
];

// ── Laguna Nichupté ──
export const LAGOON: Coord[] = [
  [-86.808, 21.160], [-86.796, 21.166], [-86.782, 21.160],
  [-86.772, 21.148], [-86.766, 21.132], [-86.762, 21.115],
  [-86.762, 21.098], [-86.765, 21.080], [-86.772, 21.062],
  [-86.782, 21.048], [-86.795, 21.038], [-86.810, 21.035],
  [-86.825, 21.042], [-86.832, 21.058], [-86.828, 21.078],
  [-86.822, 21.098], [-86.818, 21.115], [-86.815, 21.132],
  [-86.812, 21.148], [-86.808, 21.160],
];

// ── Hotel Zone outer edge (Caribbean coast) ──
export const HOTEL_OUTER: Coord[] = [
  [-86.795, 21.175], [-86.782, 21.182], [-86.768, 21.182],
  [-86.755, 21.178], [-86.745, 21.168], [-86.740, 21.155],
  [-86.738, 21.142], [-86.740, 21.128], [-86.744, 21.112],
  [-86.748, 21.095], [-86.753, 21.078], [-86.758, 21.062],
  [-86.765, 21.048], [-86.775, 21.035], [-86.785, 21.025],
];

// ── Hotel Zone inner edge (lagoon side), south→north ──
export const HOTEL_INNER: Coord[] = [
  [-86.795, 21.032], [-86.788, 21.042], [-86.780, 21.055],
  [-86.775, 21.068], [-86.770, 21.082], [-86.766, 21.098],
  [-86.764, 21.112], [-86.762, 21.128], [-86.760, 21.142],
  [-86.758, 21.155], [-86.762, 21.165], [-86.772, 21.172],
  [-86.782, 21.175], [-86.795, 21.175],
];

// ── Major corridors ──
export const BLVD_KUKULCAN: Coord[] = [
  [-86.795, 21.173], [-86.778, 21.178], [-86.762, 21.175],
  [-86.750, 21.166], [-86.744, 21.152], [-86.742, 21.138],
  [-86.745, 21.118], [-86.750, 21.098], [-86.756, 21.078],
  [-86.764, 21.058], [-86.775, 21.042], [-86.790, 21.030],
];

export const AV_TULUM: Coord[] = [
  [-86.842, 21.185], [-86.842, 21.168], [-86.845, 21.148],
  [-86.848, 21.128], [-86.852, 21.108], [-86.855, 21.088],
  [-86.858, 21.068], [-86.862, 21.048],
];

export const AV_BONAMPAK: Coord[] = [
  [-86.830, 21.178], [-86.830, 21.158], [-86.830, 21.138],
  [-86.830, 21.118],
];

export const RUTA_AEROPUERTO: Coord[] = [
  [-86.858, 21.048], [-86.870, 21.040], [-86.882, 21.032],
  [-86.895, 21.028],
];

// ── Place labels ──
export interface PlaceLabel {
  name: string;
  coord: Coord;
  size: 'lg' | 'sm';
}

export const PLACE_LABELS: PlaceLabel[] = [
  { name: 'CENTRO', coord: [-86.845, 21.165], size: 'lg' },
  { name: 'PUERTO JUÁREZ', coord: [-86.810, 21.200], size: 'sm' },
  { name: 'LAGUNA NICHUPTÉ', coord: [-86.798, 21.105], size: 'lg' },
  { name: 'ZONA HOTELERA', coord: [-86.755, 21.140], size: 'lg' },
  { name: 'CORREDOR KUKULCÁN', coord: [-86.752, 21.088], size: 'sm' },
  { name: 'AEROPUERTO', coord: [-86.892, 21.035], size: 'sm' },
];

// ── Micro-nodes: service points distributed across the territory ──
export interface ServiceNode {
  coord: Coord;
  domain: string;
  label?: string; // only major nodes get labels
}

export const SERVICE_NODES: ServiceNode[] = [
  // ── Identidad y Accesos (violeta) — puntos de acceso, centros administrativos ──
  { coord: [-86.845, 21.175], domain: 'identidad', label: 'ID-CENTRAL' },
  { coord: [-86.830, 21.165], domain: 'identidad' },
  { coord: [-86.855, 21.155], domain: 'identidad' },
  { coord: [-86.815, 21.195], domain: 'identidad' },
  { coord: [-86.748, 21.162], domain: 'identidad' },

  // ── Infraestructura (ámbar) — nodos de red, hubs, centros de datos ──
  { coord: [-86.840, 21.148], domain: 'infraestructura', label: 'HUB-01' },
  { coord: [-86.855, 21.108], domain: 'infraestructura', label: 'SIN-04' },
  { coord: [-86.870, 21.070], domain: 'infraestructura' },
  { coord: [-86.825, 21.130], domain: 'infraestructura' },
  { coord: [-86.895, 21.050], domain: 'infraestructura' },
  { coord: [-86.750, 21.100], domain: 'infraestructura' },

  // ── Movilidad (azul) — sobre corredores ──
  { coord: [-86.842, 21.185], domain: 'movilidad', label: 'MOV-TULUM' },
  { coord: [-86.770, 21.175], domain: 'movilidad' },
  { coord: [-86.745, 21.150], domain: 'movilidad' },
  { coord: [-86.750, 21.098], domain: 'movilidad' },
  { coord: [-86.775, 21.060], domain: 'movilidad' },
  { coord: [-86.860, 21.055], domain: 'movilidad' },
  { coord: [-86.830, 21.148], domain: 'movilidad' },

  // ── Servicios Turísticos (turquesa) — Zona Hotelera ──
  { coord: [-86.748, 21.168], domain: 'turismo', label: 'TUR-NORTE' },
  { coord: [-86.742, 21.145], domain: 'turismo' },
  { coord: [-86.745, 21.125], domain: 'turismo' },
  { coord: [-86.752, 21.105], domain: 'turismo' },
  { coord: [-86.758, 21.085], domain: 'turismo' },
  { coord: [-86.768, 21.065], domain: 'turismo' },
  { coord: [-86.780, 21.045], domain: 'turismo' },
  { coord: [-86.740, 21.155], domain: 'turismo', label: 'TUR-PUNTA' },

  // ── Sensores y Monitoreo (verde lima) — distribuidos ──
  { coord: [-86.810, 21.205], domain: 'sensores' },
  { coord: [-86.870, 21.185], domain: 'sensores' },
  { coord: [-86.900, 21.100], domain: 'sensores' },
  { coord: [-86.850, 21.135], domain: 'sensores' },
  { coord: [-86.790, 21.075], domain: 'sensores' },
  { coord: [-86.780, 21.150], domain: 'sensores' },
  { coord: [-86.835, 21.200], domain: 'sensores' },
  { coord: [-86.905, 21.060], domain: 'sensores' },
  { coord: [-86.760, 21.115], domain: 'sensores' },

  // ── Núcleo de Inteligencia (magenta) — centro correlación ──
  { coord: [-86.838, 21.138], domain: 'inteligencia', label: 'NI-CENTRAL' },
  { coord: [-86.820, 21.155], domain: 'inteligencia' },
  { coord: [-86.855, 21.125], domain: 'inteligencia' },
  { coord: [-86.845, 21.095], domain: 'inteligencia' },
];

// ── Route connections between service nodes (by index) ──
// These create the data-flow paths that animate across the territory.
export const ROUTES: [number, number][] = [
  // Identidad ↔ Infraestructura
  [0, 5], [1, 3],
  // Infraestructura ↔ Inteligencia
  [5, 36], [6, 38],
  // Movilidad ↔ Turismo
  [13, 20], [15, 22],
  // Sensores ↔ Inteligencia
  [28, 36], [31, 37],
  // Turismo ↔ Sensores
  [21, 32], [23, 34],
  // Cross-domain
  [0, 36], [6, 12], [17, 36],
  [5, 0], [38, 6],
];

// ── Urban grid (simplified major blocks in downtown) ──
export const URBAN_GRID: Coord[][] = [
  // Horizontal streets
  [[-86.860, 21.180], [-86.825, 21.180]],
  [[-86.860, 21.170], [-86.825, 21.170]],
  [[-86.860, 21.160], [-86.825, 21.160]],
  [[-86.860, 21.150], [-86.825, 21.150]],
  [[-86.860, 21.140], [-86.825, 21.140]],
  [[-86.860, 21.130], [-86.825, 21.130]],
  // Vertical streets
  [[-86.855, 21.185], [-86.855, 21.125]],
  [[-86.848, 21.185], [-86.848, 21.125]],
  [[-86.841, 21.185], [-86.841, 21.125]],
  [[-86.834, 21.185], [-86.834, 21.125]],
];
