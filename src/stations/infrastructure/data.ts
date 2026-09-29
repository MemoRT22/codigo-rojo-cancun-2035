// ── Contenido de la estación Infraestructura (observabilidad de servicios) ──
//
// Canon respetado (docs/03-game-design.md, Hilo C):
//   · SIN-04 · inicio 09:17:22 · ≈14 → ≈163 solicitudes/s · referencia de sesión ACC-417 · evidencia NOD-204
//   · distractor BUS-SEN-02 · pico 09:12:40 · sincronización programada y documentada
// El resto (otros nodos, cifras y textos) es ficticio y solo aporta contexto para comparar.
// Ningún estado ni color marca a SIN-04: la anomalía surge de comparar magnitud, hora, referencia y explicación.

import type { InfraNode } from './types';

export const RANGE = { from: '08:50:00', to: '09:20:00', ticks: ['08:50', '08:55', '09:00', '09:05', '09:10', '09:15', '09:20'] } as const;
const STEP = 20;

export const toSeconds = (t: string) => {
  const [h = 0, m = 0, s = 0] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};
const FROM = toSeconds(RANGE.from);
export const SPAN = toSeconds(RANGE.to) - FROM;

export const NODES: InfraNode[] = [
  {
    id: 'HUB-01', obs: 'NOD-201', name: 'Concentrador central', service: 'Reparte las solicitudes entre los servicios de la ciudad.',
    zone: 'Centro', status: 'Operativo', usual: 212, links: ['TRO-01', 'SIN-04', 'ID-01', 'ID-03'],
    events: [],
  },
  {
    id: 'TRO-01', obs: 'NOD-202', name: 'Troncal Centro', service: 'Conecta el centro con el resto de zonas.',
    zone: 'Centro', status: 'Operativo', usual: 118, links: ['HUB-01', 'SIN-04', 'SIN-01', 'TRO-02', 'TRO-03'],
    change: { kind: 'ramp', at: '09:04:00', to: 141 },
    events: [{ time: '09:04:00', text: 'Incremento gradual de solicitudes' }],
    docs: 'Patrón habitual de la mañana: el uso sube de forma gradual entre las 09:00 y las 09:10.',
  },
  {
    id: 'TRO-02', obs: 'NOD-203', name: 'Troncal Puente Nichupté', service: 'Conecta la zona hotelera con el centro.',
    zone: 'Nichupté', status: 'Operativo', usual: 92, links: ['TRO-01', 'SIN-02', 'SIN-03'],
    change: { kind: 'dip', at: '09:06:10', to: 18, until: '09:08:50' },
    events: [
      { time: '09:06:10', text: 'Mantenimiento programado iniciado', ref: 'MNT-118' },
      { time: '09:08:52', text: 'Mantenimiento finalizado · servicio restablecido', ref: 'MNT-118' },
    ],
    docs: 'Ventana de mantenimiento programada (MNT-118): reducción temporal de actividad y recuperación posterior.',
  },
  {
    id: 'TRO-03', obs: 'NOD-205', name: 'Troncal Aeropuerto', service: 'Conecta el aeropuerto con el centro.',
    zone: 'Aeropuerto', status: 'Operativo', usual: 61, links: ['TRO-01', 'SIN-05'],
    events: [],
  },
  {
    id: 'SIN-01', obs: 'NOD-206', name: 'Sincronización Puerto Juárez', service: 'Mantiene actualizados los datos de la zona de Puerto Juárez.',
    zone: 'Puerto Juárez', status: 'Operativo', usual: 22, links: ['TRO-01', 'ID-04'],
    events: [],
  },
  {
    id: 'SIN-02', obs: 'NOD-207', name: 'Sincronización Zona Hotelera Norte', service: 'Mantiene actualizados los datos de la Zona Hotelera Norte.',
    zone: 'Zona Hotelera Norte', status: 'Carga alta', usual: 31, links: ['TRO-02', 'SIN-03', 'ID-05'],
    change: { kind: 'step', at: '08:55:20', to: 74 },
    events: [{ time: '08:55:20', text: 'Aumento sostenido de solicitudes durante ventana de soporte', ref: 'ACC-406' }],
    docs: 'Soporte técnico remoto programado (08:30–09:30): la actividad elevada corresponde a esa ventana.',
  },
  {
    id: 'SIN-03', obs: 'NOD-208', name: 'Sincronización Zona Hotelera Sur', service: 'Mantiene actualizados los datos de la Zona Hotelera Sur.',
    zone: 'Zona Hotelera Sur', status: 'Operativo', usual: 18, links: ['TRO-02', 'SIN-02', 'ID-06'],
    events: [],
  },
  {
    id: 'SIN-04', obs: 'NOD-204', name: 'Sincronización Centro', service: 'Mantiene actualizados los datos del centro de la ciudad.',
    zone: 'Centro', status: 'Operativo', usual: 14, links: ['HUB-01', 'TRO-01', 'ID-02'],
    change: { kind: 'step', at: '09:17:22', to: 163 },
    events: [
      { time: '09:16:52', text: 'Lectura de configuración del servicio', ref: 'ACC-417' },
      { time: '09:17:22', text: 'Aumento sostenido de solicitudes', ref: 'ACC-417' },
    ],
    evidence: 'NOD-204',
  },
  {
    id: 'SIN-05', obs: 'NOD-209', name: 'Sincronización Aeropuerto', service: 'Mantiene actualizados los datos del aeropuerto.',
    zone: 'Aeropuerto', status: 'Operativo', usual: 26, links: ['TRO-03', 'ID-07'],
    change: { kind: 'ramp', at: '09:10:00', to: 35 },
    events: [{ time: '09:10:00', text: 'Incremento leve de solicitudes' }],
    docs: 'Llegada de vuelos programada: la actividad sube y se mantiene mientras hay operación.',
  },
  {
    id: 'BUS-SEN-02', obs: 'NOD-210', name: 'Bus de sensores de la laguna', service: 'Recibe las lecturas de los sensores de la laguna.',
    zone: 'Laguna Nichupté', status: 'Operativo', usual: 40, links: ['TRO-02', 'SEN-03', 'SEN-04'],
    change: { kind: 'spike', at: '09:12:40', to: 231, until: '09:14:30' },
    events: [
      { time: '09:12:40', text: 'Sincronización programada de sensores iniciada', ref: 'PROG-0912' },
      { time: '09:14:31', text: 'Sincronización de sensores completada', ref: 'PROG-0912' },
    ],
    docs: 'Sincronización programada y documentada (PROG-0912): todos los días a las 09:12, con una duración aproximada de 2 minutos.',
  },
];

