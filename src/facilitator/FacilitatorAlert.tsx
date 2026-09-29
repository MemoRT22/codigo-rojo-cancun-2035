import { useTheme } from '../brand/ThemeContext';
import type { SystemEvent } from '../types';

export interface AlertData { id: number; level: SystemEvent['level']; message: string }

export const ALERT_LABEL: Record<SystemEvent['level'], string> = {
  info: 'INFORMACIÓN',
  warning: 'ADVERTENCIA',
  critical: 'CRÍTICA',
  recovery: 'RECUPERACIÓN',
};

/** Alerta de VÉRTICE lanzada por el facilitador: aparece sobre el mundo sin modal, sin sirena y sin tapar el diseño. Texto plano. */
export function FacilitatorAlert({ alert }: { alert: AlertData | null }) {
  const { theme: T } = useTheme();
  if (!alert) return null;
  const color = alert.level === 'info' ? T.STATUS.info : alert.level === 'warning' ? T.STATUS.warn : alert.level === 'critical' ? T.STATUS.crit : T.STATUS.recover;
  return (
    <div className="absolute" style={{ left: '50%', bottom: 138, transform: 'translateX(-50%)', zIndex: 70, pointerEvents: 'none' }}>
      <div
        key={alert.id}
        role="alert"
        className="animate-fade-in-up"
        style={{ minWidth: 640, maxWidth: 1000, padding: '18px 30px 20px', borderRadius: 16, background: T.SURFACE.card, border: `2px solid ${color}66`, boxShadow: `0 14px 44px ${T.SURFACE.shadow}, 0 0 0 6px ${color}14` }}
      >
        <div className="flex items-center" style={{ gap: 12, fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color }}>
          <span className="animate-status" style={{ width: 14, height: 14, borderRadius: 7, background: color }} />
          {ALERT_LABEL[alert.level]}
        </div>
        <div style={{ fontSize: 34, fontWeight: 560, lineHeight: 1.25, marginTop: 8, color: T.INK.primary }}>{alert.message}</div>
      </div>
    </div>
  );
}
