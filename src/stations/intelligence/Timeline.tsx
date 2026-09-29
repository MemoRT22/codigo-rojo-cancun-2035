import { useTheme } from '../../brand/ThemeContext';
import { TIMELINE } from './data';
import type { Group } from './types';

/**
 * Cronología del incidente: la misma para todas las agrupaciones. Las señales de la agrupación abierta se resaltan
 * (mismo azul para todas); el resto queda atenuado pero legible, para poder comparar el orden de los hechos.
 */
export function Timeline({ group }: { group: Group | null }) {
  const { theme: T } = useTheme();
  const lit = new Set(group?.signals ?? []);
  return (
    <section
      id="intel-timeline"
      aria-label="Cronología del incidente"
      style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem' }}
    >
      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' }}>Cronología del incidente</div>
      <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.3rem' }}>
        {group ? `Señales de ${group.id} resaltadas.` : 'Abre una agrupación para resaltar sus señales.'}
      </div>
      <ol style={{ listStyle: 'none', marginTop: '0.8rem', position: 'relative' }}>
        <span style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 2, background: T.SURFACE.hairline }} />
        {TIMELINE.map((e) => {
          const on = lit.has(e.id);
          return (
            <li key={e.id} className="flex items-start" style={{ gap: '0.75rem', padding: '0.32rem 0', position: 'relative', opacity: group && !on ? 0.55 : 1, transition: 'opacity .2s' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, flexShrink: 0, zIndex: 1, background: on ? T.BRAND.blue : T.SURFACE.card, border: `2px solid ${on ? T.BRAND.blue : T.INK.faint}` }} />
              <div className="min-w-0">
                <div style={{ fontSize: '0.8125rem', fontWeight: 650, color: on ? T.BRAND.blue : T.INK.secondary }}>{e.time}{e.ref ? <span style={{ fontWeight: 560 }}> · {e.ref}</span> : null}</div>
                <div style={{ fontSize: '0.875rem', lineHeight: 1.35, fontWeight: on ? 600 : 480 }}>{e.label}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
