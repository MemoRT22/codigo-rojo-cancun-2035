import { useTheme } from '../brand/ThemeContext';
import { ThemeToggle } from '../brand/ThemeToggle';
import { VerticeBrand } from '../brand/VerticeLogo';
import type { Metric, WorldView } from '../world/useWorld';
import { HEADER_H } from '../map/scene';

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

function Delta({ v, bad, faint, crit }: { v: number; bad: 'up' | 'down'; faint: string; crit: string }) {
  if (Math.abs(v) < 1) return null;
  const isBad = (v > 0 && bad === 'up') || (v < 0 && bad === 'down');
  return (
    <span style={{ fontSize: 14, fontWeight: 600, color: isBad ? crit : faint, marginLeft: 8 }}>
      {v > 0 ? '\u25B2' : '\u25BC'}{compact(Math.abs(v))}
    </span>
  );
}

interface KpiProps {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  metric?: Metric;
  bad?: 'up' | 'down';
}

export function Header({ w }: { w: WorldView }) {
  const { theme: T } = useTheme();
  const d = w.derived;
  const servicesColor = d.servicesUp === d.servicesTotal ? T.BRAND.navy : d.servicesUp <= 4 ? T.STATUS_TEXT.crit : T.STATUS_TEXT.warn;
  const nodesColor = d.nodesLinked === d.nodesTotal ? T.BRAND.navy : T.STATUS_TEXT.warn;
  const latColor = w.latency.value >= 60 ? T.STATUS_TEXT.crit : w.latency.value >= 30 ? T.STATUS_TEXT.warn : T.BRAND.navy;
  // Fecha de la ficción (25 de septiembre de 2035), en formato compacto para no competir con el selector de tema.
  const dp = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .formatToParts(new Date(Date.UTC(2035, 8, 25)));
  const part = (t: string) => (dp.find((x) => x.type === t)?.value ?? '').replace('.', '');
  const date = `${part('weekday').replace(/^./, (c) => c.toUpperCase())} ${part('day')} ${part('month')} ${part('year')}`;

  function Kpi({ label, value, unit, color = T.BRAND.navy, metric, bad = 'up' }: KpiProps) {
    return (
      <div style={{ width: 204, padding: '0 16px 0 20px', borderLeft: `1px solid ${T.SURFACE.hairline}`, height: 58 }}>
        <div style={{ fontSize: 12, fontWeight: 580, letterSpacing: '0.06em', color: T.INK.tertiary, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</div>
        <div className="flex items-baseline" style={{ marginTop: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 36, fontWeight: 580, color, lineHeight: 1, letterSpacing: '-0.015em' }}>{value}</span>
          {unit && <span style={{ fontSize: 16, fontWeight: 480, color: T.INK.faint, marginLeft: 3 }}>{unit}</span>}
          {metric && <Delta v={metric.delta} bad={bad} faint={T.INK.faint} crit={T.STATUS_TEXT.crit} />}
        </div>
      </div>
    );
  }

  return (
    <header className="absolute left-0 top-0" style={{ width: 1920, height: HEADER_H, background: T.ui.headerGrad }}>
      <div className="absolute" style={{ left: 48, top: 22 }}>
        <VerticeBrand size={46} />
      </div>
      <div className="absolute flex items-center" style={{ left: 340, top: 18 }}>
        <Kpi label="Usuarios conectados" value={String(w.users.value)} metric={w.users} bad="down" />
        <Kpi label="Sesiones activas" value={String(w.sessions.value)} metric={w.sessions} bad="up" />
        <Kpi label="Servicios operativos" value={String(d.servicesUp)} unit={`/${d.servicesTotal}`} color={servicesColor} />
        <Kpi label="Nodos enlazados" value={String(d.nodesLinked)} unit={`/${d.nodesTotal}`} color={nodesColor} />
        <Kpi label="Eventos por minuto" value={w.events.value.toLocaleString('es-MX')} metric={w.events} bad="up" />
        <Kpi label="Latencia" value={String(w.latency.value)} unit="ms" color={latColor} metric={w.latency} bad="up" />
      </div>
      <div className="absolute" style={{ right: 40, top: 26 }}>
        <ThemeToggle />
      </div>
      <div className="absolute text-right" style={{ right: 120, top: 20 }}>
        <div style={{ fontSize: 42, fontWeight: 520, letterSpacing: '0.01em', lineHeight: 1, color: T.BRAND.navy }}>{w.time}</div>
        <div style={{ fontSize: 14, fontWeight: 560, color: T.INK.tertiary, marginTop: 8, letterSpacing: '0.03em' }}>
          {date}
        </div>
      </div>
    </header>
  );
}
