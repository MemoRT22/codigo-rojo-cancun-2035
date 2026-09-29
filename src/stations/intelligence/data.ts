// ── Contenido de la estación Inteligencia (agrupaciones, hipótesis y cronología) ──
//
// Canon respetado (docs/03-game-design.md, Hilo D · docs/02-story-bible.md):
//   · AGR-18 desviación de identidad ≈79% · AGR-27 propagación entre servicios ≈92% · AGR-31 inestabilidad del Núcleo ≈84%
//   · cronología: 09:16:04 ACC-417 · 09:16:51 · 09:17:22 NOD-204 · 09:18:36 · 09:19:44 Núcleo · 09:20:11 · 09:20:38 hipótesis
// AGR-31 es una hipótesis plausible: describe una correlación real. La lección sale de comparar horas, no de un color ni de una etiqueta.
// AGR-09 y AGR-22 son contexto (reutilizan los distractores de Identidad e Infraestructura) y no forman subtramas.

import type { Group, TimelineEvent } from './types';

export const toSeconds = (t: string) => {
  const [h = 0, m = 0, s = 0] = t.split(':').map(Number);
  return h * 3600 + m * 60 + s;
};

export const TIMELINE: TimelineEvent[] = [
  { id: 'soporte', time: '08:55:20', label: 'Ventana de soporte remoto: aumento de actividad en SIN-02', ref: 'ACC-406' },
  { id: 'sync', time: '09:12:40', label: 'Sincronización programada de sensores en BUS-SEN-02', ref: 'PROG-0912' },
  { id: 'acceso', time: '09:16:04', label: 'Acceso remoto concedido a vcruz', ref: 'ACC-417' },
  { id: 'fuera-patron', time: '09:16:51', label: 'La sesión accede a un servicio fuera de su patrón habitual' },
  { id: 'sin04', time: '09:17:22', label: 'Cambio de actividad en SIN-04', ref: 'NOD-204' },
  { id: 'conexiones', time: '09:18:36', label: 'Conexiones hacia servicios asociados' },
  { id: 'nucleo', time: '09:19:44', label: 'Núcleo de Inteligencia: comportamiento fuera de patrón' },
  { id: 'correlacion', time: '09:20:11', label: 'La capa de inteligencia correlaciona anomalías' },
  { id: 'hipotesis', time: '09:20:38', label: 'VÉRTICE genera una hipótesis de origen' },
];
export const EVENT_MAP = new Map(TIMELINE.map((e) => [e.id, e]));

const NUCLEO = 'Núcleo de Inteligencia';

export const GROUPS: Group[] = [
  {
    id: 'AGR-09', name: 'Actividad de soporte remoto', confidence: 66,
    statement: 'Un aumento sostenido de actividad en un servicio coincide con una sesión remota de soporte.',
    interpretation: 'La actividad podría corresponder a una ventana de soporte programada.',
    signals: ['soporte'],
    relation: {
      nodes: [{ title: 'ACC-406', sub: 'Sesión de soporte', time: '08:55:02' }, { title: 'SIN-02', sub: 'Aumento de actividad', time: '08:55:20' }],
      edges: ['sesión referenciada'],
    },
    reject: { title: 'La agrupación no presenta suficiente relación con la secuencia del incidente actual.', detail: 'Revisa cuándo ocurren sus señales.' },
  },
  {
    id: 'AGR-18', name: 'Desviación de identidad', confidence: 79,
    statement: 'Un acceso desde un dispositivo y una zona distintos de los habituales precede a actividad fuera del patrón de la identidad.',
    interpretation: 'La identidad presenta una desviación de comportamiento respecto a su perfil.',
    signals: ['acceso', 'fuera-patron'],
    relation: {
      nodes: [{ title: 'ACC-417', sub: 'Acceso remoto', time: '09:16:04' }, { title: 'Servicio fuera de patrón', sub: 'Misma sesión', time: '09:16:51' }],
      edges: ['fuera del patrón habitual'],
    },
    reject: { title: 'La agrupación describe una desviación relevante, pero no explica suficientemente la propagación observada entre servicios.', detail: 'Revisa qué ocurre después del acceso.' },
  },
  {
    id: 'AGR-22', name: 'Ritmo de sincronización de sensores', confidence: 58,
    statement: 'Un pico de actividad en el bus de sensores coincide con una tarea programada.',
    interpretation: 'El pico podría corresponder a una sincronización programada.',
    signals: ['sync'],
    relation: {
      nodes: [{ title: 'PROG-0912', sub: 'Tarea programada', time: '09:12:40' }, { title: 'BUS-SEN-02', sub: 'Pico de actividad', time: '09:12:40' }],
      edges: ['tarea referenciada'],
    },
    reject: { title: 'La agrupación no presenta suficiente relación con la secuencia del incidente actual.', detail: 'Revisa cuándo ocurren sus señales.' },
  },
  {
    id: 'AGR-27', name: 'Propagación entre servicios', confidence: 92,
    statement: 'El sistema detecta una secuencia de actividad entre servicios asociada a una misma sesión.',
    interpretation: 'La actividad podría estar propagándose entre servicios a partir de esa sesión.',
    signals: ['acceso', 'sin04', 'conexiones'],
    relation: {
      nodes: [
        { title: 'ACC-417', sub: 'Sesión remota', time: '09:16:04' },
        { title: 'NOD-204', sub: 'Nodo SIN-04', time: '09:17:22' },
        { title: 'Servicios asociados', sub: 'Conexiones', time: '09:18:36' },
      ],
      edges: ['sesión referenciada', 'actividad posterior'],
    },
    reject: { title: '', detail: '' },
    evidence: 'AGR-27',
  },
  {
    id: 'AGR-31', name: 'Inestabilidad del Núcleo de Inteligencia', confidence: 84,
    statement: 'La inestabilidad observada en el Núcleo de Inteligencia presenta correlación con múltiples servicios afectados.',
    interpretation: 'El Núcleo podría estar originando la propagación.',
    signals: ['conexiones', 'nucleo', 'hipotesis'],
    relation: {
      nodes: [
        { title: NUCLEO, sub: 'Comportamiento fuera de patrón', time: '09:19:44' },
        { title: 'Servicios asociados', sub: 'Conexiones', time: '09:18:36' },
      ],
      edges: ['posible origen'],
    },
    reject: { title: 'La hipótesis presenta correlación, pero la secuencia temporal no establece suficiente soporte causal para vincularla como origen.', detail: 'Revisa qué ocurrió primero.' },
  },
];
export const GROUP_MAP = new Map(GROUPS.map((g) => [g.id, g]));
