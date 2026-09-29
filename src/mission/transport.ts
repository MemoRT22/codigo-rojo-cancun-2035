import type { MissionEvent } from './types';

/**
 * Abstracción de transporte para eventos de misión.
 *
 * El engine distingue dos flujos:
 *
 *   dispatchLocal (engine → transport.broadcast)
 *     Un evento originado en ESTA instancia se reduce localmente y luego
 *     se difunde a las demás mediante `broadcast`. En multi-PC esto será
 *     la escritura al WebSocket.
 *
 *   receive (transport → engine.receive)
 *     Un evento que llega DESDE FUERA (otra estación) se reduce localmente
 *     sin volver a difundirse, rompiendo el loop.
 *
 * Implementaciones:
 *   - `BroadcastChannelTransport` — MODO PORTÁTIL (oficial del piloto): una computadora,
 *     pestañas/ventanas del mismo navegador, VÉRTICE = host y estaciones = clientes.
 *   - `LocalTransport` — una sola ventana (degradación mínima / pruebas).
 *   - `WebSocketTransport` — MODO LABORATORIO: varias computadoras en la misma red local (repetidor `scripts/lab-server.mjs`).
 *
 * Selección en un único punto: `createTransport.ts`. Ver docs/12-modos-de-ejecucion.md.
 */
/** Metadatos de un evento remoto: `replay` = viene del registro que el host reenvía a quien se une o reconecta (no es un hecho «en vivo»). */
export interface RemoteInfo { replay: boolean }

export interface MissionTransport {
  /** Difundir un evento originado localmente hacia las demás instancias. */
  broadcast(event: MissionEvent): void;
  /**
   * Suscribirse a eventos que llegan desde instancias remotas.
   * Cada suscripción nueva debe poder sincronizarse con el estado actual de la sesión.
   */
  onRemote(listener: (event: MissionEvent, info?: RemoteInfo) => void): () => void;
  /** Libera recursos (canales, sockets). Opcional. */
  close?(): void;
}

/**
 * Transporte de una sola ventana: no-op porque solo existe una instancia.
 */
export class LocalTransport implements MissionTransport {
  broadcast(_event: MissionEvent): void {
    // En modo local no hay peers. Nada que difundir.
  }

  onRemote(_listener: (event: MissionEvent, info?: RemoteInfo) => void): () => void {
    // En modo local no llegan eventos remotos.
    return () => {};
  }
}
