import { INK, STATUS } from '../brand/tokens';
import type { NodeStatus, Phase } from '../types';

/** Color de TEXTO por estado (más oscuro que el color gráfico, para leerse sobre blanco). */
export const STATUS_TEXT: Record<NodeStatus, string> = {
  ok: INK.secondary,
  watch: '#4B5F82',
  warn: '#A86A00',
  crit: '#C22B2B',
  off: '#5E6D80',
  isolated: '#5E6D80',
  recovering: '#0B8F82',
};

/** Color gráfico (puntos, barras) por estado. */
export const STATUS_FILL: Record<NodeStatus, string | null> = {
  ok: null,
  watch: '#8AA0BE',
  warn: STATUS.warn,
  crit: STATUS.crit,
  off: STATUS.isolated,
  isolated: STATUS.isolated,
  recovering: STATUS.recover,
};

/** Estado de zona en lenguaje de operación (todo visible en español). */
export const ZONE_STATUS_LABEL: Record<NodeStatus, string> = {
  ok: 'Estable',
  watch: 'En observación',
  warn: 'Degradado',
  crit: 'Crítico',
  off: 'Sin respuesta',
  isolated: 'Aislado',
  recovering: 'Recuperando',
};

export interface Severity { label: string; color: string }

export function severityOf(phase: Phase): Severity {
  switch (phase) {
    case 'normal': return { label: 'Normal', color: STATUS.ok };
    case 'observacion': return { label: 'Baja', color: '#6E8FC9' };
    case 'investigacion': return { label: 'Moderada', color: STATUS.warn };
    case 'escalamiento':
    case 'correlacion':
    case 'respuesta': return { label: 'Alta', color: STATUS.crit };
    case 'recuperacion': return { label: 'Moderada', color: STATUS.recover };
    case 'contencion_exitosa': return { label: 'Controlada', color: STATUS.ok };
    case 'contencion_incompleta': return { label: 'Crítica', color: STATUS.crit };
  }
}
