import { useTheme } from '../../brand/ThemeContext';
import type { ResponsePlan } from '../../mission/types';
import { OUTCOMES, type OutcomeRow } from './logic';
import { planName } from './ResponsePlans';

export function OutcomePanel({ plan }: { plan: ResponsePlan }) {
  const { theme: T } = useTheme();
  const o = OUTCOMES[plan];
  const tone = (t: OutcomeRow['tone']) => (t === 'ok' ? T.STATUS.ok : t === 'warn' ? T.STATUS.warn : t === 'crit' ? T.STATUS.crit : T.INK.secondary);
  const contained = plan === 'DELTA';

  return (
    <section aria-label="Consecuencias operativas" className="animate-fade-in-up" style={{ width: '100%', maxWidth: '50rem', margin: '0 auto', background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '1rem', boxShadow: `0 10px 36px ${T.SURFACE.shadow}`, padding: '2rem 2.25rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', color: T.INK.secondary }}>RESPUESTA EJECUTADA · PLAN {planName(plan)}</div>
      <h1 style={{ fontSize: '1.7rem', fontWeight: 650, marginTop: '0.4rem', letterSpacing: '-0.01em', color: contained ? T.STATUS.recover : T.INK.primary }}>{o.banner}</h1>
      {o.sub && <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{o.sub}</div>}

      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, marginTop: '1.5rem' }}>CONSECUENCIAS OPERATIVAS</div>
      <ul style={{ listStyle: 'none', marginTop: '0.5rem' }}>
        {o.rows.map((r, i) => (
          <li key={r.label} className="animate-fade-in-up flex items-center justify-between" style={{ animationDelay: `${300 + i * 260}ms`, gap: '1rem', padding: '0.7rem 0', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
            <span style={{ fontSize: '1rem', fontWeight: 560 }}>{r.label}</span>
            <span className="flex items-center" style={{ gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.06em' }}>
              {r.steps.map((s, k) => (
                <span key={s} className="flex items-center" style={{ gap: '0.5rem', color: k === r.steps.length - 1 ? tone(r.tone) : T.INK.secondary }}>
                  {k > 0 && <span aria-hidden style={{ color: T.INK.faint }}>→</span>}
                  {s}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <p className="animate-fade-in-up" style={{ animationDelay: `${300 + o.rows.length * 260}ms`, marginTop: '1.25rem', fontSize: '1rem', lineHeight: 1.55 }}>{o.message}</p>
      {o.closing && <p className="animate-fade-in-up" style={{ animationDelay: `${500 + o.rows.length * 260}ms`, marginTop: '0.6rem', fontSize: '0.9375rem', color: T.INK.secondary }}>{o.closing}</p>}
    </section>
  );
}
