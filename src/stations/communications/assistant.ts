// ── Recomendaciones de Comunicaciones (mismo texto y ritmo que antes de existir el motor común) ──

import { ASSISTANT_TIMING } from '../assistant/config';
import type { AssistantPlan } from '../assistant/types';

export const COMMUNICATIONS_ASSISTANT: AssistantPlan = {
  timing: ASSISTANT_TIMING.comunicaciones,
  hints: [
    { id: 'orientacion', lead: '', text: 'VÉRTICE detecta comunicaciones recientes con metadatos que conviene revisar.' },
    { id: 'metodo', lead: 'Sugerencia de análisis', text: 'compara remitente, dominio y horario. Un mensaje urgente no necesariamente es malicioso.' },
  ],
};
