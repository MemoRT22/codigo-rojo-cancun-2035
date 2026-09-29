// ── Contenido canónico de la estación Comunicaciones ──
//
// Fuente: docs/03-game-design.md (Hilo A — Comunicaciones), docs/02-story-bible.md y
// prompts/interfaces/03-mail.md. Canon respetado tal cual:
//   · mensaje relevante: 09:11:08 · COR-512 · «Validación requerida — actualización de identidad»
//   · dominio oficial  @vertice-sistemas.example
//   · dominio falso    @vertice-sistema.example
//   · 7–9 correos normales mezclados, con al menos un distractor urgente pero legítimo (COR-513).
//
// Todo es ficticio. Los identificadores COR-506…COR-515 son identificadores de mensaje ordinarios del
// mismo buzón; solo COR-512 es evidencia. Ningún enlace es operativo.

import type { Hop, Message } from './types';

export const OFFICIAL_DOMAIN = 'vertice-sistemas.example';

export const MAILBOX = {
  owner: 'Valeria Cruz',
  address: `vcruz@${OFFICIAL_DOMAIN}`,
  role: 'Coordinadora de Operaciones Turísticas',
} as const;

const routeOfficial: Hop[] = [
  { host: `mx1.${OFFICIAL_DOMAIN}`, role: 'Servidor de origen' },
  { host: `pasarela.${OFFICIAL_DOMAIN}`, role: 'Pasarela de entrada' },
  { host: `buzon.${OFFICIAL_DOMAIN}`, role: 'Buzón de destino' },
];

const routeExternal: Hop[] = [
  { host: 'mail.vertice-sistema.example', role: 'Servidor de origen' },
  { host: `pasarela.${OFFICIAL_DOMAIN}`, role: 'Pasarela de entrada' },
  { host: `buzon.${OFFICIAL_DOMAIN}`, role: 'Buzón de destino' },
];

const portal = (path: string) => `https://portal.${OFFICIAL_DOMAIN}/${path}`;

const sigTI = ['Mesa de Soporte TI', 'Vértice Sistemas Urbanos · Ext. 4100'];
const sigRH = ['Recursos Humanos', 'Vértice Sistemas Urbanos'];

