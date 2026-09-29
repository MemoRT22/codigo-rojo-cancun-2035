// ── Escenario: qué le ocurre al mundo y cuándo ──
//
// La historia NO se altera aquí (docs/02-story-bible.md): los tiempos canónicos son los de la
// biblia (09:16:04 acceso, 09:17:22 SIN-04, 09:18:36 propagación, 09:19:44 Núcleo…). Este archivo
// solo decide cómo se ve esa historia en la LED: primero localizada (Identidad, Centro), luego
// se propaga por el territorio, y el Núcleo de Inteligencia se degrada AL FINAL, como
// consecuencia. La LED no rotula identificadores hasta el desenlace.

import type { NarrativeState, NodeStatus, Phase, SystemEvent } from '../types';
import { NARRATIVE_STATES } from '../types';

export const hms = (s: string): number => {
  const [h = 0, m = 0, sec = 0] = s.split(':').map(Number);
  return h * 3600 + m * 60 + sec;
};

export const fmtTime = (total: number): string => {
  const t = Math.floor(total);
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
};

export const stateIndex = (s: NarrativeState) => NARRATIVE_STATES.indexOf(s);

// ── Especificación por estado ──

export type Tone = 'ok' | 'watch' | 'warn' | 'crit' | 'recover';

export interface StateSpec {
  /** Hora simulada mínima al entrar al estado (la cronología canónica). */
  baseTime: number;
  headline: string;
  tone: Tone;
  showCountdown: boolean;
}

export const STATE_SPECS: Record<NarrativeState, StateSpec> = {
  OPERACION_NORMAL: { baseTime: hms('09:12:10'), headline: 'Operación normal', tone: 'ok', showCountdown: false },
  ANOMALIA_DETECTADA: { baseTime: hms('09:16:06'), headline: 'Anomalía de identidad detectada', tone: 'watch', showCountdown: true },
  INCIDENTE_ESCALANDO: { baseTime: hms('09:16:51'), headline: 'Incidente en escalamiento', tone: 'warn', showCountdown: true },
  CORRELACION_ESTABLECIDA: { baseTime: hms('09:20:11'), headline: 'Correlación de identidad establecida', tone: 'warn', showCountdown: true },
  RESPUESTA_AUTORIZADA: { baseTime: hms('09:21:05'), headline: 'Correlación verificada', tone: 'warn', showCountdown: true },
  CONTENCION_EXITOSA: { baseTime: hms('09:22:01'), headline: 'Incidente contenido', tone: 'recover', showCountdown: true },
  CONTENCION_INCOMPLETA: { baseTime: hms('09:22:01'), headline: 'Contención incompleta', tone: 'crit', showCountdown: true },
};

/** Fase semántica del mundo (no es lo mismo que "estado ≠ normal"). */
export function phaseOf(state: NarrativeState, clock: number): Phase {
  switch (state) {
    case 'OPERACION_NORMAL': return 'normal';
    case 'ANOMALIA_DETECTADA': return clock < hms('09:16:31') ? 'observacion' : 'investigacion';
    case 'INCIDENTE_ESCALANDO': return 'escalamiento';
    case 'CORRELACION_ESTABLECIDA': return 'correlacion';
    case 'RESPUESTA_AUTORIZADA': return 'respuesta';
    case 'CONTENCION_EXITOSA': return clock < hms('09:22:30') ? 'recuperacion' : 'contencion_exitosa';
    case 'CONTENCION_INCOMPLETA': return 'contencion_incompleta';
  }
}

/** ¿Hay un incidente activo que deteriora el territorio? (no incluye normal ni contención lograda) */
export const isDeteriorating = (p: Phase) =>
  p === 'observacion' || p === 'investigacion' || p === 'escalamiento' || p === 'correlacion' ||
  p === 'respuesta' || p === 'contencion_incompleta';

