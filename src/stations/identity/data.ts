// ── Contenido canónico de la estación Identidad y Accesos ──
//
// Fuente: docs/03-game-design.md (Hilo B), docs/02-story-bible.md y prompts/interfaces/02-access-identity.md.
// Canon respetado tal cual:
//   · evento relevante: 09:16:04 · vcruz · TER-REM-91 · REMOTO · ACCESO CONCEDIDO · ACC-417
//   · perfil de Valeria Cruz: Coordinadora de Operaciones Turísticas · equipo habitual EST-OPS-12 ·
//     zona habitual CENTRO-OPERACIONES, con actividad normal en su estación durante todo el periodo.
//   · distractores permitidos: fallo seguido de acceso concedido (pnunez) y sesión remota legítima
//     respaldada por una ventana de soporte programada (ftorres).
//
// Los demás usuarios, dispositivos y zonas son ficticios y solo aportan contexto. ACC-417 no lleva
// ninguna marca especial: la incompatibilidad surge de comparar con el perfil y la cronología.

import type { AccessEvent, IdentityUser } from './types';

export const USERS: IdentityUser[] = [
  {
    id: 'vcruz', name: 'Valeria Cruz', role: 'Coordinadora de Operaciones Turísticas',
    habitualDevice: 'EST-OPS-12', habitualZone: 'CENTRO-OPERACIONES', knownDevices: ['EST-OPS-12'],
  },
  {
    id: 'dramos', name: 'Diego Ramos', role: 'Analista de Operaciones',
    habitualDevice: 'EST-OPS-07', habitualZone: 'CENTRO-OPERACIONES', knownDevices: ['EST-OPS-07'],
  },
  {
    id: 'ftorres', name: 'Fernanda Torres', role: 'Técnica de Soporte TI',
    habitualDevice: 'TER-SOP-03', habitualZone: 'REMOTO', knownDevices: ['TER-SOP-03'],
  },
  {
    id: 'amolina', name: 'Andrés Molina', role: 'Administración',
    habitualDevice: 'EST-ADM-02', habitualZone: 'CENTRO-OPERACIONES', knownDevices: ['EST-ADM-02'],
  },
  {
    id: 'sherrera', name: 'Sofía Herrera', role: 'Agente de Reservas',
    habitualDevice: 'EST-RES-03', habitualZone: 'PUERTO-JUAREZ', knownDevices: ['EST-RES-03'],
  },
  {
    id: 'pnunez', name: 'Paola Núñez', role: 'Coordinadora de Movilidad',
    habitualDevice: 'EST-OPS-15', habitualZone: 'CENTRO-OPERACIONES', knownDevices: ['EST-OPS-15'],
  },
];

export const USER_MAP = new Map(USERS.map((u) => [u.id, u]));

const SUPPORT_WINDOW = 'Ventana de soporte programada 08:30–09:30 · Mantenimiento de estaciones';
const PANEL = 'Panel de Operaciones Turísticas';

/** Orden cronológico ascendente (ACC-404 … ACC-419). La lista los muestra del más reciente al más antiguo. */
export const EVENTS: AccessEvent[] = [
  { id: 'ACC-404', time: '08:47:10', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'concedido', method: 'Contraseña' },
  { id: 'ACC-405', time: '08:52:36', userId: 'dramos', device: 'EST-OPS-07', zone: 'CENTRO-OPERACIONES', kind: 'concedido', method: 'Contraseña' },
  { id: 'ACC-406', time: '08:55:02', userId: 'ftorres', device: 'TER-SOP-03', zone: 'REMOTO', kind: 'concedido', method: 'Contraseña', context: SUPPORT_WINDOW },
  { id: 'ACC-407', time: '08:58:47', userId: 'amolina', device: 'EST-ADM-02', zone: 'CENTRO-OPERACIONES', kind: 'concedido', method: 'Contraseña' },
  { id: 'ACC-408', time: '09:01:15', userId: 'sherrera', device: 'EST-RES-03', zone: 'PUERTO-JUAREZ', kind: 'concedido', method: 'Contraseña' },
  { id: 'ACC-409', time: '09:03:44', userId: 'pnunez', device: 'EST-OPS-15', zone: 'CENTRO-OPERACIONES', kind: 'denegado', method: 'Contraseña', context: 'Contraseña incorrecta' },
  { id: 'ACC-410', time: '09:04:10', userId: 'pnunez', device: 'EST-OPS-15', zone: 'CENTRO-OPERACIONES', kind: 'concedido', method: 'Contraseña' },
  { id: 'ACC-411', time: '09:06:52', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: PANEL },
  { id: 'ACC-412', time: '09:09:20', userId: 'dramos', device: 'EST-OPS-07', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: PANEL },
  { id: 'ACC-413', time: '09:11:40', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: 'Programación de grupos' },
  { id: 'ACC-414', time: '09:13:05', userId: 'ftorres', device: 'TER-SOP-03', zone: 'REMOTO', kind: 'actividad', resource: 'Herramienta de mantenimiento de estaciones', context: SUPPORT_WINDOW },
  { id: 'ACC-415', time: '09:14:58', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: PANEL },
  { id: 'ACC-416', time: '09:15:31', userId: 'amolina', device: 'EST-ADM-02', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: 'Solicitudes de mantenimiento' },

  // ── Evento canónico ──
  { id: 'ACC-417', time: '09:16:04', userId: 'vcruz', device: 'TER-REM-91', zone: 'REMOTO', kind: 'concedido', method: 'Contraseña', evidence: 'ACC-417' },

  { id: 'ACC-418', time: '09:16:38', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: 'Programación de grupos' },
  { id: 'ACC-419', time: '09:17:26', userId: 'vcruz', device: 'EST-OPS-12', zone: 'CENTRO-OPERACIONES', kind: 'actividad', resource: PANEL },
];

export const EVENT_MAP = new Map(EVENTS.map((e) => [e.id, e]));

/** Bandeja: más reciente primero. */
export const FEED: AccessEvent[] = [...EVENTS].sort((a, b) => (a.time < b.time ? 1 : -1));

export const ZONES = [...new Set(EVENTS.map((e) => e.zone))].sort();

/** Ventana temporal de la cronología por usuario (08:40–09:20). */
export const TIMELINE = { from: '08:40:00', to: '09:20:00', ticks: ['08:45', '09:00', '09:15'] } as const;
