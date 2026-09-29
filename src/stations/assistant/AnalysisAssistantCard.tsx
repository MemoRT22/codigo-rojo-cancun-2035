import { useEffect, useRef } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconSpark } from '../shell/icons';
import type { AssistantAction, AssistantHint } from './types';

export interface AssistantCardProps {
  /** Recomendaciones ya mostradas, en orden. */
  shown: readonly AssistantHint[];
  /** Hay una recomendación disponible que el equipo aún no ha pedido. */
  pending: boolean;
  onRequest: () => void;
  onAction?: (action: AssistantAction) => void;
}

/**
 * VÉRTICE · Asistente de análisis. Tarjeta enterprise, no conversacional: aviso discreto, recomendaciones
 * curadas y acciones contextuales. Sin niveles numerados, puntos ni penalizaciones.
 */
export function AnalysisAssistantCard({ shown, pending, onRequest, onAction }: AssistantCardProps) {
  const { theme: T } = useTheme();
  const ref = useRef<HTMLElement>(null);
  const visible = shown.length > 0 || pending;

  // Cada aviso o recomendación nueva se trae a la vista: en la columna lateral la tarjeta puede quedar por debajo del pliegue.
  useEffect(() => {
    if (!visible) return;
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    ref.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }, [visible, shown.length, pending]);

  if (!visible) return null;

  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' };
  const last = shown[shown.length - 1];

  return (
    <section
      ref={ref}
      className="animate-fade-in-up"
      aria-label="Asistente de análisis"
      style={{
        background: T.SURFACE.card, border: `1px solid ${T.BRAND.blue}44`, borderRadius: '0.875rem',
        boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem',
      }}
    >
      <div className="flex items-center" style={{ gap: '0.5rem' }}>
        <IconSpark size={17} color={T.BRAND.blue} />
        <span style={{ ...label, color: T.BRAND.blue }}>VÉRTICE · Asistente de análisis</span>
      </div>

      {shown.map((h, i) => (
        <div
          key={h.id}
          className={i === shown.length - 1 ? 'animate-fade-in-up' : undefined}
          style={{ marginTop: '0.7rem', fontSize: '0.9375rem', lineHeight: 1.55, color: i === 0 ? T.INK.primary : T.INK.secondary }}
        >
          {h.lead && <span style={{ fontWeight: 650, color: T.INK.primary }}>{h.lead}:</span>} {h.text}
        </div>
      ))}

      {last?.actions && last.actions.length > 0 && onAction && (
        <div className="animate-fade-in-up" style={{ marginTop: '0.85rem' }}>
          <div style={{ ...label, fontSize: '0.6875rem', color: T.INK.secondary }}>Acción recomendada</div>
          <div className="flex flex-wrap" style={{ gap: '0.4rem', marginTop: '0.4rem' }}>
            {last.actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onAction(a)}
                style={{
                  padding: '0.35rem 0.8rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 620, cursor: 'pointer',
                  border: `1px solid ${T.BRAND.blue}66`, background: `${T.BRAND.blue}10`, color: T.BRAND.blue,
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {pending && (
        <div
          role="status"
          className="animate-fade-in-up flex items-center justify-between"
          style={{ gap: '0.75rem', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}
        >
          <span className="flex items-center" style={{ gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            <span className="animate-status" style={{ width: 9, height: 9, borderRadius: 5, background: T.BRAND.blue, display: 'inline-block', flexShrink: 0 }} />
            {shown.length === 0 ? 'Orientación disponible.' : 'Nueva recomendación de análisis disponible.'}
          </span>
          <button
            onClick={onRequest}
            className="shrink-0"
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '0.6rem', fontSize: '0.8125rem', fontWeight: 650, cursor: 'pointer',
              background: T.BRAND.blue, color: '#fff', border: `1px solid ${T.BRAND.blue}`,
            }}
          >
            {shown.length === 0 ? 'Ver orientación' : 'Profundizar análisis'}
          </button>
        </div>
      )}
    </section>
  );
}
