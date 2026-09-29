// ── Escalera de orientación de Identidad y Accesos (contenido curado, determinista) ──
//
// Reglas de contenido: cada recomendación explica CÓMO razonar o reduce el espacio de búsqueda; ninguna nombra
// el evento, su identificador ni el dispositivo remoto. Solo la última nombra al usuario y su estación habitual.
// Las acciones enfocan paneles o aplican filtros: NUNCA seleccionan, abren ni vinculan un evento.

import { ASSISTANT_TIMING } from '../assistant/config';
import type { AssistantPlan } from '../assistant/types';

export const IDENTITY_ASSISTANT: AssistantPlan = {
  timing: ASSISTANT_TIMING.identidad,
  hints: [
    {
      id: 'orientacion',
      lead: 'Orientación',
      text: 'VÉRTICE ha detectado identidades con actividad simultánea desde contextos distintos.',
    },
    {
      id: 'metodo',
      lead: 'Método de análisis',
      text: 'Compara usuario, dispositivo, zona y comportamiento habitual antes de clasificar una sesión.',
      actions: [{ id: 'focus-profile', label: 'Revisar perfil habitual' }],
    },
    {
      id: 'patron',
      lead: 'Patrón a buscar',
      text: 'Busca una identidad que mantenga actividad desde su contexto habitual mientras aparece una segunda sesión desde una ubicación distinta.',
      actions: [
        { id: 'focus-sessions', label: 'Comparar sesiones simultáneas' },
        { id: 'focus-zones', label: 'Comparar zonas de actividad' },
      ],
    },
    {
      id: 'desbloqueo',
      lead: 'Revisión sugerida',
      text: 'Revisa la actividad de vcruz alrededor de las 09:16 y compárala con su actividad habitual en EST-OPS-12.',
      actions: [{ id: 'show-user-activity', label: 'Ver actividad de vcruz', payload: 'vcruz' }],
    },
  ],
};
