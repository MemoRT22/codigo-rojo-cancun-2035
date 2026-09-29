// ── Escalera de orientación de Inteligencia (contenido curado, determinista) ──
// Ninguna recomendación dice qué agrupación es la relevante ni cuál es la equivocada. Las acciones solo enfocan paneles.

import { ASSISTANT_TIMING } from '../assistant/config';
import type { AssistantPlan } from '../assistant/types';

export const INTELLIGENCE_ASSISTANT: AssistantPlan = {
  timing: ASSISTANT_TIMING.inteligencia,
  hints: [
    {
      id: 'orientacion',
      lead: 'Orientación',
      text: 'Una confianza alta indica que las señales encajan con un patrón; no demuestra por sí sola qué ocurrió primero.',
    },
    {
      id: 'metodo',
      lead: 'Método de análisis',
      text: 'Compara la cronología de cada agrupación antes de aceptar una hipótesis causal.',
      actions: [{ id: 'focus-timeline', label: 'Comparar cronología' }],
    },
    {
      id: 'patron',
      lead: 'Patrón a buscar',
      text: 'Distingue entre una señal que aparece durante la propagación y otra que aparece como consecuencia posterior.',
      actions: [{ id: 'focus-evidence', label: 'Revisar evidencia asociada' }],
    },
    {
      id: 'desbloqueo',
      lead: 'Revisión sugerida',
      text: 'Compara el inicio de NOD-204 con el momento en que el Núcleo de Inteligencia comenzó a mostrar comportamiento fuera de patrón.',
      actions: [
        { id: 'focus-timeline', label: 'Comparar cronología' },
        { id: 'focus-hypothesis', label: 'Contrastar hipótesis' },
      ],
    },
  ],
};
