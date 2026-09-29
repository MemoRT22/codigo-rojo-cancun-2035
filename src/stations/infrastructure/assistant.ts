// ── Escalera de orientación de Infraestructura (contenido curado, determinista) ──
// Ninguna recomendación nombra el nodo ni el identificador de evidencia. Las acciones solo enfocan o filtran.

import { ASSISTANT_TIMING } from '../assistant/config';
import type { AssistantPlan } from '../assistant/types';

export const INFRASTRUCTURE_ASSISTANT: AssistantPlan = {
  timing: ASSISTANT_TIMING.infraestructura,
  hints: [
    {
      id: 'orientacion',
      lead: 'Orientación',
      text: 'Algunos servicios muestran cambios de actividad, pero no todos forman parte del incidente.',
    },
    {
      id: 'metodo',
      lead: 'Método de análisis',
      text: 'Compara hora de inicio, magnitud del cambio y contexto operativo de cada nodo.',
      actions: [{ id: 'focus-chart', label: 'Comparar actividad por hora' }],
    },
    {
      id: 'patron',
      lead: 'Patrón a buscar',
      text: 'Busca un servicio cuyo cambio ocurra después del acceso investigado y que conserve una referencia a esa sesión.',
      actions: [{ id: 'focus-refs', label: 'Revisar referencias de sesión' }],
    },
    {
      id: 'desbloqueo',
      lead: 'Revisión sugerida',
      text: 'Revisa los cambios alrededor de las 09:17 y compara las referencias de sesión de los nodos afectados.',
      actions: [{ id: 'recent-changes', label: 'Ver cambios recientes' }],
    },
  ],
};
