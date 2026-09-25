import type { SeverityLevel } from '../types';

const SEVERITY_CONFIG: Record<SeverityLevel, { color: string; bg: string; pulse: boolean }> = {
  'NORMAL':   { color: '#2a8a8a', bg: '#2a8a8a15', pulse: false },
  'BAJO':     { color: '#d4913a', bg: '#d4913a15', pulse: false },
  'MODERADO': { color: '#e67e22', bg: '#e67e2215', pulse: false },
  'ALTO':     { color: '#e74c3c', bg: '#e74c3c15', pulse: true },
  'CRÍTICO':  { color: '#c0392b', bg: '#c0392b20', pulse: true },
};

interface Props {
  severity: SeverityLevel;
  sync: number;
}

export function StatusPanel({ severity, sync }: Props) {
  const cfg = SEVERITY_CONFIG[severity];

  return (
    <div className="space-y-4">
      {/* Severity */}
      <div className="rounded-lg border p-4"
        style={{ borderColor: cfg.color + '40', backgroundColor: cfg.bg }}>
        <div className="text-[10px] uppercase tracking-[0.15em] mb-2"
          style={{ color: '#6b7f95' }}>
          Severidad
        </div>
        <div
          className={`text-lg font-semibold font-mono tracking-wider ${cfg.pulse ? 'animate-status-flash' : ''}`}
          style={{ color: cfg.color }}
        >
          {severity}
        </div>
      </div>

      {/* Sync */}
      <div className="rounded-lg border border-vertice-border bg-vertice-panel p-4">
        <div className="text-[10px] uppercase tracking-[0.15em] mb-2 text-vertice-text-muted">
          Sincronización
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-mono font-light text-vertice-text-bright">
            {sync.toFixed(1)}
          </span>
          <span className="text-sm font-mono text-vertice-text-muted mb-0.5">%</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-vertice-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${sync}%`,
              backgroundColor: sync > 97 ? '#2a8a8a' : sync > 93 ? '#d4913a' : '#c0392b',
            }}
          />
        </div>
      </div>

      {/* Simulated time */}
      <div className="rounded-lg border border-vertice-border bg-vertice-panel p-4">
        <div className="text-[10px] uppercase tracking-[0.15em] mb-2 text-vertice-text-muted">
          Hora del Sistema
        </div>
        <div className="text-xl font-mono font-light text-vertice-text-bright">
          <SimulatedClock />
        </div>
        <div className="text-[10px] font-mono text-vertice-text-muted mt-1">
          25 SEP 2035 — CANCÚN
        </div>
      </div>
    </div>
  );
}

function SimulatedClock() {
  // Static simulated time that looks like the incident window
  return <span>09:21:47</span>;
}
