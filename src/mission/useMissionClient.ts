import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { MissionEngine, type EventSource } from './engine';
import { getMissionTransport } from './createTransport';
import type { TransportRole } from './broadcastTransport';
import { LocalTransport } from './transport';
import type { MissionEvent, MissionState } from './types';

export interface MissionClient {
  mission: Readonly<MissionState>;
  dispatch: (event: MissionEvent) => void;
  /** Origen del último evento aplicado: permite distinguir un inicio en vivo de un late join (solo presentación). */
  source: EventSource;
}

/**
 * Cliente de misión para una ESTACIÓN: su propio `MissionEngine` conectado al transporte.
 * Es el punto de entrada común de todas las estaciones (Comunicaciones, Identidad, …); no crea un
 * estado global paralelo: el estado sale del mismo reducer y se sincroniza por eventos.
 */
export function useMissionClient(role: TransportRole = 'client'): MissionClient {
  const ref = useRef<MissionEngine | null>(null);
  if (!ref.current) ref.current = new MissionEngine();
  const engine = ref.current;

  useEffect(() => {
    engine.setTransport(getMissionTransport(role));
    // setTransport desuscribe el anterior: dejar uno local evita listeners huérfanos (StrictMode/HMR).
    return () => engine.setTransport(new LocalTransport());
  }, [engine, role]);

  const mission = useSyncExternalStore(
    (cb) => engine.subscribe(cb),
    () => engine.getState(),
  );

  const dispatch = useCallback((e: MissionEvent) => engine.dispatch(e), [engine]);
  return { mission, dispatch, source: engine.getSource() };
}
