import { flushSync } from 'react-dom';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DAY, MIDNIGHT, type Theme, type ThemeMode } from './themes';
import type { TransportRole } from '../mission/broadcastTransport';
import { getPresentationChannel } from '../mission/createTransport';

// ── Tema DAY / MIDNIGHT ──
//
// Responsabilidad propia, separada del Mission Engine: solo cambia la PRESENTACIÓN. No toca misión,
// estación, mundo simulado, temporizador ni selección. Se guarda en localStorage y se sincroniza
// entre todas las pestañas VÉRTICE de la misma computadora (modo portátil).

const STORAGE_KEY = 'vertice-theme';

interface ThemeCtx { theme: Theme; mode: ThemeMode; toggle: () => void; setMode: (m: ThemeMode) => void }

const Ctx = createContext<ThemeCtx>({ theme: DAY, mode: 'day', toggle: () => {}, setMode: () => {} });

const isMode = (v: unknown): v is ThemeMode => v === 'day' || v === 'midnight';

function readStored(): ThemeMode | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isMode(v) ? v : null;
  } catch {
    return null; // navegación privada o almacenamiento bloqueado: se usa el tema en memoria
  }
}

/**
 * Transición de iluminación. Preferente: View Transitions API (fundido de toda la pantalla, incluidos
 * gradientes, SVG y canvas). Respaldo: transiciones CSS por propiedad durante unos instantes.
 * Con `prefers-reduced-motion` el cambio es inmediato.
 */
let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
function withLightingTransition(update: () => void) {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return update();
  // Pestaña en segundo plano (p. ej. cambio sincronizado desde otro módulo): no hay nada que animar.
  if (document.hidden) return update();
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<unknown>; finished: Promise<unknown>; updateCallbackDone: Promise<unknown> };
  };
  if (doc.startViewTransition) {
    const t = doc.startViewTransition(() => flushSync(update));
    // Si el navegador aborta la transición (p. ej. la pestaña se oculta a mitad), el cambio ya se aplicó.
    for (const p of [t.ready, t.finished, t.updateCallbackDone]) p.catch(() => {});
    return;
  }
  const root = document.documentElement;
  root.classList.add('theme-transition');
  clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => root.classList.remove('theme-transition'), 800);
  update();
}

/**
 * `role`: 'host' (VÉRTICE) o 'client' (estaciones). El tema es una preferencia de PRESENTACIÓN compartida por toda la sesión:
 * viaja por el canal de presentación (BroadcastChannel en modo portátil; el socket del laboratorio, aparte de los eventos de misión).
 * El host responde con el tema actual a quien se une tarde. Nunca forma parte de MissionState.
 */
export function ThemeProvider({ children, role = 'client' }: { children: ReactNode; role?: TransportRole }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStored() ?? 'day');
  const modeRef = useRef(mode);
  const channelRef = useRef<ReturnType<typeof getPresentationChannel> | null>(null);

  // Aplica un cambio (local o remoto). Idempotente: si ya está en ese tema no hace nada.
  const apply = useCallback((next: ThemeMode) => {
    if (modeRef.current === next) return;
    modeRef.current = next;
    withLightingTransition(() => setModeState(next));
  }, []);

  // Cambios que llegan del resto de la sesión (y `storage` como respaldo entre pestañas de una misma computadora).
  useEffect(() => {
    const ch = getPresentationChannel(role);
    channelRef.current = ch;
    const off = ch.subscribe((m) => {
      if (m.type !== 'THEME_CHANGED' || !isMode(m.theme)) return;
      try { localStorage.setItem(STORAGE_KEY, m.theme); } catch { /* sin persistencia */ }
      apply(m.theme);
    });
    ch.provideSnapshot(() => [{ type: 'THEME_CHANGED', theme: modeRef.current }]);
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY && isMode(e.newValue)) apply(e.newValue); };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      off();
      channelRef.current = null;
    };
  }, [apply, role]);

  useEffect(() => { document.documentElement.dataset.theme = mode; }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* sin persistencia */ }
    channelRef.current?.publish({ type: 'THEME_CHANGED', theme: next });
    apply(next);
  }, [apply]);

  const toggle = useCallback(() => setMode(modeRef.current === 'day' ? 'midnight' : 'day'), [setMode]);

  const value = useMemo<ThemeCtx>(
    () => ({ theme: mode === 'day' ? DAY : MIDNIGHT, mode, toggle, setMode }),
    [mode, toggle, setMode],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx { return useContext(Ctx); }
