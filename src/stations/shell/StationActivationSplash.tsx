import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { VerticeIsotipo } from '../../brand/VerticeLogo';
import type { EventSource } from '../../mission/engine';
import type { StationPhase } from './types';

const SHOW_MS = 1900;
const FADE_MS = 500;

/**
 * Micro-momento de activación (~2 s): cuando VÉRTICE inicia la sesión EN VIVO, los puestos cambian juntos.
 * Es solo presentación local (ni MissionState ni un evento): se dispara cuando esta instancia estaba en WAITING y la
 * fase pasa a activa por un evento en vivo. Si el estado activo llega como replay del registro del host (la estación
 * se abrió o reconectó con la misión ya en curso), no se reproduce. Sin heurísticas de tiempo.
 */
export function useActivationSplash(phase: StationPhase, enabled: boolean, source: EventSource): boolean {
  const [show, setShow] = useState(false);
  const prev = useRef(phase);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  useEffect(() => {
    const was = prev.current;
    prev.current = phase;
    if (!enabled || was !== 'WAITING' || (phase !== 'ACTIVE' && phase !== 'EVIDENCE_FOUND')) return;
    if (sourceRef.current === 'live') setShow(true);
  }, [phase, enabled]);

  useEffect(() => {
    if (phase === 'WAITING') setShow(false);
  }, [phase]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), SHOW_MS + FADE_MS);
    return () => clearTimeout(t);
  }, [show]);

  return show;
}

export function StationActivationSplash({ roleTitle }: { roleTitle: string }) {
  const { theme: T } = useTheme();
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFading(true), SHOW_MS);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center text-center"
      style={{ zIndex: 80, background: T.SURFACE.page, opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease`, pointerEvents: fading ? 'none' : 'auto' }}
    >
      <div className="animate-fade-in-up"><VerticeIsotipo size={84} /></div>
      <div className="animate-fade-in-up" style={{ fontSize: '1.1rem', fontWeight: 620, letterSpacing: '0.3em', color: T.INK.secondary, marginTop: '1.4rem', animationDelay: '150ms' }}>VÉRTICE</div>
      <div className="animate-fade-in-up" style={{ fontSize: '2.6rem', fontWeight: 640, letterSpacing: '-0.01em', marginTop: '1rem', animationDelay: '350ms' }}>SESIÓN OPERATIVA ACTIVADA</div>
      <div className="animate-fade-in-up" style={{ fontSize: '1.35rem', fontWeight: 600, letterSpacing: '0.16em', color: T.BRAND.blue, marginTop: '1.1rem', textTransform: 'uppercase', animationDelay: '650ms' }}>{roleTitle}</div>
    </div>
  );
}