export const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

// ── Serie de actividad: determinista, generada a partir del nivel habitual y del cambio ──

const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.min(1, Math.max(0, k));

function level(n: InfraNode, s: number): number {
  const c = n.change;
  if (!c) return n.usual;
  const at = toSeconds(c.at);
  switch (c.kind) {
    case 'step': return s < at ? n.usual : lerp(n.usual, c.to, (s - at) / 20);
    case 'ramp': return s < at ? n.usual : lerp(n.usual, c.to, (s - at) / 300);
    case 'spike':
    case 'dip': {
      const until = toSeconds(c.until ?? c.at);
      if (s < at) return n.usual;
      if (s < until) return lerp(n.usual, c.to, (s - at) / 20);
      return lerp(c.to, n.usual, (s - until) / 40);
    }
  }
}

const seedOf = (id: string) => [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);

export interface Sample { time: string; s: number; v: number }

const fmt = (s: number) => new Date(s * 1000).toISOString().slice(11, 19);

function build(n: InfraNode): Sample[] {
  const seed = seedOf(n.id);
  const out: Sample[] = [];
  for (let s = FROM; s <= FROM + SPAN; s += STEP) {
    const base = level(n, s);
    const wobble = (Math.sin(s * 0.013 + seed) * 0.6 + Math.sin(s * 0.037 + seed * 2) * 0.4) * (base * 0.035 + 0.5);
    out.push({ time: fmt(s), s, v: Math.max(1, Math.round(base + wobble)) });
  }
  return out;
}

const SERIES = new Map(NODES.map((n) => [n.id, build(n)]));
export const seriesOf = (id: string): Sample[] => SERIES.get(id) ?? [];
export const currentOf = (id: string) => seriesOf(id).slice(-1)[0]?.v ?? 0;
export const peakOf = (id: string) => Math.max(...seriesOf(id).map((p) => p.v));
