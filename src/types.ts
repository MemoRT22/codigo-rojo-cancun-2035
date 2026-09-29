// Estados narrativos canónicos (docs/05-technical-strategy.md). Es el contrato compartido con las
// demás estaciones: no renombrar ni reordenar.
export const NARRATIVE_STATES = [
  'OPERACION_NORMAL',
  'ANOMALIA_DETECTADA',
  'INCIDENTE_ESCALANDO',
  'CORRELACION_ESTABLECIDA',
  'RESPUESTA_AUTORIZADA',
  'CONTENCION_EXITOSA',
  'CONTENCION_INCOMPLETA',
] as const;

export type NarrativeState = (typeof NARRATIVE_STATES)[number];

/**
 * Fase semántica: qué está PASANDO en el mundo, que no es lo mismo que "en qué estado de la
 * secuencia estamos". La visualización reacciona a la fase, no a `state !== NORMAL`.
 */
export type Phase =
  | 'normal'
  | 'observacion'
  | 'investigacion'
  | 'escalamiento'
  | 'correlacion'
  | 'respuesta'
  | 'recuperacion'
  | 'contencion_exitosa'
  | 'contencion_incompleta';

/** Estado operativo de un nodo. `watch` = actividad fuera de patrón aún sin degradación. */
export type NodeStatus = 'ok' | 'watch' | 'warn' | 'crit' | 'off' | 'isolated' | 'recovering';

export interface SystemEvent {
  id: string;
  /** Hora simulada HH:MM:SS. */
  time: string;
  message: string;
  level: 'info' | 'warning' | 'critical' | 'recovery';
  zone?: string;
}
