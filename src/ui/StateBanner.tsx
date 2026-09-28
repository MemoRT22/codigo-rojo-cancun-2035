import { INK, STATUS } from '../brand/tokens';
import type { WorldView } from '../world/useWorld';
import type { Tone } from '../world/scenario';
import { severityOf } from './status';

const TONE_COLOR: Record<Tone, string> = {
  ok: STATUS.ok,
  watch: '#6E8FC9',
  warn: STATUS.warn,
  crit: STATUS.crit,
  recover: STATUS.recover,
};

/** Estado de la plataforma: titular canónico + subtítulo. El territorio sigue siendo protagonista. */
export function StateBanner({ w }: { w: WorldView }) {
  const color = TONE_COLOR[w.spec.tone];
  const sev = severityOf(w.phase);
  const pulsing = w.phase !== 'normal' && w.phase !== 'contencion_exitosa';
  return (
    <div className="absolute" style={{ left: 48, top: 118 }}>
      <div className="absolute pointer-events-none" style={{ left: -48, top: -30, width: 820, height: 250, background: 'radial-gradient(ellipse at 20% 40%, rgba(246,248,251,0.92) 0%, rgba(246,248,251,0.75) 45%, rgba(246,248,251,0) 75%)' }} />
      <div className="flex items-center relative" style={{ gap: 14 }}>
        <span className={pulsing ? 'animate-status' : ''} style={{ width: 16, height: 16, borderRadius: 8, background: color, boxShadow: `0 0 0 6px ${color}26` }} />
        <span key={w.spec.headline} className="animate-fade-in-up" style={{ fontSize: 40, fontWeight: 640, color: INK.primary, letterSpacing: '-0.012em', lineHeight: 1.05 }}>
          {w.spec.headline}
        </span>
      </div>
      <div className="flex items-center relative" style={{ marginTop: 10, marginLeft: 30, gap: 18 }}>
        <span key={w.subheadline} style={{ fontSize: 22, fontWeight: 500, color: INK.secondary }}>{w.subheadline}</span>
      </div>
      <div className="flex items-center relative" style={{ marginTop: 14, marginLeft: 30, gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 650, letterSpacing: '0.14em', color: INK.tertiary }}>SEVERIDAD</span>
        <span style={{ fontSize: 15, fontWeight: 650, color: INK.primary, padding: '3px 12px 3px 10px', borderRadius: 999, background: '#fff', border: '1px solid #D8E0E9', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: 5, background: sev.color }} />
          {sev.label}
        </span>
      </div>
    </div>
  );
}