export function subheadline(state: NarrativeState, phase: Phase, sync: number, preserved: number, total: number): string {
  switch (state) {
    case 'OPERACION_NORMAL': return `Sincronización de servicios: ${sync.toFixed(1)}%`;
    case 'ANOMALIA_DETECTADA': return 'Correlación incompleta · Validación humana requerida';
    case 'INCIDENTE_ESCALANDO': return 'Actividad anómala entre servicios';
    case 'CORRELACION_ESTABLECIDA': return 'Secuencia causal parcialmente reconstruida';
    case 'RESPUESTA_AUTORIZADA': return 'Autorización de respuesta concedida';
    case 'CONTENCION_EXITOSA':
      return phase === 'recuperacion' ? 'Recuperación progresiva de servicios' : `Servicios preservados: ${preserved}/${total}`;
    case 'CONTENCION_INCOMPLETA': return 'Actividad no neutralizada en servicios afectados';
  }
}

// ── Beats ──

export interface Flags {
  /** Sesión de identidad fuera de patrón: llega desde fuera del territorio. */
  remoteSession: 'none' | 'active' | 'revoked';
  /** El Núcleo de Inteligencia ha correlacionado la secuencia. */
  correlated: boolean;
  /** Los identificadores de servicio pueden rotularse (solo en el desenlace). */
  reveal: boolean;
}

export const INITIAL_FLAGS: Flags = { remoteSession: 'none', correlated: false, reveal: false };

export interface Effects { users?: number; sessions?: number; events?: number }

export interface Beat {
  at: number;
  states: readonly NarrativeState[];
  status?: Record<string, NodeStatus>;
  flags?: Partial<Flags>;
  effects?: Effects;
  event?: { message: string; level: SystemEvent['level']; zone?: string };
  /** Destello visual neutro (sincronización programada, etc.). */
  flash?: { nodes: string[]; dur: number };
}

const S = NARRATIVE_STATES;
const ANY = S;
const FROM_ANOM = S.slice(1);
const FROM_ESC = S.slice(2);
const FROM_CORR = S.slice(3);
const FROM_RESP = S.slice(4);
const EXIT: readonly NarrativeState[] = ['CONTENCION_EXITOSA'];
const INC: readonly NarrativeState[] = ['CONTENCION_INCOMPLETA'];

const st = (ids: string[], s: NodeStatus): Record<string, NodeStatus> => Object.fromEntries(ids.map((id) => [id, s]));

