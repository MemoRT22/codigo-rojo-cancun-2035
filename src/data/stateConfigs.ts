import type { StateConfig, SystemEvent, DomainState } from '../types';

function domains(overrides: Partial<Record<string, Partial<DomainState>>>): DomainState[] {
  const base: DomainState[] = [
    { id: 'identidad', label: 'Identidad y Accesos', status: 'OPERATIVO', activity: 32 },
    { id: 'infraestructura', label: 'Infraestructura', status: 'OPERATIVO', activity: 45 },
    { id: 'movilidad', label: 'Movilidad', status: 'OPERATIVO', activity: 58 },
    { id: 'turismo', label: 'Servicios Turísticos', status: 'OPERATIVO', activity: 41 },
    { id: 'sensores', label: 'Sensores y Monitoreo', status: 'OPERATIVO', activity: 37 },
    { id: 'inteligencia', label: 'Núcleo de Inteligencia', status: 'OPERATIVO', activity: 28 },
  ];
  return base.map((d) => ({ ...d, ...overrides[d.id] }));
}

let _eid = 1;
function ev(timestamp: string, message: string, level: SystemEvent['level'] = 'info'): SystemEvent {
  return { id: `EV-${String(_eid++).padStart(4, '0')}`, timestamp, message, level };
}

export const STATE_CONFIGS: Record<string, StateConfig> = {
  OPERACION_NORMAL: {
    headline: 'OPERACIÓN NORMAL',
    severity: 'NORMAL',
    sync: 99.8,
    accentColor: 'teal',
    domains: domains({}),
    events: [
      ev('09:08:12', 'Sincronización de servicios completada'),
      ev('09:08:45', 'Verificación de nodos periféricos finalizada'),
      ev('09:09:01', 'Monitoreo de zona hotelera estable'),
      ev('09:09:33', 'Ciclo de telemetría actualizado'),
      ev('09:10:02', 'Rotación programada de credenciales en curso'),
      ev('09:10:18', 'Registro de actividad archivado'),
    ],
  },

  ANOMALIA_DETECTADA: {
    headline: 'ANOMALÍA DE IDENTIDAD DETECTADA',
    subheadline: 'Correlación incompleta — Validación humana requerida',
    severity: 'BAJO',
    sync: 98.4,
    accentColor: 'amber',
    domains: domains({
      identidad: { status: 'ADVERTENCIA', activity: 61 },
    }),
    events: [
      ev('09:11:08', 'Nueva sesión de identidad detectada', 'warning'),
      ev('09:12:40', 'Sincronización programada de BUS-SEN-02'),
      ev('09:13:15', 'Variación de actividad en servicio de identidad', 'warning'),
      ev('09:14:02', 'Verificación de patrones en curso'),
      ev('09:15:30', 'Sesión de identidad fuera de patrón habitual', 'warning'),
    ],
  },

  INCIDENTE_ESCALANDO: {
    headline: 'INCIDENTE EN ESCALAMIENTO',
    subheadline: 'Múltiples servicios con actividad anómala',
    severity: 'ALTO',
    sync: 94.1,
    accentColor: 'red',
    domains: domains({
      identidad: { status: 'ALERTA', activity: 78 },
      infraestructura: { status: 'ADVERTENCIA', activity: 72 },
      sensores: { status: 'ADVERTENCIA', activity: 65 },
      inteligencia: { status: 'ADVERTENCIA', activity: 70 },
    }),
    events: [
      ev('09:16:04', 'Acceso desde dispositivo no registrado', 'warning'),
      ev('09:16:51', 'Servicio interno con patrón de acceso inusual', 'warning'),
      ev('09:17:22', 'Incremento de solicitudes en nodo de sincronización', 'critical'),
      ev('09:18:36', 'Conexiones anómalas hacia servicios asociados', 'critical'),
      ev('09:19:03', 'Propagación de actividad entre dominios detectada', 'critical'),
      ev('09:19:44', 'Comportamiento fuera de patrón en análisis de inteligencia', 'warning'),
    ],
  },

  CORRELACION_ESTABLECIDA: {
    headline: 'CORRELACIÓN DE IDENTIDAD ESTABLECIDA',
    subheadline: 'Secuencia causal parcialmente reconstruida',
    severity: 'ALTO',
    sync: 93.7,
    accentColor: 'amber',
    domains: domains({
      identidad: { status: 'ALERTA', activity: 74 },
      infraestructura: { status: 'ADVERTENCIA', activity: 68 },
      sensores: { status: 'ADVERTENCIA', activity: 60 },
      inteligencia: { status: 'ADVERTENCIA', activity: 65 },
    }),
    events: [
      ev('09:20:11', 'Correlación temporal entre eventos de identidad'),
      ev('09:20:28', 'Vínculo entre sesión anómala y servicio interno identificado'),
      ev('09:20:45', 'Análisis de propagación en curso'),
    ],
  },

  RESPUESTA_AUTORIZADA: {
    headline: 'CORRELACIÓN VERIFICADA',
    subheadline: 'Autorización de respuesta concedida',
    severity: 'ALTO',
    sync: 93.2,
    accentColor: 'amber',
    domains: domains({
      identidad: { status: 'ALERTA', activity: 72 },
      infraestructura: { status: 'ALERTA', activity: 70 },
      sensores: { status: 'ADVERTENCIA', activity: 58 },
      inteligencia: { status: 'ADVERTENCIA', activity: 62 },
    }),
    events: [
      ev('09:21:05', 'Secuencia de evidencia validada por célula de respuesta'),
      ev('09:21:18', 'Consola de respuesta desbloqueada'),
      ev('09:21:30', 'Esperando selección de plan de contención', 'warning'),
    ],
  },

  CONTENCION_EXITOSA: {
    headline: 'INCIDENTE CONTENIDO',
    subheadline: 'Servicios preservados: 5/6',
    severity: 'MODERADO',
    sync: 97.3,
    accentColor: 'teal',
    domains: domains({
      identidad: { status: 'ESTABLE', activity: 30 },
      infraestructura: { status: 'AISLADO', activity: 5 },
      sensores: { status: 'OPERATIVO', activity: 35 },
      inteligencia: { status: 'ESTABLE', activity: 25 },
    }),
    events: [
      ev('09:22:01', 'Identidad comprometida: revocada'),
      ev('09:22:04', 'Sesiones asociadas: invalidadas'),
      ev('09:22:08', 'Nodo SIN-04: aislamiento iniciado'),
      ev('09:22:12', 'Nodo SIN-04: aislado'),
      ev('09:22:16', 'Propagación: contenida'),
      ev('09:22:20', 'Núcleo de Inteligencia: estabilizado'),
      ev('09:22:25', 'Actividad residual en descenso'),
      ev('09:22:30', 'Incidente contenido — servicios preservados: 5/6'),
    ],
  },

  CONTENCION_INCOMPLETA: {
    headline: 'CONTENCIÓN INCOMPLETA',
    subheadline: 'Actividad no neutralizada en servicios afectados',
    severity: 'CRÍTICO',
    sync: 87.2,
    accentColor: 'red',
    domains: domains({
      identidad: { status: 'ADVERTENCIA', activity: 55 },
      infraestructura: { status: 'CRÍTICO', activity: 82 },
      sensores: { status: 'ADVERTENCIA', activity: 60 },
      inteligencia: { status: 'FUERA DE SERVICIO', activity: 3 },
    }),
    events: [
      ev('09:22:01', 'Plan de contención ejecutado'),
      ev('09:22:06', 'Núcleo de Inteligencia: fuera de servicio', 'critical'),
      ev('09:22:10', 'Nodo SIN-04: actividad continúa', 'critical'),
      ev('09:22:15', 'Propagación no detenida', 'critical'),
      ev('09:22:20', 'Servicios dependientes sin respaldo analítico', 'critical'),
      ev('09:22:28', 'Contención incompleta — intervención adicional requerida', 'critical'),
    ],
  },
};
