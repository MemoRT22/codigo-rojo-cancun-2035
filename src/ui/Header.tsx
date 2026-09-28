import { BRAND, INK } from '../brand/tokens';
import { VerticeBrand } from '../brand/VerticeLogo';
import type { Metric, WorldView } from '../world/useWorld';
import { HEADER_H } from '../map/scene';

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

function Delta({ v, bad }: { v: number; bad: 'up' | 'down' }) {
  if (Math.abs(v) < 1) return null;
  const isBad = (v > 0 && bad === 'up') || (v < 0 && bad === 'down');
  return (
    <span style={{ fontSize: 16, fontWeight: 650, color: isBad ? '#C22B2B' : INK.tertiary, marginLeft: 8 }}>
      {v > 0 ? '▲' : '▼'}{compact(Math.abs(v))}
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

function Kpi({ label, value, unit, color = BRAND.navy, metric, bad = 'up' }: KpiProps) {
  return (
    <div style={{ width: 200, padding: '0 14px 0 18px', borderLeft: '1px solid #D8E0E9', height: 60 }}>
      <div style={{ fontSize: 14, fontWeight: 620, letterSpacing: '0.03em', color: INK.secondary, whiteSpace: 'nowrap' }}>{label}</div>
      <div className="flex items-baseline" style={{ marginTop: 4, whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 38, fontWeight: 620, color, lineHeight: 1, letterSpacing: '-0.01em' }}>{value}</span>
        {unit && <span style={{ fontSize: 18, fontWeight: 500, color: INK.tertiary, marginLeft: 3 }}>{unit}</span>}
        {metric && <Delta v={metric.delta} bad={bad} />}
      </div>
    </div>
  );
}

export function Header({ w }: { w: WorldView }) {
  const d = w.derived;
  const servicesColor = d.servicesUp === d.servicesTotal ? INK.primary : d.servicesUp <= 4 ? '#C22B2B' : '#A86A00';
  const nodesColor = d.nodesLinked === d.nodesTotal ? INK.primary : '#A86A00';
  const latColor = w.latency.value >= 60 ? '#C22B2B' : w.latency.value >= 30 ? '#A86A00' : INK.primary;
  const date = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2035, 8, 25)))
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <header className="absolute left-0 top-0" style={{ width: 1920, height: HEADER_H, background: 'linear-gradient(180deg, rgba(246,248,251,0.96) 0%, rgba(246,248,251,0.88) 62%, rgba(246,248,251,0) 100%)' }}>
      <div className="absolute" style={{ left: 48, top: 22 }}>
        <VerticeBrand size={46} />
      </div>

      <div className="absolute flex items-center" style={{ left: 336, top: 18 }}>
        <Kpi label="Usuarios conectados" value={String(w.users.value)} metric={w.users} bad="down" />
        <Kpi label="Sesiones activas" value={String(w.sessions.value)} metric={w.sessions} bad="up" />
        <Kpi label="Servicios operativos" value={String(d.servicesUp)} unit={`/${d.servicesTotal}`} color={servicesColor} />
        <Kpi label="Nodos enlazados" value={String(d.nodesLinked)} unit={`/${d.nodesTotal}`} color={nodesColor} />
        <Kpi label="Eventos por minuto" value={w.events.value.toLocaleString('es-MX')} metric={w.events} bad="up" />
        <Kpi label="Latencia" value={String(w.latency.value)} unit="ms" color={latColor} metric={w.latency} bad="up" />
      </div>

      <div className="absolute text-right" style={{ right: 48, top: 20 }}>
        <div style={{ fontSize: 44, fontWeight: 560, letterSpacing: '0.01em', lineHeight: 1, color: BRAND.navy }}>{w.time}</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: INK.secondary, marginTop: 7, letterSpacing: '0.02em' }}>
          {date}
        </div>
      </div>
    </header>
  );
}
