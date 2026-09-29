import type { ThemeMode } from '../brand/themes';

// ── Canal de PRESENTACIÓN ──
//
// Estado visual compartido de la sesión (hoy solo el tema DAY / MIDNIGHT). Es un canal aparte del de MISIÓN:
//   Mission channel      → MissionEvent / MissionState (verdad de la misión)
//   Presentation channel → cómo se ve la sesión (nunca entra en MissionState, MissionEvent ni el reducer)
// En modo laboratorio comparte el socket/relay del transporte de misión con mensajes claramente separados
// (el servidor sigue siendo un repetidor sin semántica); en modo portátil usa BroadcastChannel.

export type PresentationMessage = { type: 'THEME_CHANGED'; theme: ThemeMode };

export interface PresentationChannel {
  /** Difunde un cambio de presentación originado aquí a las demás instancias. */
  publish(message: PresentationMessage): void;
  /** Escucha cambios remotos. Un cliente que se suscribe (o reconecta) pide al host el estado actual. */
  subscribe(listener: (message: PresentationMessage) => void): () => void;
  /** El host declara cuál es el estado actual para quien se une tarde. */
  provideSnapshot(snapshot: () => PresentationMessage[]): void;
  close?(): void;
}

const CHANNEL = 'vertice-presentation';

/** Modo portátil: pestañas de una misma computadora. El tema actual de una pestaña nueva sale de localStorage (ThemeContext). */
export function createBroadcastPresentation(): PresentationChannel {
  const ch = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);
  const listeners = new Set<(m: PresentationMessage) => void>();
  if (ch) ch.onmessage = (e: MessageEvent<PresentationMessage>) => listeners.forEach((l) => l(e.data));
  return {
    publish: (m) => ch?.postMessage(m),
    subscribe: (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    provideSnapshot: () => {},
    close: () => { listeners.clear(); ch?.close(); },
  };
}
