import type { EvidenceId } from '../../mission/types';

/** Hecho de la cronología del incidente (compartida por todas las agrupaciones). */
export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  ref?: string;
}

export interface RelationNode {
  title: string;
  sub: string;
  time: string;
}

export interface Group {
  /** Identificador de la agrupación tal como lo muestra el sistema (ej. AGR-27). */
  id: string;
  name: string;
  /** Nivel de confianza del modelo (%). No es certeza ni probabilidad de acierto. */
  confidence: number;
  /** Lo que detecta el sistema y su posible interpretación (hipótesis del sistema). */
  statement: string;
  interpretation: string;
  /** Eventos de la cronología que sustentan la agrupación. */
  signals: string[];
  /** Relaciones que propone el sistema: nodos en orden y etiqueta de cada flecha. */
  relation: { nodes: RelationNode[]; edges: string[] };
  /** Feedback neutral al vincularla sin que corresponda. */
  reject: { title: string; detail: string };
  /** Evidencia canónica que produce al agregarse a la investigación. */
  evidence?: EvidenceId;
}

export type Feedback =
  | { kind: 'no-match'; title: string; detail: string }
  | { kind: 'registered'; id: string }
  | { kind: 'already' };

export interface UiState {
  selectedId: string | null;
  detailsOpen: boolean;
  trace: string[];
  feedback: Feedback | null;
}

export type UiAction =
  | { type: 'RESET' }
  | { type: 'SELECT'; id: string }
  | { type: 'TOGGLE_DETAILS' }
  | { type: 'FEEDBACK'; feedback: Feedback | null }
  | { type: 'TRACE'; entry: string };