export const BEATS: Beat[] = [
  // Distractor documentado: sincronización programada del bus de sensores (neutral, sin severidad).
  {
    at: hms('09:12:40'), states: ANY,
    flash: { nodes: ['SEN-04', 'SEN-05', 'SEN-06', 'SEN-07'], dur: 28 },
    event: { message: 'Sincronización programada del bus de sensores', level: 'info', zone: 'nichupte' },
  },

  // ── 1. Identidad detecta la anomalía (localizado en el Centro) ──
  {
    at: hms('09:16:08'), states: FROM_ANOM,
    status: { 'ID-02': 'watch' }, flags: { remoteSession: 'active' },
    event: { message: 'Sesión de identidad fuera de patrón', level: 'warning', zone: 'centro' },
  },
  // ── 2. La telemetría empieza a divergir: menos usuarios, más sesiones ──
  { at: hms('09:16:20'), states: FROM_ANOM, effects: { users: -1, sessions: 2 } },
  {
    at: hms('09:16:31'), states: FROM_ANOM,
    status: { 'ID-01': 'watch', 'ID-02': 'warn' }, effects: { users: -1, sessions: 2, events: 220 },
    event: { message: 'Actividad de identidad fuera del perfil habitual', level: 'warning', zone: 'centro' },
  },

  // ── 3. La sesión alcanza un servicio interno (aún en el Centro) ──
  {
    at: hms('09:16:51'), states: FROM_ESC,
    status: { 'ID-01': 'warn', 'SIN-04': 'watch' }, effects: { sessions: 1 },
    event: { message: 'Acceso a servicio interno fuera de perfil', level: 'warning', zone: 'centro' },
  },
  {
    at: hms('09:17:22'), states: FROM_ESC,
    status: { 'SIN-04': 'warn' }, effects: { users: -2, sessions: 2, events: 900 },
    event: { message: 'Actividad irregular en servicio interno', level: 'warning', zone: 'centro' },
  },
  {
    at: hms('09:17:50'), states: FROM_ESC,
    status: { 'SIN-04': 'crit' }, effects: { events: 2400 },
    event: { message: 'Solicitudes internas sobre el umbral', level: 'critical', zone: 'centro' },
  },

  // ── 4. Se propaga por la troncal hacia otras zonas ──
  {
    at: hms('09:18:36'), states: FROM_ESC,
    status: { ...st(['TRO-01', 'SIN-01', 'SIN-05'], 'warn') }, effects: { events: 1800 },
    event: { message: 'Conexiones anómalas hacia servicios asociados', level: 'critical', zone: 'centro' },
  },
  {
    at: hms('09:19:03'), states: FROM_ESC,
    status: { ...st(['HUB-01', 'SIN-02', 'SIN-03', 'SEN-02'], 'warn') }, effects: { users: -2, sessions: 3, events: 1200 },
    event: { message: 'Propagación de actividad entre zonas', level: 'critical', zone: 'zhNorte' },
  },
  {
    at: hms('09:19:12'), states: FROM_ESC,
    status: { 'TRO-02': 'warn', ...st(['MOV-04', 'MOV-05', 'MOV-06', 'MOV-08'], 'watch') },
  },
  {
    at: hms('09:19:24'), states: FROM_ESC,
    status: st(['SEN-04', 'SEN-05', 'SEN-06'], 'off'),
    event: { message: 'Sensores de la laguna sin respuesta intermitente', level: 'warning', zone: 'nichupte' },
  },

  // ── 5. Inteligencia empieza a mostrar comportamiento fuera de patrón (consecuencia) ──
  {
    at: hms('09:19:44'), states: FROM_ESC,
    status: { 'NI-01': 'warn', ...st(['NI-02', 'NI-03', 'NI-04', 'NI-05'], 'watch') }, effects: { users: -1, events: 600 },
    event: { message: 'Núcleo de Inteligencia: comportamiento fuera de patrón', level: 'warning', zone: 'centro' },
  },

  // ── 6. Correlación ──
  {
    at: hms('09:20:11'), states: FROM_CORR,
    flags: { correlated: true },
    event: { message: 'Correlación de identidad establecida', level: 'info', zone: 'centro' },
  },
  {
    at: hms('09:21:05'), states: FROM_RESP,
    event: { message: 'Consola de respuesta habilitada', level: 'info', zone: 'centro' },
  },

  // ── 7a. Contención exitosa: recuperación progresiva ──
  {
    at: hms('09:22:01'), states: EXIT,
    status: st(['ID-01', 'ID-02'], 'recovering'), flags: { remoteSession: 'revoked', reveal: true },
    event: { message: 'Identidad comprometida: revocada', level: 'recovery', zone: 'centro' },
  },
  {
    at: hms('09:22:04'), states: EXIT, effects: { sessions: -9, users: 3 },
    event: { message: 'Sesiones asociadas: invalidadas', level: 'recovery', zone: 'centro' },
  },
  {
    at: hms('09:22:08'), states: EXIT,
    status: { 'SIN-04': 'recovering' },
    event: { message: 'Nodo SIN-04: aislamiento iniciado', level: 'recovery', zone: 'centro' },
  },
  {
    at: hms('09:22:12'), states: EXIT,
    status: { 'SIN-04': 'isolated' }, effects: { events: -2300 },
    event: { message: 'Nodo SIN-04: aislado', level: 'recovery', zone: 'centro' },
  },
  {
    at: hms('09:22:16'), states: EXIT,
    status: st(['TRO-01', 'SIN-01', 'SIN-05', 'SIN-02', 'SIN-03', 'HUB-01', 'SEN-02', 'TRO-02'], 'recovering'), effects: { events: -2600 },
    event: { message: 'Propagación: contenida', level: 'recovery', zone: 'zhNorte' },
  },
  {
    at: hms('09:22:20'), states: EXIT,
    status: { 'NI-01': 'recovering', ...st(['NI-02', 'NI-03', 'NI-04', 'NI-05'], 'ok') },
    event: { message: 'Núcleo de Inteligencia: estabilizado', level: 'recovery', zone: 'centro' },
  },
  {
    at: hms('09:22:24'), states: EXIT,
    status: { ...st(['SEN-04', 'SEN-05', 'SEN-06', 'ID-01', 'ID-02', 'MOV-04', 'MOV-05', 'MOV-06', 'MOV-08'], 'ok') },
    event: { message: 'Actividad residual en descenso', level: 'recovery', zone: 'nichupte' },
  },
  {
    at: hms('09:22:30'), states: EXIT,
    status: { ...st(['TRO-01', 'SIN-01', 'SIN-05', 'SIN-02', 'SIN-03', 'HUB-01', 'SEN-02', 'TRO-02', 'NI-01'], 'ok') }, effects: { events: -1500 },
    event: { message: 'Incidente contenido', level: 'recovery', zone: 'centro' },
  },

  // ── 7b. Contención incompleta (diseño mínimo; pendiente de pulir) ──
  {
    at: hms('09:22:01'), states: INC,
    event: { message: 'Plan de contención ejecutado', level: 'info', zone: 'centro' },
  },
  {
    at: hms('09:22:06'), states: INC,
    status: st(['NI-01', 'NI-02', 'NI-03', 'NI-04', 'NI-05'], 'off'),
    event: { message: 'Núcleo de Inteligencia: fuera de servicio', level: 'critical', zone: 'centro' },
  },
  {
    at: hms('09:22:10'), states: INC,
    event: { message: 'Actividad en servicio interno continúa', level: 'critical', zone: 'centro' },
  },
  {
    at: hms('09:22:15'), states: INC,
    status: st(['SIN-01', 'SIN-02', 'SIN-03', 'SIN-05'], 'crit'), effects: { events: 1500 },
    event: { message: 'Propagación no detenida', level: 'critical', zone: 'zhNorte' },
  },
];

