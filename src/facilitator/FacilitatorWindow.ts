import { useCallback, useEffect, useRef, useState } from 'react';

const NAME = 'vertice-facilitacion';

/**
 * Ventana separada de la Consola de Facilitación. Se abre desde la MISMA instancia React del host (VÉRTICE) y se
 * renderiza con un portal: comparte `world`, `MissionControls`, cuenta regresiva y callbacks; no crea otro MissionEngine,
 * ni otra ruta, ni otro host. `openOrFocus` (tecla D): si la ventana existe le da foco; si se cerró, la vuelve a abrir.
 */
export function useFacilitatorWindow() {
  const winRef = useRef<Window | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [blocked, setBlocked] = useState(false);

  const closed = useCallback(() => {
    winRef.current = null;
    setContainer(null);
  }, []);

  const openOrFocus = useCallback(() => {
    const existing = winRef.current;
    if (existing && !existing.closed) { existing.focus(); return; }
    const w = window.open('', NAME, 'popup=yes,width=540,height=940,left=40,top=40');
    if (!w) { setBlocked(true); return; } // ventanas emergentes bloqueadas
    setBlocked(false);
    winRef.current = w;
    w.document.title = 'VÉRTICE · Consola de facilitación';
    w.document.body.innerHTML = '';
    Object.assign(w.document.body.style, { margin: '0', background: '#F2F4F7' });
    const el = w.document.createElement('div');
    w.document.body.appendChild(el);
    w.addEventListener('pagehide', closed);
    setContainer(el);
    w.focus();
  }, [closed]);

  // Respaldo: detecta el cierre de la ventana aunque no llegue `pagehide`.
  useEffect(() => {
    const iv = setInterval(() => { if (winRef.current?.closed) closed(); }, 500);
    return () => clearInterval(iv);
  }, [closed]);

  // Si se cierra o recarga VÉRTICE, la consola se cierra con él.
  useEffect(() => {
    const h = () => { winRef.current?.close(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, []);

  const clearBlocked = useCallback(() => setBlocked(false), []);
  return { container, openOrFocus, blocked, clearBlocked };
}
