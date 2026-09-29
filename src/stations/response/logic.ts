// ── Contenido y lógica de Respuesta (sin React) ──
//
// El Mission Engine es la autoridad: valida la correlación (`FINAL_CORRELATION_SUBMITTED`), autoriza (`responseUnlocked`, lo
// dispara el host por cronología), guarda el plan (`selectedPlan`) y calcula el desenlace (`outcome`). Aquí solo se derivan
// vistas y se guarda el contenido de los planes y de sus consecuencias. Ningún plan se marca como recomendado.

import type { MissionState, ResponsePlan } from '../../mission/types';
import type { StationPhase } from '../shell/types';

export type Stage = 'lock' | 'pending' | 'plans' | 'confirm' | 'outcome';

type View = Pick<MissionState, 'status' | 'finalCorrelationValidated' | 'responseUnlocked' | 'selectedPlan' | 'outcome'>;

export const deriveStationPhase = (m: Pick<MissionState, 'status' | 'outcome'>): StationPhase =>
  m.status === 'idle' ? 'WAITING' : m.outcome || m.status === 'finished' ? 'MISSION_FINISHED' : 'ACTIVE';

/** Etapa visible, derivada de la misión (no hay estado paralelo de decisión). `changing` = el equipo volvió a la lista de planes. */
export function deriveStage(m: View, changing: boolean): Stage {
  if (m.outcome) return 'outcome';
  if (!m.finalCorrelationValidated) return 'lock';
  if (!m.responseUnlocked) return 'pending';
  return m.selectedPlan && !changing ? 'confirm' : 'plans';
}

/** «cor512», «COR 512» y «cor-512» → «COR-512». */
export function normalizeId(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s+/g, '');
  const m = /^([A-Z]{3})[-_]?(\d{1,4})$/.exec(s);
  return m ? `${m[1]}-${m[2]}` : s;
}

export const LOCK_FIELDS = [
  { key: 'origin', label: 'ORIGEN' },
  { key: 'identity', label: 'IDENTIDAD' },
  { key: 'propagation', label: 'PROPAGACIÓN' },
  { key: 'correlation', label: 'CORRELACIÓN' },
] as const;
export type LockKey = (typeof LOCK_FIELDS)[number]['key'];

// ── Planes (mismo peso visual; se compara por alcance, no por etiquetas) ──

export interface PlanInfo {
  id: ResponsePlan;
  title: string;
  summary: string;
  contains: string[];
  stays: string;
  interrupts: string;
  residual: string;
}

export const PLANS: PlanInfo[] = [
  {
    id: 'ALFA', title: 'Apagado general',
    summary: 'Desconecta VÉRTICE, termina sesiones y suspende servicios conectados.',
    contains: ['Desconectar VÉRTICE', 'Terminar todas las sesiones', 'Suspender los servicios conectados'],
    stays: 'Nada de lo conectado a VÉRTICE.',
    interrupts: 'Todos los servicios conectados, incluidos los que no forman parte del incidente.',
    residual: 'Pérdida de continuidad operativa; los servicios deben restablecerse después.',
  },
  {
    id: 'BETA', title: 'Contención de identidad',
    summary: 'Bloquea a vcruz y rota sus credenciales, pero mantiene SIN-04 operativo.',
    contains: ['Bloquear la cuenta vcruz', 'Rotar sus credenciales', 'Invalidar sus sesiones'],
    stays: 'SIN-04 y los servicios asociados.',
    interrupts: 'Solo el acceso de vcruz.',
    residual: 'La actividad ya establecida en infraestructura puede continuar.',
  },
  {
    id: 'GAMMA', title: 'Aislamiento de inteligencia',
    summary: 'Desconecta el Núcleo de Inteligencia y reinicia sus procesos.',
    contains: ['Desconectar el Núcleo de Inteligencia', 'Reiniciar sus procesos'],
    stays: 'La identidad vcruz, sus sesiones y SIN-04.',
    interrupts: 'El análisis de la capa de inteligencia mientras se reinicia.',
    residual: 'La actividad iniciada antes en infraestructura puede continuar.',
  },
  {
    id: 'DELTA', title: 'Contención dirigida',
    summary: 'Actúa sobre la identidad, sus sesiones y el servicio afectado, y preserva el resto.',
    contains: [
      'Revocar la identidad comprometida', 'Invalidar las sesiones asociadas', 'Aislar SIN-04',
      'Rotar las credenciales del servicio', 'Preservar los servicios no afectados', 'Monitorear la actividad residual',
    ],
    stays: 'Los servicios no afectados.',
    interrupts: 'SIN-04 (aislado) y las sesiones asociadas a vcruz.',
    residual: 'Actividad residual bajo monitoreo.',
  },
];
export const PLAN_MAP = new Map(PLANS.map((p) => [p.id, p]));

