import type { EvidenceId } from '../../mission/types';

export interface NodeEvent {
  time: string;
  text: string;
  /** Referencia asociada (sesión, tarea programada, mantenimiento…). */
  ref?: string;
}

/** Cambio de actividad de un nodo (con él se genera la serie de la gráfica y los datos del panel). */
export interface Change {
  kind: 'step' | 'spike' | 'ramp' | 'dip';
  at: string;
  /** Nivel al que llega (solicitudes/s). */
  to: number;
  /** Solo spike/dip: cuándo termina. */
  until?: string;
}

export interface InfraNode {
  /** Nombre del nodo tal como lo muestra el sistema (ej. SIN-04). */
  id: string;
  /** Identificador de la observación (Detalles del nodo). */
  obs: string;
  name: string;
  service: string;
  zone: string;
  status: string;
  /** Actividad habitual (solicitudes/s). */
  usual: number;
  change?: Change;
  events: NodeEvent[];
  links: string[];
  /** Documentación operativa que explica el comportamiento, cuando existe. */
  docs?: string;
  evidence?: EvidenceId;
}

export type NodeFilter = 'todos' | 'cambios';
export type NodeSort = 'nodo' | 'pico';

export type Feedback =
  | { kind: 'no-match' }
  | { kind: 'explained' }
  | { kind: 'registered'; obs: string }
  | { kind: 'already' };

export interface UiState {
  selectedId: string | null;
  filter: NodeFilter;
  sort: NodeSort;
  detailsOpen: boolean;
  trace: string[];
  feedback: Feedback | null;
}

export type UiAction =
  | { type: 'RESET' }
  | { type: 'SELECT'; id: string }
  | { type: 'FILTER'; filter: NodeFilter }
  | { type: 'SORT'; sort: NodeSort }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'FEEDBACK'; feedback: Feedback | null }
  | { type: 'TRACE'; entry: string };
