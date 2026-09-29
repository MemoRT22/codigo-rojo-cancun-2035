import type { NarrativeState } from '../types';
import type { MissionEvent, MissionState } from './types';
import { INITIAL_MISSION } from './types';
import { missionReducer } from './reducer';
import { evaluateTimeline } from './rules';
import type { MissionTransport } from './transport';

export type MissionListener = (state: Readonly<MissionState>) => void;

/**
 * Motor de misión independiente de framework.
 * Administra el estado de misión y evalúa reglas de línea de tiempo.
 * Puede ejecutarse sin React, DOM ni red — las dependencias externas
 * se inyectan como transporte.
 */
export class MissionEngine {
  private state: MissionState = { ...INITIAL_MISSION };
  private listeners = new Set<MissionListener>();
  private transport: MissionTransport | null = null;

  getState(): Readonly<MissionState> {
    return this.state;
  }

  setTransport(t: MissionTransport): void {
    this.transport = t;
  }

  dispatch(event: MissionEvent): void {
    const prev = this.state;
    this.state = missionReducer(prev, event);
    this.transport?.send(event);
    if (this.state !== prev) this.notify();
  }

  /**
   * Evalúa reglas de línea de tiempo en cada tick del reloj simulado.
   * Devuelve el estado narrativo al que debe transicionar, o `null`.
   */
  tick(narrativeState: NarrativeState, clock: number): NarrativeState | null {
    return evaluateTimeline(this.state, narrativeState, clock);
  }

  subscribe(listener: MissionListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify(): void {
    const snapshot = this.state;
    this.listeners.forEach((l) => l(snapshot));
  }
}
