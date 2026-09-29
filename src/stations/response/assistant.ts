// ── Orientación de Respuesta (contenido curado, determinista) ──
// Orienta sobre alcance, continuidad y riesgo residual. Nunca nombra un plan como la elección ni entrega identificadores.

import { ASSISTANT_TIMING } from '../assistant/config';
import type { AssistantPlan } from '../assistant/types';

export const RESPONSE_ASSISTANT: AssistantPlan = {
  timing: ASSISTANT_TIMING.respuesta,
  hints: [
    {
      id: 'orientacion',
      lead: 'Orientación',
      text: 'Una respuesta efectiva debe contener la actividad sin interrumpir servicios que no forman parte del incidente.',
    },
    {
      id: 'metodo',
      lead: 'Método de análisis',
      text: 'Compara qué componente contiene cada plan y qué riesgo permanece activo.',
      actions: [{ id: 'focus-plans', label: 'Comparar planes' }],
    },
    {
      id: 'patron',
      lead: 'Patrón a buscar',
      text: 'Revisa si el plan actúa tanto sobre la identidad comprometida como sobre la actividad ya establecida.',
    },
    {
      id: 'desbloqueo',
      lead: 'Revisión sugerida',
      text: 'Una respuesta limitada a la identidad deja infraestructura activa; una respuesta limitada al Núcleo no elimina una propagación que comenzó antes.',
    },
  ],
};
