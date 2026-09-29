import { useTheme } from '../brand/ThemeContext';
import type { WorldView } from '../world/useWorld';
import type { Tone } from '../world/scenario';
import { severityOf } from './status';

export function StateBanner({ w }: { w: WorldView }) {
  const { theme: T } = useTheme();
  const TONE_COLOR: Record<Tone, string> = {
    ok: T.STATUS.ok,
    watch: T.mode === 'midnight' ? '#7090B8' : '#6E8FC9',
    warn: T.STATUS.warn,
    crit: T.STATUS.crit,
    recover: T.STATUS.recover,
  };
  const color = TONE_COLOR[w.spec.tone];
  const sev = severityOf(w.phase, T);
  const pulsing = w.phase !== 'normal' && w.phase !== 'contencion_exitosa';
  return (
    <div className="absolute" style={{ left: 48, top: 118 }}>
      <div className="absolute pointer-events-none" style={{ left: -48, top: -30, width: 820, height: 250, background: T.ui.fogBanner }} />
      <div className="flex items-center relative" style={{ gap: 16 }}>
        <span
          className={pulsing ? 'animate-status' : 'animate-gentle-pulse'}
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            background: color,
            boxShadow: `0 0 0 6px ${color}22, 0 0 20px ${color}18`,
          }}
        />
        <span key={w.spec.headline} className="animate-fade-in-up" style={{ fontSize: 38, fontWeight: 600, color: T.INK.primary, letterSpacing: '-0.012em', lineHeight: 1.05 }}>
          {w.spec.headline}
        </span>
      </div>
      <div className="flex items-center relative" style={{ marginTop: 10, marginLeft: 36, gap: 18 }}>
        <span key={w.subheadline} style={{ fontSize: 21, fontWeight: 460, color: T.INK.secondary }}>{w.subheadline}</span>
      </div>
      <div className="flex items-center relative" style={{ marginTop: 14, marginLeft: 36, gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 620, letterSpacing: '0.14em', color: T.INK.faint, textTransform: 'uppercase' }}>Severidad</span>
        <span style={{
          fontSize: 14, fontWeight: 620, color: T.INK.primary, padding: '4px 14px 4px 11px', borderRadius: 999,
          background: T.ui.sevBadgeBg, border: `1px solid ${sev.color}30`, boxShadow: `0 1px 4px ${sev.color}12`,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: sev.color }} />
          {sev.label}
        </span>
      </div>
    </div>
  );
}
