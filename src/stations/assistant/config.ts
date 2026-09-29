import type { AssistantTiming } from './types';

/**
 * CALIBRACIÓN DEL ASISTENTE DE ANÁLISIS — el único lugar que hay que tocar después del piloto.
 * Son valores de UX, no canon: no afectan a la misión, la evidencia ni la correlación.
 *
 * Identidad (referencia inicial, con un equipo totalmente quieto que pide cada recomendación en cuanto aparece):
 *   ~2:00  orientación  →  ~3:00  método  →  ~4:30  patrón  →  ~6:00  desbloqueo
 *   o bien 3 / 4 / 5 / 6 intentos fallidos acumulados (cada recomendación se sigue pidiendo de una en una).
 */
export const ASSISTANT_TIMING = {
  identidad: {
    stepSeconds: [120, 60, 90, 90],
    failedAttemptsAt: [3, 4, 5, 6],
    autoReveal: false,
    maxDeferFactor: 2,
  },
  infraestructura: {
    stepSeconds: [120, 60, 90, 90],
    failedAttemptsAt: [3, 4, 5, 6],
    autoReveal: false,
    maxDeferFactor: 2,
  },
  inteligencia: {
    stepSeconds: [120, 60, 90, 90],
    failedAttemptsAt: [3, 4, 5, 6],
    autoReveal: false,
    maxDeferFactor: 2,
  },
  /**
   * Comunicaciones conserva su comportamiento original a través del motor común:
   * recomendación 1 a los 180 s y la 2 a los 300 s (o con 3 fallos), mostradas automáticamente.
   * Para migrarla al aviso + solicitud basta con `autoReveal: false` (ver docs/stations/identidad.md).
   */
  comunicaciones: {
    stepSeconds: [180, 120],
    failedAttemptsAt: [3, 3],
    autoReveal: true,
    maxDeferFactor: 2,
  },
} as const satisfies Record<string, AssistantTiming>;
