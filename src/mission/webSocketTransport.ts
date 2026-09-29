import type { MissionEvent } from './types';
import type { MissionTransport } from './transport';
import type { TransportRole } from './broadcastTransport';

/**
 * Transporte del MODO LABORATORIO: varias computadoras en la misma red local, conectadas por WebSocket a un
 * repetidor mínimo (`scripts/lab-server.mjs`). Mismo contrato y mismo modelo de autoridad que el modo portátil:
 *   - `host`   = VÉRTICE. Conserva el registro de eventos de la sesión y responde a las peticiones de sincronización.
 *   - `client` = estaciones. Piden sincronización al conectar (y al reconectar) y aplican el replay.
 * El servidor NO es la autoridad de la misión: solo reenvía mensajes entre navegadores.
 *
 * Reconexión: si el socket cae se reintenta solo (1 s, 2 s, 3 s, luego cada 3 s).
 *   - Cliente: al reconectar vacía los eventos que emitió sin conexión y pide sincronización.
 *   - Host: una reconexión NO reinicia la sesión (solo la PRIMERA conexión difunde MISSION_RESET, igual que el modo
 *     portátil). Pide a las estaciones lo que hicieron mientras estuvo caído, lo incorpora a su registro y después
 *     difunde el registro completo para que todas se pongan al día.
 * El servidor envía un latido cada 5 s; si no llega nada en 15 s se considera caída y se reconecta.
 */
type Wire =
  | { t: 'event'; event: MissionEvent }
  | { t: 'sync-request'; from: string; host?: boolean }
  | { t: 'sync'; to: string; events: MissionEvent[] }
  | { t: 'hb' };

/** Destinatario «todos»: el host lo usa al reconectar. */
const ALL = '*';
const LOG_LIMIT = 500;
const OUTBOX_LIMIT = 100;
const RETRY_MS = [1000, 2000, 3000];
const HEARTBEAT_TIMEOUT_MS = 15000;
/** Tiempo que el host espera las respuestas de las estaciones al reconectar, antes de difundir su registro. */
const MERGE_MS = 1500;

export interface WebSocketTransportOptions {
  retryMs?: number[];
  heartbeatTimeoutMs?: number;
}

export class WebSocketTransport implements MissionTransport {
  private readonly id = Math.random().toString(36).slice(2);
  private readonly listeners = new Set<(e: MissionEvent) => void>();
  private log: MissionEvent[] = [];
  private outbox: Wire[] = [];
  private ws: WebSocket | null = null;
  private everOpen = false;
  private attempts = 0;
  private closed = false;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;
  private lastRx = 0;
  private readonly retryMs: number[];
  private readonly hbTimeout: number;

  constructor(private readonly role: TransportRole, private readonly url: string, opts: WebSocketTransportOptions = {}) {
    this.retryMs = opts.retryMs ?? RETRY_MS;
    this.hbTimeout = opts.heartbeatTimeoutMs ?? HEARTBEAT_TIMEOUT_MS;
    this.connect();
  }

  broadcast(event: MissionEvent): void {
    this.record(event);
    this.send({ t: 'event', event });
  }

  onRemote(listener: (event: MissionEvent) => void): () => void {
    this.listeners.add(listener);
    if (this.role === 'client') this.send({ t: 'sync-request', from: this.id });
    return () => { this.listeners.delete(listener); };
  }

  close(): void {
    this.closed = true;
    this.listeners.clear();
    this.stopWatchdog();
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.dropSocket();
  }

  // ── Conexión ──