BEATS.sort((a, b) => a.at - b.at);

// ── Actividad ambiental (operación normal: producto funcionando 24/7) ──

interface Ambient { message: string; zone: string; /** No contradice un incidente en curso. */ neutral?: boolean }

const AMBIENT: Ambient[] = [
  { message: 'Sincronización de servicios completada', zone: 'centro' },
  { message: 'Ruta recalculada · Boulevard Kukulcán', zone: 'zhNorte' },
  { message: 'Nueva sesión de identidad en punto de acceso', zone: 'centro' },
  { message: 'Sensor de calidad de agua recalibrado', zone: 'nichupte' },
  { message: 'Aforo de terminal marítima actualizado', zone: 'puertoJuarez' },
  { message: 'Ventana de mantenimiento programada completada', zone: 'aeropuerto' },
  { message: 'Flujo vial normalizado · Corredor del aeropuerto', zone: 'aeropuerto' },
  { message: 'Ocupación de servicios turísticos actualizada', zone: 'zhSur' },
  { message: 'Rotación programada de credenciales', zone: 'centro', neutral: true },
  { message: 'Ciclo de telemetría actualizado', zone: 'centro', neutral: true },
  { message: 'Correlación de patrones sin hallazgos', zone: 'centro' },
  { message: 'Verificación de nodos periféricos finalizada', zone: 'puertoJuarez' },
  { message: 'Registro de actividad archivado', zone: 'centro', neutral: true },
  { message: 'Verificación de patrones en curso', zone: 'centro', neutral: true },
];

/**
 * Eventos ambientales deterministas hasta el instante `clock`. En operación normal fluyen cada
 * 17 s con todo el repertorio; durante un incidente solo salen los neutrales (nada que diga
 * "normalizado" mientras una zona está degradada) y más espaciados.
 */
export function ambientEvents(clock: number, quiet: boolean): SystemEvent[] {
  const pool = quiet ? AMBIENT.filter((a) => a.neutral) : AMBIENT;
  const period = quiet ? 41 : 17;
  const out: SystemEvent[] = [];
  const first = Math.floor((clock - 240) / period);
  for (let k = first; k * period <= clock; k++) {
    if (k < 0) continue;
    const t = k * period + 3;
    if (t > clock) break;
    const a = pool[(k * 5 + 3) % pool.length]!;
    out.push({ id: `amb-${k}-${period}`, time: fmtTime(t), message: a.message, level: 'info', zone: a.zone });
  }
  return out;
}
