import type { EvidenceId } from '../../mission/types';

export type EventKind = 'concedido' | 'denegado' | 'actividad';

export interface IdentityUser {
  /** Nombre de usuario (ej. vcruz). */
  id: string;
  name: string;
  role: string;
  /** Perfil habitual. */
  habitualDevice: string;
  habitualZone: string;
  /** Dispositivos registrados para el usuario. */
  knownDevices: string[];
}

export interface AccessEvent {
  /** Identificador del evento tal como lo muestra el sistema (ej. ACC-417). */
  id: string;
  /** Hora HH:MM:SS (canónica, no depende del reloj del equipo). */
  time: string;
  userId: string;
  device: string;
  zone: string;
  kind: EventKind;
  /** Accesos: método de autenticación. */
  method?: string;
  /** Actividad de sesión: recurso consultado. */
  resource?: string;
  /** Contexto operativo del evento, solo cuando existe (ej. ventana de soporte programada). */
  context?: string;
  /** Evidencia canónica que produce este evento al agregarse a la investigación. */
  evidence?: EvidenceId;
}

export interface SessionInfo {
  device: string;
  zone: string;
  since: string;
  last: string;
  events: number;
}

export type ResultFilter = 'todos' | EventKind;

export type Feedback = { kind: 'no-match' } | { kind: 'registered'; eventId: string } | { kind: 'already' };

export interface UiState {
  selectedId: string | null;
  query: string;
  result: ResultFilter;
  zone: string;
  detailsOpen: boolean;
  /** Últimas acciones de análisis (trazabilidad, sin horas del reloj local). */
  trace: string[];
  misses: number;
  feedback: Feedback | null;
}

export type UiAction =
  | { type: 'RESET' }
  | { type: 'SELECT'; id: string }
  | { type: 'QUERY'; query: string }
  | { type: 'RESULT'; result: ResultFilter }
  | { type: 'ZONE'; zone: string }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'FEEDBACK'; feedback: Feedback | null }
  | { type: 'MISS' }
  | { type: 'TRACE'; entry: string };
