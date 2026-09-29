import { BroadcastChannelTransport, type TransportRole } from './broadcastTransport';
import { LocalTransport, type MissionTransport } from './transport';

const singletons = new Map<TransportRole, MissionTransport>();

/**
 * ÚNICO punto de selección de transporte.
 *
 *   Modo A — portátil (actual):   BroadcastChannel, una computadora, sin red.
 *   Modo B — distribuido (futuro): devolver aquí un `WebSocketTransport` (mismo contrato).
 *
 * Si el navegador no soporta BroadcastChannel, degrada a `LocalTransport` (una sola ventana).
 */
export function getMissionTransport(role: TransportRole): MissionTransport {
  let t = singletons.get(role);
  if (!t) {
    t = typeof BroadcastChannel === 'undefined' ? new LocalTransport() : new BroadcastChannelTransport(role);
    singletons.set(role, t);
  }
  return t;
}

// HMR: cierra los canales del módulo anterior para no dejar oyentes huérfanos.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    singletons.forEach((t) => t.close?.());
    singletons.clear();
  });
}
