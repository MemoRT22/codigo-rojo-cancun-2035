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
 * Hoy `LocalTransport` no hace nada con broadcast (la única instancia ya
 * procesó el evento). Mañana `WebSocketTransport` enviará el payload por
 * la red en `broadcast` y alimentará `receive` desde el listener de mensajes.
 */
export interface MissionTransport {
  /** Difundir un evento originado localmente hacia las demás instancias. */
  broadcast(event: MissionEvent): void;
  /** Suscribirse a eventos que llegan desde instancias remotas. */
  onRemote(listener: (event: MissionEvent) => void): () => void;
}

/**
 * Transporte local: no-op porque solo existe una instancia.
 * Preparado para ser reemplazado por WebSocketTransport.
 */
export class LocalTransport implements MissionTransport {
  broadcast(_event: MissionEvent): void {
    // En modo local no hay peers. Nada que difundir.
  }

  onRemote(_listener: (event: MissionEvent) => void): () => void {
    // En modo local no llegan eventos remotos.
    return () => {};
  }
}
