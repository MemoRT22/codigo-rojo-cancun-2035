import type { EvidenceId } from '../../mission/types';

export interface MessageLink {
  /** Texto visible del enlace. */
  label: string;
  /** Destino real (ficticio, no operativo). Visible en Detalles y al pasar el cursor. */
  destination: string;
}

export interface MessageAttachment {
  name: string;
  size: string;
}

export interface Hop {
  host: string;
  role: string;
}

export interface Message {
  /** Identificador del mensaje tal como lo muestra el sistema (ej. COR-512). */
  id: string;
  senderName: string;
  senderAddress: string;
  /** Hora de recepción HH:MM:SS (canónica, no depende del reloj del equipo). */
  time: string;
  subject: string;
  /** Párrafos del cuerpo; `\n` dentro de un párrafo = salto de línea. */
  body: string[];
  signature: string[];
  cc?: string[];
  priority: 'Normal' | 'Alta';
  links: MessageLink[];
  attachments: MessageAttachment[];
  /** Ruta de entrega del mensaje, de origen a buzón. */
  route: Hop[];
  /** Cuántos mensajes previos hay de este remitente en el buzón corporativo. */
  previousFromSender: number;
  /** Se muestra sin leer al iniciar la sesión. */
  unread: boolean;
  /** Evidencia canónica que produce este mensaje al agregarse a la investigación. */
  evidence?: EvidenceId;
}

export type FilterId = 'todos' | 'no-leidos' | 'enlaces' | 'adjuntos' | 'prioridad';

/** Fases de la estación (independientes de la fase narrativa de la LED). */
export type { StationPhase } from '../shell/types';

export interface UiState {
  selectedId: string | null;
  readIds: string[];
  query: string;
  filter: FilterId;
  detailsOpen: boolean;
  /** Últimas acciones de análisis (trazabilidad). Sin horas: no dependen del reloj local. */
  trace: string[];
  /** Intentos de vincular comunicaciones sin coincidencia. */
  misses: number;
  feedback: Feedback | null;
}

export type Feedback =
  | { kind: 'no-match'; messageId: string }
  | { kind: 'registered'; messageId: string }
  | { kind: 'already' }
  | { kind: 'link-blocked' };

export type UiAction =
  | { type: 'RESET' }
  | { type: 'SELECT'; id: string }
  | { type: 'QUERY'; query: string }
  | { type: 'FILTER'; filter: FilterId }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'FEEDBACK'; feedback: Feedback | null }
  | { type: 'MISS' }
  | { type: 'TRACE'; entry: string };
