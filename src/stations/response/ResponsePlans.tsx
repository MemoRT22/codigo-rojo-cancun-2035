import { useTheme } from '../../brand/ThemeContext';
import type { ResponsePlan } from '../../mission/types';
import { PLANS, PLAN_MAP, type PlanInfo } from './logic';

const label = (c: string): React.CSSProperties => ({ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: c, textTransform: 'uppercase' });

/** Lista de planes: los cuatro con exactamente el mismo peso visual. */
export function PlanGrid({ reviewing, disabled, onReview }: { reviewing: ResponsePlan | null; disabled: boolean; onReview: (id: ResponsePlan) => void }) {
  const { theme: T } = useTheme();
  return (
    <div id="resp-plans" role="listbox" aria-label="Planes de respuesta" className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.9rem', borderRadius: '0.9rem' }}>
      {PLANS.map((p, i) => {
        const on = p.id === reviewing;
        return (
          <button
            key={p.id}
            role="option"
            aria-selected={on}
            disabled={disabled}
            onClick={() => onReview(p.id)}
            className="text-left animate-fade-in-up"
            style={{
              animationDelay: `${i * 90}ms`, padding: '1.1rem 1.25rem', borderRadius: '0.9rem', cursor: disabled ? 'default' : 'pointer',
              background: T.SURFACE.card, color: T.INK.primary, border: `1.5px solid ${on ? T.BRAND.blue : T.SURFACE.hairline}`,
              boxShadow: on ? `0 0 0 3px ${T.BRAND.blue}22` : `0 4px 16px ${T.SURFACE.shadow}`, transition: 'border-color .15s, box-shadow .15s',
            }}
          >
            <div style={label(T.INK.secondary)}>Plan {p.id}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 650, marginTop: '0.3rem' }}>{p.title}</div>
            <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.5, marginTop: '0.5rem' }}>{p.summary}</div>
          </button>
        );
      })}
    </div>
  );
}

/** Comparación del plan revisado: qué contiene, qué deja activo, qué interrumpe y qué riesgo residual conserva. */
export function PlanDetail({ plan, children }: { plan: PlanInfo; children: React.ReactNode }) {
  const { theme: T } = useTheme();
  const rows: [string, React.ReactNode][] = [
    ['Qué contiene', <ul key="c" style={{ paddingLeft: '1.1rem' }}>{plan.contains.map((c) => <li key={c}>{c}</li>)}</ul>],
    ['Qué deja activo', plan.stays],
    ['Qué interrumpe', plan.interrupts],
    ['Riesgo residual', plan.residual],
  ];
  return (
    <section key={plan.id} className="animate-fade-in-up" aria-label={`Plan ${plan.id}`} style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.9rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.25rem 1.5rem' }}>
      {children}
      <dl style={{ display: 'grid', gridTemplateColumns: '10rem 1fr', rowGap: '0.75rem', columnGap: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.5, marginTop: '1rem' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt style={label(T.INK.secondary)}>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export const planName = (id: ResponsePlan) => `${id} — ${PLAN_MAP.get(id)?.title.toUpperCase()}`;
