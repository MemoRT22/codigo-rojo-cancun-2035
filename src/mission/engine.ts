import type { NarrativeState } from '../types';
import type { MissionEvent, MissionState } from './types';
import { INITIAL_MISSION } from './types';
import { missionReducer } from './reducer';
import { evaluateTimeline } from './rules';
import type { MissionTransport, RemoteInfo } from './transport';

export type MissionListener = (state: Readonly<MissionState>) => void;

/** Origen del último evento aplicado: propio, remoto en vivo o replay del registro del host (late join / reconexión). */
export type EventSource = 'local' | 'live' | 'replay';

/**
 * Motor de misión independiente de framework.
 *
 * Dos vías de entrada:
 *   - `dispatch(event)` — evento local: reduce + broadcast al transporte.
 *   - `receive(event)` — evento remoto: reduce sin re-broadcast (sin loop).
 */
export class MissionEngine {
  private state: MissionState = { ...INITIAL_MISSION };
  private listeners = new Set<MissionListener>();
  private transport: MissionTransport | null = null;
  private unsubRemote: (() => void) | null = null;
  private source: EventSource = 'local';

  getState(): Readonly<MissionState> {
    return this.state;
  }

  /** Origen del último evento aplicado (solo presentación; no forma parte de MissionState). */
  getSource(): EventSource {
    return this.source;
  }

  setTransport(t: MissionTransport): void {
    this.unsubRemote?.();
    this.transport = t;
    this.unsubRemote = t.onRemote((event, info) => this.receive(event, info));
  }

  /** Evento originado localmente: reduce y difunde. */
  dispatch(event: MissionEvent): void {
    this.source = 'local';
    this.apply(event);
    this.transport?.broadcast(event);
  }

  /** Evento recibido desde otra instancia: reduce sin difundir. */
  receive(event: MissionEvent, info?: RemoteInfo): void {
    this.source = info?.replay ? 'replay' : 'live';
    this.apply(event);
  }

  tick(narrativeState: NarrativeState, clock: number): NarrativeState | null {
    return evaluateTimeline(this.state, narrativeState, clock);
  }

  subscribe(listener: MissionListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private apply(event: MissionEvent): void {
    const prev = this.state;
    this.state = missionReducer(prev, event);
    if (this.state !== prev) this.notify();
  }

  private notify(): void {
    const snapshot = this.state;
    this.listeners.forEach((l) => l(snapshot));
  }
}
