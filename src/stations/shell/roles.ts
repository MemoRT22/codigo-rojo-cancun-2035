// Puesto de cada estación: quién eres, qué observas y qué pregunta te haces. Solo MÉTODO de pensamiento:
// nunca nombra personas, identificadores, nodos ni agrupaciones, y no dice dónde está la respuesta.
// Texto derivado de las tarjetas de rol (docs/11-role-cards.md).

export interface StationRole {
  /** Título del puesto (se muestra en mayúsculas). */
  title: string;
  responsibility: string;
  observes: string[];
  question: string;
  rule: string;
}

export const ROLES = {
  comunicaciones: {
    title: 'Analista de Comunicaciones',
    responsibility: 'Revisa las comunicaciones relacionadas con el incidente.',
    observes: ['remitentes', 'direcciones', 'horarios', 'contexto', 'identificadores'],
    question: '¿Qué comunicación podría estar relacionada con el origen?',
    rule: 'Un mensaje urgente no necesariamente es malicioso.',
  },
  identidad: {
    title: 'Analista de Identidad',
    responsibility: 'Analiza quién accede, desde dónde y en qué momento.',
    observes: ['usuarios', 'dispositivos', 'zonas', 'horarios', 'sesiones'],
    question: '¿Qué acceso no encaja con el comportamiento habitual?',
    rule: 'Un acceso fallido no necesariamente forma parte de un ataque.',
  },
  infraestructura: {
    title: 'Analista de Infraestructura',
    responsibility: 'Observa cómo cambia el comportamiento de los servicios de VÉRTICE.',
    observes: ['actividad', 'horarios', 'servicios', 'referencias de sesión'],
    question: '¿Qué cambió después de que comenzó el incidente?',
    rule: 'El servicio con más actividad no necesariamente es el origen.',
  },
  inteligencia: {
    title: 'Analista de Inteligencia',
    responsibility: 'Evalúa los patrones e hipótesis generados por VÉRTICE.',
    observes: ['confianza', 'cronología', 'relaciones', 'evidencia', 'hipótesis'],
    question: '¿La hipótesis realmente puede explicar lo que ocurrió primero?',
    rule: 'Una confianza alta no significa certeza.',
  },
} as const satisfies Record<string, StationRole>;
