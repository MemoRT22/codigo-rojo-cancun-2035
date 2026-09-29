import type { MissionEvent } from './types';
import type { MissionTransport, RemoteInfo } from './transport';

/**
 * Transporte del MODO PORTÁTIL: sincroniza VÉRTICE y las estaciones abiertas como pestañas/ventanas
 * del mismo navegador de una sola computadora (BroadcastChannel). No usa red, servidor ni internet.
 *
 * Modelo de autoridad:
 *   - `host`   = VÉRTICE central. Mantiene el registro de eventos de la sesión en curso y responde
 *                a las peticiones de sincronización.
 *   - `client` = estaciones. Piden sincronización cada vez que se suscriben (montaje, StrictMode,
 *                HMR, apertura tardía, recarga) y aplican el replay que reciben.
 *
 * El sincronizado es idempotente: el replay es la secuencia completa de la sesión (empieza en
 * MISSION_START), así que aplicarlo varias veces, o sobre un motor que ya tiene estado, converge al
 * mismo estado. No depende de que llegue un único mensaje en un momento concreto.
 *
 * El modo distribuido futuro sustituye esta clase por `WebSocketTransport` (mismo contrato
 * `MissionTransport`) en `createTransport.ts`; ni el motor ni las estaciones cambian.
 */
export type TransportRole = 'host' | 'client';

type Wire =
  | { t: 'event'; event: MissionEvent }
  | { t: 'sync-request'; from: string }
  | { t: 'sync'; to: string; events: MissionEvent[] };

export const DEFAULT_CHANNEL = 'vertice-mission';
const LOG_LIMIT = 500;

export interface BroadcastTransportOptions {
  /** Nombre del canal (solo cambia en pruebas, para aislar instancias). */
  channel?: string;
}

export class BroadcastChannelTransport implements MissionTransport {
  private readonly channel: BroadcastChannel;
  private readonly id = Math.random().toString(36).slice(2);
  private readonly listeners = new Set<(e: MissionEvent, info?: RemoteInfo) => void>();
  private log: MissionEvent[] = [];

  constructor(private readonly role: TransportRole, opts: BroadcastTransportOptions = {}) {
    this.channel = new BroadcastChannel(opts.channel ?? DEFAULT_CHANNEL);
    this.channel.onmessage = (m: MessageEvent<Wire>) => this.onWire(m.data);
    // Un host que arranca tiene sesión nueva: las estaciones ya abiertas vuelven a «preparada».
    if (role === 'host') this.send({ t: 'event', event: { type: 'MISSION_RESET' } });
  }

  broadcast(event: MissionEvent): void {
    this.record(event);
    this.send({ t: 'event', event });
  }

  /**
   * Cada suscripción nueva (también tras un unsubscribe) pide sincronización al host.
   * Así una desmontada/remontada, o un replay que llegó cuando no había oyentes, se recupera solo.
   */
  onRemote(listener: (event: MissionEvent, info?: RemoteInfo) => void): () => void {
    this.listeners.add(listener);
    if (this.role === 'client') this.send({ t: 'sync-request', from: this.id });
    return () => { this.listeners.delete(listener); };
  }

  close(): void {
    this.listeners.clear();
    this.channel.onmessage = null;
    this.channel.close();
  }

  private send(w: Wire): void {
    this.channel.postMessage(w);
  }

  private onWire(w: Wire): void {
    switch (w.t) {
      case 'event':
        this.record(w.event);
        this.listeners.forEach((l) => l(w.event));
        break;
      case 'sync-request':
        if (this.role === 'host') this.send({ t: 'sync', to: w.from, events: [...this.log] });
        break;
      case 'sync':
        if (w.to === this.id) w.events.forEach((e) => this.listeners.forEach((l) => l(e, { replay: true })));
        break;
    }
  }

  /** Solo el host guarda registro. MISSION_START abre una sesión nueva; MISSION_RESET la vacía. */
  private record(event: MissionEvent): void {
    if (this.role !== 'host') return;
    if (event.type === 'MISSION_RESET') this.log = [];
    else if (event.type === 'MISSION_START') this.log = [event];
    else this.log = [...this.log, event].slice(-LOG_LIMIT);
  }
}
