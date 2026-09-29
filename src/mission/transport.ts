import type { MissionEvent } from './types';

/**
 * Abstracción de transporte para eventos de misión.
 * Hoy: distribución local en la misma pestaña.
 * Mañana: WebSocket hacia un servidor de sesión que conecta LED + estaciones.
 */
export interface MissionTransport {
  send(event: MissionEvent): void;
  subscribe(listener: (event: MissionEvent) => void): () => void;
}

export class LocalTransport implements MissionTransport {
  private listeners = new Set<(event: MissionEvent) => void>();

  send(event: MissionEvent): void {
    this.listeners.forEach((l) => l(event));
  }

  subscribe(listener: (event: MissionEvent) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}
