import { useEffect, type ReactNode } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { VerticeIsotipo } from '../../brand/VerticeLogo';
import { ThemeToggle } from '../../brand/ThemeToggle';
import type { StationPhase } from './types';

interface Props {
  /** Nombre del módulo visible (ej. «Comunicaciones»). */
  moduleName: string;
  moduleSubtitle: string;
  phase: StationPhase;
  paused?: boolean;
  /** Barra de herramientas bajo la cabecera (búsqueda, filtros…). */
  toolbar?: ReactNode;
  children: ReactNode;
  /** Controles ocultos de desarrollo (?dev=true). */
  dev?: ReactNode;
}

/**
 * Marco común de las estaciones: identidad VÉRTICE, estado de estación y de sincronización.
 * Escala con el ancho de pantalla (1920×1080 primero, usable en 1366×768) y usa los tokens del tema
 * DAY/MIDNIGHT: no define colores propios.
 */
export function StationShell({ moduleName, moduleSubtitle, phase, paused, toolbar, children, dev }: Props) {
  const { theme: T } = useTheme();

  useEffect(() => {
    document.body.classList.add('station-mode');
    const prevTitle = document.title;
    document.title = `VÉRTICE — ${moduleName}`;
    const prev = document.documentElement.style.fontSize;
    // 16 px a 1920 de ancho; nunca menos de 14 px (1366×768).
    document.documentElement.style.fontSize = 'clamp(14px, 0.8334vw, 22px)';
    return () => {
      document.body.classList.remove('station-mode');
      document.title = prevTitle;
      document.documentElement.style.fontSize = prev;
    };
  }, [moduleName]);

  const chip = stateChip(phase, paused);
  const dotColor = chip.tone === 'ok' ? T.STATUS.ok : chip.tone === 'info' ? T.STATUS.info : chip.tone === 'warn' ? T.STATUS.warn : T.INK.faint;
  const sync = syncChip(phase, paused);
  const syncColor = sync.live ? T.STATUS.ok : T.INK.faint;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: T.SURFACE.page, color: T.INK.primary, transition: 'background .6s ease' }}
    >
      <header
        className="flex items-center justify-between shrink-0"
        style={{ height: '4.5rem', padding: '0 2rem', borderBottom: `1px solid ${T.SURFACE.hairline}`, background: T.ui.cardBg }}
      >
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <VerticeIsotipo size={40} />
          <div style={{ lineHeight: 1 }}>
            <div className="flex items-baseline" style={{ gap: '0.75rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 620, letterSpacing: '0.18em', color: T.INK.primary }}>VÉRTICE</span>
              <span style={{ width: 1, height: '1rem', background: T.SURFACE.hairline, alignSelf: 'center' }} />
              <span style={{ fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.005em', color: T.INK.primary }}>{moduleName}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: T.INK.secondary, marginTop: '0.4rem', letterSpacing: '0.02em' }}>
              {moduleSubtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <span
            className="inline-flex items-center"
            style={{ gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: 999, border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.card, fontSize: '0.875rem', fontWeight: 600, color: T.INK.primary }}
          >
            <span className={chip.tone === 'ok' ? 'animate-status' : ''} style={{ width: 9, height: 9, borderRadius: 5, background: dotColor }} />
            {chip.label}
          </span>
          <span
            className="inline-flex items-center"
            style={{ gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: 999, background: 'transparent', fontSize: '0.875rem', fontWeight: 560, color: T.INK.secondary }}
          >
            <SyncIcon color={syncColor} />
            {sync.label}
          </span>
          <ThemeToggle />
        </div>
      </header>

      {toolbar}

      <main className="flex-1 min-h-0">{children}</main>
      {dev}
    </div>
  );
}

function stateChip(phase: StationPhase, paused?: boolean): { label: string; tone: 'ok' | 'info' | 'warn' | 'idle' } {
  if (paused) return { label: 'Sesión en pausa', tone: 'warn' };
  switch (phase) {
    case 'WAITING': return { label: 'Estación preparada', tone: 'idle' };
    case 'ACTIVE': return { label: 'Sesión activa', tone: 'ok' };
    case 'EVIDENCE_FOUND': return { label: 'Evidencia registrada', tone: 'info' };
    case 'MISSION_FINISHED': return { label: 'Sesión finalizada', tone: 'idle' };
  }
}

function syncChip(phase: StationPhase, paused?: boolean): { label: string; live: boolean } {
  if (phase === 'WAITING') return { label: 'En espera', live: false };
  if (phase === 'MISSION_FINISHED') return { label: 'Archivado', live: false };
  return paused ? { label: 'Pausado', live: false } : { label: 'Sincronizado', live: true };
}

function SyncIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 0 1 13.66-5.66L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.66 5.66L4 15.3M4 20v-4.7h4.7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
