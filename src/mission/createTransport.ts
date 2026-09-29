import { BroadcastChannelTransport, type TransportRole } from './broadcastTransport';
import { LocalTransport, type MissionTransport } from './transport';
import { WebSocketTransport } from './webSocketTransport';

const singletons = new Map<TransportRole, MissionTransport>();

/**
 * El modo depende del ENTORNO que se levantó, nunca de la barra de direcciones:
 *   npm run lab   → el servidor declara `window.__VERTICE_MODE__ = 'lab'` → WebSocket (varias computadoras)
 *   npm run dev / build servido normalmente → sin declaración → BroadcastChannel (portátil, una computadora)
 */
function serverDeclaredLabMode(): boolean {
  return (globalThis as { __VERTICE_MODE__?: string }).__VERTICE_MODE__ === 'lab';
}

/** El WebSocket sale del mismo servidor que sirvió la página: ws://host:puerto/ws (wss si la página es https). */
function lanSocketUrl(): string {
  return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`;
}

/**
 * ÚNICO punto de selección de transporte.
 *
 *   Modo A — portátil:    BroadcastChannel, una computadora, sin red.
 *   Modo B — laboratorio: WebSocket contra `scripts/lab-server.mjs`, varias computadoras en la misma red local.
 *
 * Si el navegador no soporta el transporte elegido, degrada a `LocalTransport` (una sola ventana).
 */
export function getMissionTransport(role: TransportRole): MissionTransport {
  let t = singletons.get(role);
  if (!t) {
    if (serverDeclaredLabMode()) t = typeof WebSocket === 'undefined' ? new LocalTransport() : new WebSocketTransport(role, lanSocketUrl());
    else t = typeof BroadcastChannel === 'undefined' ? new LocalTransport() : new BroadcastChannelTransport(role);
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