  private connect(): void {
    if (this.closed) return;
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.attempts = 0;
      this.lastRx = Date.now();
      this.startWatchdog();
      this.onOpen();
    };
    ws.onmessage = (m: MessageEvent<string>) => {
      this.lastRx = Date.now();
      let w: Wire;
      try { w = JSON.parse(m.data) as Wire; } catch { return; }
      this.onWire(w);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      this.stopWatchdog();
      this.scheduleRetry();
    };
    ws.onerror = () => { /* el cierre que sigue dispara la reconexión */ };
  }

  private onOpen(): void {
    if (this.role === 'host') {
      if (!this.everOpen) {
        this.everOpen = true;
        // Primera conexión de este host: sesión nueva; las estaciones ya abiertas vuelven a «preparada».
        this.send({ t: 'event', event: { type: 'MISSION_RESET' } });
      } else {
        // Reconexión: la sesión NO se reinicia. Primero recoge lo que las estaciones hicieron sin él y luego difunde el registro.
        this.send({ t: 'sync-request', from: this.id, host: true });
        setTimeout(() => this.send({ t: 'sync', to: ALL, events: this.replay() }), MERGE_MS);
      }
      return;
    }
    this.everOpen = true;
    const pending = this.outbox;
    this.outbox = [];
    pending.forEach((w) => this.send(w));
    if (this.listeners.size > 0) this.send({ t: 'sync-request', from: this.id });
  }

  private scheduleRetry(): void {
    if (this.closed || this.retryTimer) return;
    const delay = this.retryMs[Math.min(this.attempts, this.retryMs.length - 1)] ?? 3000;
    this.attempts++;
    this.retryTimer = setTimeout(() => { this.retryTimer = null; this.connect(); }, delay);
  }

  /** Sin latidos = conexión muerta (p. ej. Wi‑Fi caído sin cierre limpio): se abandona el socket y se reconecta. */
  private startWatchdog(): void {
    this.stopWatchdog();
    this.watchdog = setInterval(() => {
      if (Date.now() - this.lastRx > this.hbTimeout) {
        this.dropSocket();
        this.stopWatchdog();
        this.scheduleRetry();
      }
    }, Math.max(1000, Math.floor(this.hbTimeout / 3)));
  }

  private stopWatchdog(): void {
    if (this.watchdog) { clearInterval(this.watchdog); this.watchdog = null; }
  }

  private dropSocket(): void {
    const ws = this.ws;
    this.ws = null;
    if (!ws) return;
    ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
    try { ws.close(); } catch { /* ya cerrado */ }
  }

  // ── Mensajes ──

  private send(w: Wire): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(w));
    } else if (this.role === 'client' && w.t === 'event' && this.outbox.length < OUTBOX_LIMIT) {
      this.outbox.push(w); // se emite al reconectar; el host ya guardará el evento
    }
  }

  private onWire(w: Wire): void {
    switch (w.t) {
      case 'event':
        this.record(w.event);
        this.listeners.forEach((l) => l(w.event));
        break;
      case 'sync-request':
        if (this.role === 'host' && !w.host) this.send({ t: 'sync', to: w.from, events: this.replay() });
        else if (this.role === 'client' && w.host) this.send({ t: 'sync', to: w.from, events: [...this.log] }); // el host acaba de volver
        break;
      case 'sync':
        if (this.role === 'host' && w.to === this.id) this.merge(w.events);
        else if (this.role === 'client' && (w.to === this.id || w.to === ALL)) {
          w.events.forEach((e) => { this.record(e); this.listeners.forEach((l) => l(e)); });
        }
        break;
    }
  }

  /** Registro a reenviar. Sin sesión (vacío) se envía un reinicio para que una estación que se perdió el RESET vuelva a «preparada». */
  private replay(): MissionEvent[] {
    return this.log.length > 0 ? [...this.log] : [{ type: 'MISSION_RESET' }];
  }

  /**
   * Host reconectado: incorpora los eventos que una estación tiene y él no (los emitió mientras el host estaba caído).
   * Sin sesión en curso no incorpora nada (un reinicio hecho durante la caída debe llegar a las estaciones).
   */
  private merge(events: MissionEvent[]): void {
    if (this.log.length === 0) return;
    const have = new Set(this.log.map((e) => JSON.stringify(e)));
    for (const e of events) {
      if (e.type === 'MISSION_START' || e.type === 'MISSION_RESET') continue;
      const key = JSON.stringify(e);
      if (have.has(key)) continue;
      have.add(key);
      this.record(e);
      this.listeners.forEach((l) => l(e));
    }
  }

  /** Todos guardan el registro de la sesión (las estaciones lo devuelven al host si este se cae). MISSION_START abre una sesión nueva; MISSION_RESET la vacía. */
  private record(event: MissionEvent): void {
    if (event.type === 'MISSION_RESET') this.log = [];
    else if (event.type === 'MISSION_START') this.log = [event];
    else this.log = [...this.log, event].slice(-LOG_LIMIT);
  }
}
