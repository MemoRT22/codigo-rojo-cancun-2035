import type { Theme } from '../brand/themes';
import type { NodeStatus, Phase } from '../types';

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

export function severityOf(phase: Phase, T: Theme): Severity {
  switch (phase) {
    case 'normal': return { label: 'Normal', color: T.STATUS.ok };
    case 'observacion': return { label: 'Baja', color: T.mode === 'midnight' ? '#7090B8' : '#6E8FC9' };
    case 'investigacion': return { label: 'Moderada', color: T.STATUS.warn };
    case 'escalamiento':
    case 'correlacion':
    case 'respuesta': return { label: 'Alta', color: T.STATUS.crit };
    case 'recuperacion': return { label: 'Moderada', color: T.STATUS.recover };
    case 'contencion_exitosa': return { label: 'Controlada', color: T.STATUS.ok };
    case 'contencion_incompleta': return { label: 'Crítica', color: T.STATUS.crit };
  }
}
