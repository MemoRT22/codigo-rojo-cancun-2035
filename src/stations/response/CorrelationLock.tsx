import { useState } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { LOCK_FIELDS, normalizeId, type LockKey } from './logic';

interface Props {
  paused: boolean;
  evidenceCount: number;
  /** true si el último envío fue rechazado por el Mission Engine. */
  rejected: boolean;
  onSubmit: (ids: Record<LockKey, string>) => void;
}

/** Candado de correlación: cuatro identificadores bajo categorías neutrales. Nada se autocompleta. */
export function CorrelationLock({ paused, evidenceCount, rejected, onSubmit }: Props) {
  const { theme: T } = useTheme();
  const [vals, setVals] = useState<Record<LockKey, string>>({ origin: '', identity: '', propagation: '', correlation: '' });
  const ready = LOCK_FIELDS.every((f) => vals[f.key].trim().length > 0) && !paused;
  const submit = () => { if (ready) onSubmit({ origin: normalizeId(vals.origin), identity: normalizeId(vals.identity), propagation: normalizeId(vals.propagation), correlation: normalizeId(vals.correlation) }); };

  return (
    <section
      className="animate-fade-in-up"
      aria-label="Candado de correlación"
      style={{ width: '100%', maxWidth: '44rem', margin: '0 auto', background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '1rem', boxShadow: `0 10px 36px ${T.SURFACE.shadow}`, padding: '2rem 2.25rem' }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: T.INK.secondary }}>CORRELACIÓN DE INCIDENTE</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 650, marginTop: '0.4rem', letterSpacing: '-0.01em' }}>Reconstruye la cadena del incidente</h1>
      <p style={{ fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.55, marginTop: '0.5rem' }}>
        Introduce el identificador que corresponde a cada eslabón. Revisa los identificadores que cada equipo agregó a la investigación.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ marginTop: '1.5rem' }}>
        {LOCK_FIELDS.map((f, i) => (
          <label key={f.key} className="flex items-center" style={{ gap: '1rem', padding: '0.5rem 0' }}>
            <span className="flex items-center justify-center shrink-0" aria-hidden style={{ width: 28, height: 28, borderRadius: 14, border: `1.5px solid ${T.INK.faint}`, fontSize: '0.8125rem', fontWeight: 650, color: T.INK.secondary }}>{i + 1}</span>
            <span style={{ width: '8.5rem', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary }}>{f.label}</span>
            <input
              value={vals[f.key]}
              onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              aria-label={f.label}
              placeholder="Identificador"
              autoComplete="off"
              spellCheck={false}
              style={{ flex: 1, minWidth: 0, padding: '0.7rem 0.9rem', borderRadius: '0.6rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, color: T.INK.primary, fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', outline: 'none' }}
            />
          </label>
        ))}

        <div aria-live="polite" style={{ minHeight: rejected ? undefined : 0 }}>
          {rejected && (
            <div className="animate-fade-in-up" style={{ marginTop: '1rem', padding: '0.85rem 1.1rem', borderRadius: '0.75rem', border: `1px solid ${T.INK.secondary}55`, background: `${T.INK.secondary}12` }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 620 }}>La correlación propuesta no puede validarse con la evidencia disponible.</div>
              <div style={{ fontSize: '0.9rem', color: T.INK.secondary, marginTop: '0.15rem' }}>Revisa origen, identidad, propagación y correlación antes de volver a enviar.</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: T.INK.secondary }}>Identificadores en la investigación: {evidenceCount} de 4</span>
          <button
            type="submit"
            disabled={!ready}
            style={{
              padding: '0.8rem 1.5rem', borderRadius: '0.7rem', fontSize: '0.9375rem', fontWeight: 660, cursor: ready ? 'pointer' : 'default',
              background: ready ? T.BRAND.blue : T.SURFACE.hairlineSoft, color: ready ? '#fff' : T.INK.secondary, border: `1px solid ${ready ? T.BRAND.blue : T.SURFACE.hairline}`,
              boxShadow: ready ? `0 4px 14px ${T.BRAND.blue}44` : 'none',
            }}
          >
            Validar correlación
          </button>
        </div>
      </form>
    </section>
  );
}
