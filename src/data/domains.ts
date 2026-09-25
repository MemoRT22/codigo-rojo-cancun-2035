import type { DomainState } from '../types';

export const DOMAIN_DEFINITIONS: Omit<DomainState, 'status' | 'activity'>[] = [
  { id: 'identidad', label: 'Identidad y Accesos' },
  { id: 'infraestructura', label: 'Infraestructura' },
  { id: 'movilidad', label: 'Movilidad' },
  { id: 'turismo', label: 'Servicios Turísticos' },
  { id: 'sensores', label: 'Sensores y Monitoreo' },
  { id: 'inteligencia', label: 'Núcleo de Inteligencia' },
];
