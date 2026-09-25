import { useState, useEffect } from 'react';
import type { SeverityLevel, DomainState } from '../types';

interface Props {
  headline: string;
  subheadline?: string;
  severity: SeverityLevel;
  sync: number;
  accentColor: 'teal' | 'amber' | 'red';
  baseTime: string;
  countdownDisplay: string;
  countdownRunning: boolean;
  countdownVisible: boolean;
  domains: DomainState[];
}

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  'NORMAL':   '#2a8a8a',
  'BAJO':     '#d4913a',
  'MODERADO': '#e67e22',
  'ALTO':     '#e74c3c',
  'CRÍTICO':  '#c0392b',
};

function parseTime(t: string): number {
  const parts = t.split(':');
  return (parseInt(parts[0] ?? '0') * 3600) + (parseInt(parts[1] ?? '0') * 60) + (parseInt(parts[2] ?? '0'));
}

function SimulatedClock({ baseTime }: { baseTime: string }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    setOffset(0);
    const iv = setInterval(() => setOffset((o) => o + 1), 1000);
    return () => clearInterval(iv);
  }, [baseTime]);

  const totalSec = parseTime(baseTime) + offset;
  const h = Math.floor(totalSec / 3600) % 24;
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return <>{`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}</>;
}

export function SystemOverlay({
  headline, subheadline, severity, sync,
  baseTime, countdownDisplay, countdownRunning, countdownVisible, domains,
}: Props) {
  const sevColor = SEVERITY_COLORS[severity];
  const isNormal = severity === 'NORMAL';
  const isCritical = severity === 'ALTO' || severity === 'CRÍTICO';

  return (
    <>
      {/* ─── Top-left: Brand + Status ─── */}
      <div className="absolute top-8 left-10 z-10">
        <div className="text-[28px] font-light tracking-[0.35em] text-white/90 leading-none">
          VÉRTICE
        </div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-white/30 mt-1">
          Centro de Operaciones
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${isCritical ? 'animate-status-flash' : ''}`}
            style={{ backgroundColor: sevColor }}
          />
          <span
            className="text-[24px] font-medium tracking-[0.1em] transition-colors duration-700"
            style={{ color: sevColor }}
          >
            {headline}
          </span>
        </div>
        {subheadline && (
          <div className="text-[16px] text-white/40 mt-1.5 ml-5 tracking-wide">
            {subheadline}
          </div>
        )}
      </div>

      {/* ─── Top-right: System time + Sync ─── */}
      <div className="absolute top-8 right-10 z-10 text-right">
        <div className="text-[32px] font-mono font-extralight text-white/70 tracking-[0.1em] leading-none">
          <SimulatedClock baseTime={baseTime} />
        </div>
        <div className="text-[10px] font-mono text-white/25 mt-1 tracking-wider">
          25 SEP 2035 — CANCÚN
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/25">
            Sincronización
          </span>
          <span
            className="text-[14px] font-mono transition-colors duration-700"
            style={{ color: sync > 97 ? '#2a8a8a88' : sync > 93 ? '#d4913a88' : '#c0392b88' }}
          >
            {sync.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ─── Bottom-left: Domain status (minimal) ─── */}
      <div className="absolute bottom-8 left-10 z-10 space-y-1.5">
        {domains.map((d) => {
          const isOp = d.status === 'OPERATIVO' || d.status === 'ESTABLE';
          const col = isOp ? '#ffffff18' : sevColor;
          return (
            <div key={d.id} className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${!isOp && isCritical ? 'animate-status-flash' : ''}`}
                style={{ backgroundColor: isOp ? '#ffffff15' : col }}
              />
              <span
                className="text-[11px] tracking-[0.06em] transition-colors duration-500"
                style={{ color: isOp ? '#ffffff30' : col + 'cc' }}
              >
                {d.label}
              </span>
              {!isOp && (
                <span
                  className="text-[9px] font-mono tracking-wider"
                  style={{ color: col + '99' }}
                >
                  {d.status}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Countdown (when visible) ─── */}
      {countdownVisible && (
        <div className="absolute bottom-8 right-10 z-10 text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 mb-1">
            Tiempo de Respuesta
          </div>
          <div
            className={`text-[56px] font-mono font-extralight tracking-[0.12em] leading-none transition-colors duration-500 ${
              countdownRunning ? 'text-white/80' : 'text-white/30'
            }`}
          >
            {countdownDisplay}
          </div>
          {!countdownRunning && countdownDisplay !== '00:00' && (
            <div className="text-[10px] uppercase tracking-[0.15em] text-white/15 mt-1">
              Detenido
            </div>
          )}
          {countdownDisplay === '00:00' && (
            <div className="text-[10px] uppercase tracking-[0.15em] text-[#c0392b88] mt-1">
              Tiempo agotado
            </div>
          )}
        </div>
      )}

      {/* ─── Severity badge (bottom center, when not normal) ─── */}
      {!isNormal && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
              Severidad
            </span>
            <span
              className={`text-[13px] font-mono tracking-[0.12em] ${isCritical ? 'animate-status-flash' : ''}`}
              style={{ color: sevColor }}
            >
              {severity}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
