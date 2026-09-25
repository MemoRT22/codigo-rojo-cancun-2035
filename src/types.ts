export const NARRATIVE_STATES = [
  'OPERACION_NORMAL',
  'ANOMALIA_DETECTADA',
  'INCIDENTE_ESCALANDO',
  'CORRELACION_ESTABLECIDA',
  'RESPUESTA_AUTORIZADA',
  'CONTENCION_EXITOSA',
  'CONTENCION_INCOMPLETA',
] as const;

export type NarrativeState = (typeof NARRATIVE_STATES)[number];

export type SeverityLevel = 'NORMAL' | 'BAJO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';

export type DomainStatus = 'OPERATIVO' | 'ADVERTENCIA' | 'ALERTA' | 'CRÍTICO' | 'AISLANDO' | 'AISLADO' | 'REVOCANDO' | 'REVOCADA' | 'FUERA DE SERVICIO' | 'ESTABLE' | 'CONTENIDO';

export interface DomainState {
  id: string;
  label: string;
  status: DomainStatus;
  activity: number; // 0-100 normalized
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
}

export interface StateConfig {
  headline: string;
  subheadline?: string;
  severity: SeverityLevel;
  sync: number;
  domains: DomainState[];
  events: SystemEvent[];
  accentColor: 'teal' | 'amber' | 'red';
}
