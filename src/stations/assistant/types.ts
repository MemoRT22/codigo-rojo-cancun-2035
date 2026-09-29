// ── Analysis Assistant: tipos ──
//
// Experiencia LOCAL / UI. El Mission Engine no sabe que existe: nada de aquí entra en `MissionState`
// ni emite eventos de misión. El contenido (hints) lo aporta cada estación; el motor común solo decide
// cuándo hay una orientación nueva, cuál es la siguiente y qué cuenta como progreso.

/** Acción contextual que una recomendación puede ofrecer. La estación decide cómo ejecutarla; nunca resuelve la evidencia. */
export interface AssistantAction {
  id: string;
  label: string;
  payload?: string;
}

/** Una recomendación de la escalera. El orden del arreglo ES el orden de la escalera (no hay saltos de nivel). */
export interface AssistantHint {
  id: string;
  /** Encabezado corto en línea («Método de análisis»). Vacío = sin encabezado. */
  lead: string;
  text: string;
  actions?: readonly AssistantAction[];
}

/**
 * Calibración de UX (NO canon). Un solo lugar por estación: `config.ts`.
 * Los arreglos se indexan por nivel (posición 0 = primera recomendación).
 */
export interface AssistantTiming {
  /** Segundos SIN PROGRESO que hacen disponible el nivel i+1 (contados desde la última actividad significativa o recomendación mostrada). */
  stepSeconds: readonly number[];
  /** Intentos fallidos ACUMULADOS que hacen disponible el nivel i+1. */
  failedAttemptsAt: readonly number[];
  /** true: la recomendación se muestra sola al quedar disponible. false: solo aparece un aviso y el equipo la solicita. */
  autoReveal: boolean;
  /** Tope de aplazamiento: la actividad significativa puede retrasar un nivel como máximo `stepSeconds × factor` segundos en total. */
  maxDeferFactor: number;
}

/** Lo que una estación proporciona al asistente: contenido curado + calibración. */
export interface AssistantPlan {
  hints: readonly AssistantHint[];
  timing: AssistantTiming;
}

export interface AssistantState {
  /** Recomendaciones ya mostradas (0 = ninguna). */
  shownLevel: number;
  /** Recomendaciones desbloqueadas (>= shownLevel). Si supera a shownLevel hay un aviso pendiente. */
  availableLevel: number;
  /** Veces que el equipo pidió la siguiente recomendación. */
  requestedCount: number;
  /** Segundos activos sin actividad significativa (se reinicia con progreso o al mostrar una recomendación). */
  inactiveSeconds: number;
  /** Segundos activos desde la última recomendación mostrada; no lo reinicia el progreso (tope de aplazamiento). */
  elapsedSeconds: number;
  failedAttempts: number;
  /** Señales de progreso ya contabilizadas: repetir la misma no cuenta. */
  seenSignals: readonly string[];
}

export type AssistantAct =
  | { type: 'TICK'; seconds?: number }
  | { type: 'PROGRESS'; key: string }
  | { type: 'FAILED_ATTEMPT'; key?: string }
  | { type: 'REQUEST' }
  | { type: 'FORCE_NEXT' }
  | { type: 'RESET' };
