import type { MissionEvent } from './types';
import { LocalTransport, type MissionTransport } from './transport';

/**
 * Transporte de DESARROLLO entre pestañas del mismo navegador (BroadcastChannel).
 *
 * Es un adaptador, no parte del núcleo: implementa `MissionTransport` y se sustituye por
 * `WebSocketTransport` en un único punto (`getMissionTransport`). No hay backend ni almacenamiento.
 *
 * Roles:
 *   - `host`   (la LED / futuro Mission Server): fuente de verdad. Guarda el registro de eventos de la
 *              sesión actual y lo reenvía a quien se conecte tarde.
 *   - `client` (estaciones): al conectarse pide el estado al host.
 */
export type TransportRole = 'host' | 'client';

type Wire =
  | { t: 'event'; event: MissionEvent }
  | { t: 'hello'; from: string }
  | { t: 'replay'; to: string; events: MissionEvent[] };

const CHANNEL = 'vertice-mission-dev';
const LOG_LIMIT = 200;

export class BroadcastChannelTransport implements MissionTransport {
  private readonly channel: BroadcastChannel;
  private readonly id = Math.random().toString(36).slice(2);
  private readonly listeners = new Set<(e: MissionEvent) => void>();
  private log: MissionEvent[] = [];
  private helloSent = false;

  constructor(private readonly role: TransportRole) {
    this.channel = new BroadcastChannel(CHANNEL);
    this.channel.onmessage = (m: MessageEvent<Wire>) => this.onWire(m.data);
    // Un host que arranca tiene estado fresco: las estaciones ya abiertas deben volver a inicio.
    if (role === 'host') this.channel.postMessage({ t: 'event', event: { type: 'MISSION_RESET' } } satisfies Wire);
  }

  broadcast(event: MissionEvent): void {
    this.record(event);
    this.channel.postMessage({ t: 'event', event } satisfies Wire);
  }

  onRemote(listener: (event: MissionEvent) => void): () => void {
    this.listeners.add(listener);
    if (this.role === 'client' && !this.helloSent) {
      this.helloSent = true;
      this.channel.postMessage({ t: 'hello', from: this.id } satisfies Wire);
    }
    return () => { this.listeners.delete(listener); };
  }

  private onWire(w: Wire): void {
    if (w.t === 'event') {
      this.record(w.event);
      this.listeners.forEach((l) => l(w.event));
    } else if (w.t === 'hello' && this.role === 'host') {
      this.channel.postMessage({ t: 'replay', to: w.from, events: [...this.log] } satisfies Wire);
    } else if (w.t === 'replay' && w.to === this.id) {
      w.events.forEach((e) => this.listeners.forEach((l) => l(e)));
    }
  }

  /** El host recuerda solo la sesión en curso: START reinicia el registro, RESET lo vacía. */
  private record(event: MissionEvent): void {
    if (this.role !== 'host') return;
    if (event.type === 'MISSION_RESET') this.log = [];
    else if (event.type === 'MISSION_START') this.log = [event];
    else this.log = [...this.log, event].slice(-LOG_LIMIT);
  }
}

const singletons = new Map<TransportRole, MissionTransport>();

/**
 * Único punto de selección de transporte.
 * Multi-PC: devolver aquí un `WebSocketTransport` (mismo contrato `MissionTransport`).
 */
export function getMissionTransport(role: TransportRole): MissionTransport {
  let t = singletons.get(role);
  if (!t) {
    t = typeof BroadcastChannel === 'undefined' ? new LocalTransport() : new BroadcastChannelTransport(role);
    singletons.set(role, t);
  }
  return t;
}