// ── Consecuencias operativas (lo que ocurre tras ejecutar; nunca «correcto/incorrecto») ──

type Tone = 'ok' | 'warn' | 'crit' | 'neutral';
export interface OutcomeRow { label: string; steps: string[]; tone: Tone }
export interface OutcomeInfo { banner: string; sub?: string; rows: OutcomeRow[]; message: string; closing?: string }

export const OUTCOMES: Record<ResponsePlan, OutcomeInfo> = {
  DELTA: {
    banner: 'INCIDENTE CONTENIDO',
    sub: 'Servicios preservados: 5/6',
    rows: [
      { label: 'Identidad', steps: ['REVOCADA'], tone: 'ok' },
      { label: 'Sesiones asociadas', steps: ['INVALIDADAS'], tone: 'ok' },
      { label: 'SIN-04', steps: ['AISLANDO', 'AISLADO'], tone: 'ok' },
      { label: 'Propagación', steps: ['CRÍTICA', 'CONTENIDA', 'ESTABLE'], tone: 'ok' },
      { label: 'Núcleo de Inteligencia', steps: ['ADVERTENCIA', 'ESTABLE'], tone: 'ok' },
      { label: 'Servicios no afectados', steps: ['OPERATIVOS'], tone: 'ok' },
    ],
    message: 'La respuesta actuó sobre la identidad y sobre la actividad ya establecida, y preservó los servicios no afectados.',
    closing: 'La inteligencia detectó patrones. El equipo encontró la causa.',
  },
  ALFA: {
    banner: 'CONTENCIÓN INCOMPLETA',
    rows: [
      { label: 'Actividad hostil', steps: ['DETENIDA'], tone: 'ok' },
      { label: 'Servicios VÉRTICE', steps: ['INTERRUMPIDOS'], tone: 'crit' },
      { label: 'Continuidad operativa', steps: ['DEGRADADA'], tone: 'warn' },
      { label: 'Múltiples servicios saludables', steps: ['FUERA DE LÍNEA'], tone: 'crit' },
    ],
    message: 'La actividad fue detenida, pero el alcance de la respuesta provocó una interrupción mayor de la necesaria.',
  },
  BETA: {
    banner: 'CONTENCIÓN INCOMPLETA',
    rows: [
      { label: 'Identidad vcruz', steps: ['REVOCADA'], tone: 'ok' },
      { label: 'Sesiones', steps: ['INVALIDADAS'], tone: 'ok' },
      { label: 'SIN-04', steps: ['ACTIVO'], tone: 'crit' },
      { label: 'Actividad residual', steps: ['PERSISTENTE'], tone: 'warn' },
    ],
    message: 'La identidad fue contenida, pero la actividad ya establecida en infraestructura continúa.',
  },
  GAMMA: {
    banner: 'CONTENCIÓN INCOMPLETA',
    rows: [
      { label: 'Núcleo de Inteligencia', steps: ['AISLADO'], tone: 'neutral' },
      { label: 'SIN-04', steps: ['ACTIVO'], tone: 'crit' },
      { label: 'Propagación', steps: ['PERSISTENTE'], tone: 'warn' },
    ],
    message: 'El Núcleo dejó de participar en el análisis, pero la actividad iniciada anteriormente continúa.',
  },
};