/** Orden cronológico ascendente; la bandeja los muestra del más reciente al más antiguo. */
export const MESSAGES: Message[] = [
  {
    id: 'COR-506',
    senderName: 'Mesa de Soporte TI',
    senderAddress: `soporte.ti@${OFFICIAL_DOMAIN}`,
    time: '07:58:12',
    subject: 'Resumen semanal de tickets — semana 38',
    body: [
      'Hola Valeria:',
      'Adjuntamos el resumen semanal de tickets atendidos por la Mesa de Soporte TI. Durante la semana se cerraron 128 solicitudes, con un tiempo medio de respuesta de 42 minutos.',
      'Si tienes observaciones sobre algún caso, puedes responder a este mensaje.',
    ],
    signature: sigTI,
    priority: 'Normal',
    links: [],
    attachments: [{ name: 'resumen_tickets_s38.pdf', size: '214 KB' }],
    route: routeOfficial,
    previousFromSender: 214,
    unread: false,
  },
  {
    id: 'COR-507',
    senderName: 'Recursos Humanos',
    senderAddress: `rrhh@${OFFICIAL_DOMAIN}`,
    time: '08:15:40',
    subject: 'Capacitación de seguridad de la información — inscripción abierta',
    body: [
      'Estimado equipo:',
      'Se abre la inscripción a la sesión de seguridad de la información del jueves 27 a las 10:00, en la sala de capacitación del Centro de Operaciones. Duración aproximada: 45 minutos.',
      'Regístrate en el portal de capacitación.',
    ],
    signature: sigRH,
    priority: 'Normal',
    links: [{ label: 'Portal de capacitación', destination: portal('capacitacion') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 96,
    unread: true,
  },
  {
    id: 'COR-508',
    senderName: 'Equipo de Reservas',
    senderAddress: `reservas@${OFFICIAL_DOMAIN}`,
    time: '08:32:05',
    subject: 'Programación de grupos — jueves y viernes',
    body: [
      'Valeria:',
      'Adjunto la programación de grupos para jueves y viernes. Queda pendiente confirmar el grupo de las 10:30 en Zona Hotelera Norte.',
      'Avísanos si necesitas mover algún horario.',
    ],
    signature: ['Equipo de Reservas', 'Vértice Sistemas Urbanos'],
    priority: 'Normal',
    links: [],
    attachments: [{ name: 'programacion_grupos_j-v.xlsx', size: '88 KB' }],
    route: routeOfficial,
    previousFromSender: 187,
    unread: false,
  },
  {
    id: 'COR-509',
    senderName: 'Administración',
    senderAddress: `administracion@${OFFICIAL_DOMAIN}`,
    time: '08:47:31',
    subject: 'Solicitudes de mantenimiento — cierre del día',
    body: [
      'Buen día:',
      'Se recuerda que las solicitudes de mantenimiento del Centro de Operaciones deben registrarse antes de las 15:00 para su atención al día siguiente.',
    ],
    signature: ['Administración', 'Vértice Sistemas Urbanos'],
    priority: 'Normal',
    links: [],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 64,
    unread: true,
  },
  {
    id: 'COR-510',
    senderName: 'Calendario corporativo',
    senderAddress: `calendario@${OFFICIAL_DOMAIN}`,
    time: '09:02:18',
    subject: 'Invitación: revisión de operaciones turísticas · 12:00',
    body: [
      'Valeria Cruz ha sido invitada a una reunión.',
      'Hoy, 12:00–12:45 · Sala 2 del Centro de Operaciones.',
      'Organiza: Dirección de Operaciones.',
    ],
    signature: ['Calendario corporativo'],
    priority: 'Normal',
    links: [{ label: 'Ver en el calendario', destination: portal('calendario/evento/5510') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 312,
    unread: true,
  },
  {
    id: 'COR-511',
    senderName: 'Coordinación de Movilidad',
    senderAddress: `movilidad@${OFFICIAL_DOMAIN}`,
    time: '09:07:54',
    subject: 'Ajuste de horarios de traslado — aeropuerto',
    body: [
      'Hola Valeria:',
      'Por el aumento de llegadas de la tarde, se ajustan los horarios de traslado desde el aeropuerto a partir de las 14:00. La tabla actualizada está en el portal.',
    ],
    signature: ['Coordinación de Movilidad', 'Vértice Sistemas Urbanos'],
    priority: 'Normal',
    links: [{ label: 'Horarios de traslado', destination: portal('movilidad/horarios') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 73,
    unread: true,
  },

  // ── Mensaje canónico del incidente (correo de ingeniería social) ──
  {
    id: 'COR-512',
    senderName: 'Soporte de Identidad',
    senderAddress: 'identidad@vertice-sistema.example',
    time: '09:11:08',
    subject: 'Validación requerida — actualización de identidad',
    body: [
      'Estimada Valeria Cruz:',
      'Como parte de la actualización trimestral de identidad corporativa de VÉRTICE, necesitamos confirmar que tu cuenta sigue asociada a tu rol de Coordinadora de Operaciones Turísticas.',
      'Para conservar tu acceso a los servicios sin interrupciones, completa la validación antes de las 09:30 de hoy.',
      'Si la validación no se completa dentro del plazo, tu acceso podría suspenderse temporalmente hasta que el equipo de Soporte revise tu caso.',
      'Gracias por tu colaboración.',
    ],
    signature: ['Equipo de Identidad Corporativa', 'Vértice Sistemas Urbanos'],
    priority: 'Alta',
    links: [{ label: 'Validar identidad ahora', destination: 'https://validacion.vertice-sistema.example/identidad?u=vcruz' }],
    attachments: [],
    route: routeExternal,
    previousFromSender: 0,
    unread: true,
    evidence: 'COR-512',
  },

  // ── Distractor urgente pero legítimo ──
  {
    id: 'COR-513',
    senderName: 'Mesa de Soporte TI',
    senderAddress: `soporte.ti@${OFFICIAL_DOMAIN}`,
    time: '09:12:26',
    subject: 'Acción requerida hoy — rotación programada de credenciales de servicio',
    body: [
      'Hola Valeria:',
      'Como parte del ciclo mensual de mantenimiento, hoy a las 11:30 se rotarán las credenciales de los servicios internos que utiliza Operaciones Turísticas. No es necesario que cambies tu contraseña personal.',
      'Durante la ventana (aproximadamente 10 minutos) algunos servicios podrían reconectarse. El detalle está en el aviso de mantenimiento.',
      'Referencia: ticket ST-2035-0925.',
    ],
    signature: sigTI,
    cc: [`operaciones@${OFFICIAL_DOMAIN}`],
    priority: 'Alta',
    links: [{ label: 'Aviso de mantenimiento ST-2035-0925', destination: portal('avisos/ST-2035-0925') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 214,
    unread: true,
  },
  {
    id: 'COR-514',
    senderName: 'Recursos Humanos',
    senderAddress: `rrhh@${OFFICIAL_DOMAIN}`,
    time: '09:13:02',
    subject: 'Actualización de datos de contacto — confirma antes del viernes',
    body: [
      'Estimado equipo:',
      'Como cada año, actualizamos los datos de contacto de emergencia del personal. Revisa y confirma tu información en el portal antes del viernes 28.',
    ],
    signature: sigRH,
    priority: 'Normal',
    links: [{ label: 'Datos de contacto', destination: portal('rrhh/datos-contacto') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 96,
    unread: true,
  },
  {
    id: 'COR-515',
    senderName: 'Comunicación Interna',
    senderAddress: `comunicacion@${OFFICIAL_DOMAIN}`,
    time: '09:14:36',
    subject: 'Boletín interno — satisfacción de visitantes, septiembre',
    body: [
      'Equipo:',
      'Ya está disponible el boletín de septiembre con los resultados de satisfacción de visitantes y los reconocimientos del mes.',
    ],
    signature: ['Comunicación Interna', 'Vértice Sistemas Urbanos'],
    priority: 'Normal',
    links: [{ label: 'Leer el boletín', destination: portal('boletin/09-2035') }],
    attachments: [],
    route: routeOfficial,
    previousFromSender: 41,
    unread: true,
  },
];

export const MESSAGE_MAP = new Map(MESSAGES.map((m) => [m.id, m]));

/** Bandeja: más reciente primero. */
export const INBOX: Message[] = [...MESSAGES].sort((a, b) => (a.time < b.time ? 1 : -1));

export const domainOf = (address: string) => address.split('@')[1] ?? '';
