import { BroadcastChannelTransport, type TransportRole } from './broadcastTransport';
import { LocalTransport, type MissionTransport } from './transport';
import { WebSocketTransport } from './webSocketTransport';

const singletons = new Map<TransportRole, MissionTransport>();

/**
 * Modo explícito (nunca por heurística de host o IP):
 *   ?mode=lab       → laboratorio (WebSocket)
 *   ?mode=portable  → portátil (BroadcastChannel)
 *   sin parámetro   → lo que declare el servidor (`npm run lab` inyecta `window.__VERTICE_MODE__ = 'lab'`),
 *                     y si no hay declaración, portátil.
 */
function labMode(): boolean {
  if (typeof location === 'undefined') return false;
  const q = new URLSearchParams(location.search).get('mode');
  if (q === 'lab') return true;
  if (q === 'portable') return false;
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
    if (labMode()) t = typeof WebSocket === 'undefined' ? new LocalTransport() : new WebSocketTransport(role, lanSocketUrl());
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
