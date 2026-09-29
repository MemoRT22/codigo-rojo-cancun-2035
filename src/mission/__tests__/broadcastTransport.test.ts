import { afterEach, describe, expect, it } from 'vitest';
import { BroadcastChannelTransport } from '../broadcastTransport';
import { MissionEngine } from '../engine';
import { LocalTransport } from '../transport';

// Protege el MODO PORTÁTIL: una estación que se abre tarde, o que se re-suscribe (StrictMode/HMR),
// debe reconstruir la sesión en curso a partir del host (VÉRTICE).

const open: BroadcastChannelTransport[] = [];
afterEach(() => { open.splice(0).forEach((t) => t.close()); });

function pair() {
  const channel = `test-${Math.random().toString(36).slice(2)}`;
  const hostT = new BroadcastChannelTransport('host', { channel });
  const clientT = new BroadcastChannelTransport('client', { channel });
  open.push(hostT, clientT);
  const host = new MissionEngine();
  host.setTransport(hostT);
  return { host, client: new MissionEngine(), clientT };
}

async function until(cond: () => boolean, ms = 1000) {
  const t0 = Date.now();
  while (!cond()) {
    if (Date.now() - t0 > ms) throw new Error('timeout esperando sincronización');
    await new Promise((r) => setTimeout(r, 5));
  }
}
const settle = () => new Promise((r) => setTimeout(r, 50));

describe('Transporte portátil (BroadcastChannel)', () => {
  it('late join: una estación que se conecta después reconstruye la sesión del host', async () => {
    const { host, client, clientT } = pair();
    host.dispatch({ type: 'MISSION_START' });
    host.dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' });

    client.setTransport(clientT); // la estación se abre DESPUÉS

    await until(() => client.getState().discoveredEvidence.includes('COR-512'));
    expect(client.getState().status).toBe('running');
    expect(client.getState().discoveredEvidence).toEqual(['COR-512']);
  });

  it('re-suscripción: subscribe → unsubscribe → subscribe recupera el estado del host', async () => {
    const { host, client, clientT } = pair();
    host.dispatch({ type: 'MISSION_START' });

    // Carrera de StrictMode: se desmonta antes de que llegue la primera respuesta.
    client.setTransport(clientT);
    client.setTransport(new LocalTransport());
    client.setTransport(clientT);
    await until(() => client.getState().status === 'running');

    // Baja de la estación mientras la sesión avanza: no recibe nada…
    client.setTransport(new LocalTransport());
    host.dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: 'ACC-417', source: 'identidad' });
    await settle();
    expect(client.getState().discoveredEvidence).toEqual([]);

    // …y al volver a suscribirse se pone al día con el estado actual del host.
    client.setTransport(clientT);
    await until(() => client.getState().discoveredEvidence.includes('ACC-417'));
    expect(client.getState().status).toBe('running');
  });
});
