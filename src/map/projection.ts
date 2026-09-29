// ── Proyección del territorio ──
//
// Modelo: plano geográfico local en metros (este, norte, altura) → rotación (yaw) → inclinación de
// cámara (tilt) → perspectiva ligera. No hay constantes de encuadre elegidas a ojo: la escala y el
// desplazamiento se calculan a partir de los límites reales de los puntos de interés proyectados y
// del área segura disponible (1920×1080 menos cabecera/base).

export type LonLat = [number, number];
export type Pt = [number, number];

const M_PER_DEG = 111_320;

export interface SafeArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CameraSpec {
  /** Rotación del mapa alrededor de la vertical, grados. 0 = norte arriba. */
  yaw: number;
  /** Inclinación desde la vertical, grados. 0 = cenital. */
  tilt: number;
  /** Distancia de cámara en metros; menor = más perspectiva. */
  distance: number;
}

export interface Stage {
  /** Proyecta lon/lat (y altura en metros) a píxeles de escena. */
  project(lon: number, lat: number, z?: number): Pt;
  /** Proyecta un punto en metros locales. */
  projectLocal(x: number, y: number, z?: number): Pt;
  /** Convierte lon/lat a metros locales. */
  toLocal(lon: number, lat: number): Pt;
  /** Convierte metros locales a lon/lat. */
  toLonLat(x: number, y: number): LonLat;
  /** Píxeles por metro en el centro del encuadre (para barras de escala). */
  pxPerMeter: number;
  /** Rectángulo (en píxeles) ocupado por los puntos de interés proyectados. */
  bounds: SafeArea;
  origin: LonLat;
}

export function createStage(focus: LonLat[], safe: SafeArea, camera: CameraSpec): Stage {
  // Origen: centro del rectángulo geográfico de los puntos de interés.
  const lons = focus.map((p) => p[0]);
  const lats = focus.map((p) => p[1]);
  const origin: LonLat = [
    (Math.min(...lons) + Math.max(...lons)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
  const cosLat = Math.cos((origin[1] * Math.PI) / 180);
  const yaw = (camera.yaw * Math.PI) / 180;
  const tilt = (camera.tilt * Math.PI) / 180;
  const sy = Math.sin(yaw), cy = Math.cos(yaw);
  const st = Math.sin(tilt), ct = Math.cos(tilt);
  const D = camera.distance;

  const toLocal = (lon: number, lat: number): Pt => [
    (lon - origin[0]) * M_PER_DEG * cosLat,
    (lat - origin[1]) * M_PER_DEG,
  ];

  // Proyección "unitaria" (sin escala de ajuste): metros → metros de pantalla con perspectiva.
  const unit = (x: number, y: number, z: number): Pt => {
    const xr = x * cy - y * sy;
    const yr = x * sy + y * cy;
    const up = yr * ct + z * st; // vertical en pantalla
    const depth = D + yr * st - z * ct; // más lejos = más al norte
    const k = D / depth;
    return [xr * k, -up * k];
  };

  // Límites de los puntos de interés proyectados.
  const pts = focus.map((p) => unit(...toLocal(p[0], p[1]), 0));
  const minX = Math.min(...pts.map((p) => p[0]));
  const maxX = Math.max(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const maxY = Math.max(...pts.map((p) => p[1]));
  const bw = maxX - minX;
  const bh = maxY - minY;
  const scale = Math.min(safe.w / bw, safe.h / bh);
  const ox = safe.x + (safe.w - bw * scale) / 2 - minX * scale;
  const oy = safe.y + (safe.h - bh * scale) / 2 - minY * scale;

  const projectLocal = (x: number, y: number, z = 0): Pt => {
    const [ux, uy] = unit(x, y, z);
    return [ox + ux * scale, oy + uy * scale];
  };

  return {
    projectLocal,
    project: (lon, lat, z = 0) => projectLocal(...toLocal(lon, lat), z),
    toLocal,
    toLonLat: (x, y) => [origin[0] + x / (M_PER_DEG * cosLat), origin[1] + y / M_PER_DEG],
    pxPerMeter: scale,
    bounds: {
      x: ox + minX * scale,
      y: oy + minY * scale,
      w: bw * scale,
      h: bh * scale,
    },
    origin,
  };
}

// ── Utilidades de trazado ──

export function linePath(stage: Stage, pts: LonLat[], z = 0): string {
  let d = '';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const [x, y] = stage.project(p[0], p[1], z);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
}

export function ringPath(stage: Stage, pts: LonLat[], z = 0): string {
  return `${linePath(stage, pts, z)}Z`;
}

/** Arco elevado entre dos puntos del territorio (capa de correlación). */
export function arcPath(stage: Stage, a: LonLat, b: LonLat, lift: number): string {
  const [ax, ay] = stage.project(a[0], a[1], 0);
  const [bx, by] = stage.project(b[0], b[1], 0);
  const mid: LonLat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [cx, cy] = stage.project(mid[0], mid[1], lift * 2);
  return `M${ax.toFixed(1)},${ay.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
}

/** Punto sobre un arco cuadrático, t∈[0,1]. */
export function arcPoint(stage: Stage, a: LonLat, b: LonLat, lift: number, t: number): Pt {
  const [ax, ay] = stage.project(a[0], a[1], 0);
  const [bx, by] = stage.project(b[0], b[1], 0);
  const mid: LonLat = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const [cx, cy] = stage.project(mid[0], mid[1], lift * 2);
  const u = 1 - t;
  return [u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by];
}

// ── Geometría auxiliar ──

export function pointInRing(p: LonLat, ring: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!, b = ring[j]!;
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}
