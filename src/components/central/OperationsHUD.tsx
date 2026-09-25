import { useState, useEffect } from 'react';
import type { SeverityLevel, DomainState, SystemEvent } from '../../types';
import type { TelemetrySnapshot } from '../../hooks/useTelemetry';
import { VerticeBrand } from '../../brand/VerticeLogo';
import { DOMAIN_ICONS } from '../../brand/DomainIcons';
import { CORP, DOMAINS, SEVERITY } from '../../brand/tokens';
import { TelemetryPanel } from './TelemetryPanel';

interface Props {
  headline: string;
  subheadline?: string;
  severity: SeverityLevel;
  sync: number;
  baseTime: string;
  domains: DomainState[];
  events: SystemEvent[];
  countdownDisplay: string;
  countdownRunning: boolean;
  countdownVisible: boolean;
  telemetry: TelemetrySnapshot;
  isEscalating: boolean;
}

function parseTimeToSec(t: string): number {
  const p = t.split(':');
  return (parseInt(p[0] ?? '0') * 3600) + (parseInt(p[1] ?? '0') * 60) + parseInt(p[2] ?? '0');
}

function SimulatedClock({ baseTime }: { baseTime: string }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    setOffset(0);
    const iv = setInterval(() => setOffset((o) => o + 1), 1000);
    return () => clearInterval(iv);
  }, [baseTime]);
  const total = parseTimeToSec(baseTime) + offset;
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return <>{`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}</>;
}

export function OperationsHUD({
  headline, subheadline, severity, sync, baseTime,
  domains, events,
  countdownDisplay, countdownRunning, countdownVisible,
  telemetry, isEscalating,
}: Props) {
  const isCritical = severity === 'ALTO' || severity === 'CRÍTICO';
  const sevColor = severity === 'NORMAL' ? CORP.verticeBlue
    : severity === 'BAJO' ? SEVERITY.warning
    : severity === 'MODERADO' ? SEVERITY.warning
    : SEVERITY.critical;

  const visibleEvents = events.slice(-6);

  return (
    <>
      {/* ── Top-left: Brand ── */}
      <div className="absolute top-7 left-8 z-10">
        <VerticeBrand />
        <div className="mt-4 flex items-center gap-2">
          <div className="text-[10px] tracking-[0.16em] uppercase font-medium" style={{ color: CORP.textTertiary }}>
            Centro de Operaciones &middot; Cancún
          </div>
        </div>
      </div>

      {/* ── Top-right: Clock + metadata ── */}
      <div className="absolute top-7 right-8 z-10 text-right">
        <div className="font-mono font-light tracking-[0.06em] leading-none" style={{ fontSize: '34px', color: CORP.textPrimary }}>
          <SimulatedClock baseTime={baseTime} />
        </div>
        <div className="text-[10px] font-mono tracking-wider mt-1.5 font-medium" style={{ color: CORP.textTertiary }}>
          25 SEP 2035 — CANCÚN
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-[10px] tracking-[0.1em] uppercase font-medium" style={{ color: CORP.textTertiary }}>
            Red Urbana
          </span>
          <span className="text-[12px] font-mono font-medium" style={{
            color: sync > 97 ? CORP.caribeCyan
              : sync > 93 ? SEVERITY.warning
              : SEVERITY.critical,
          }}>
            {sync.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* ── Headline (below brand) ── */}
      <div className="absolute top-[108px] left-8 z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${isCritical ? 'animate-status-flash' : ''}`}
            style={{ backgroundColor: sevColor }}
          />
          <span
            className="font-semibold tracking-[0.06em] transition-colors duration-700"
            style={{ fontSize: '24px', color: sevColor }}
          >
            {headline}
          </span>
        </div>
        {subheadline && (
          <div className="mt-1.5 ml-[22px] tracking-wide" style={{ fontSize: '14px', color: CORP.textSecondary }}>
            {subheadline}
          </div>
        )}
      </div>

      {/* ── Severity indicator — top-center ── */}
      {severity !== 'NORMAL' && (
        <div className="absolute top-7 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-[0.18em] font-medium" style={{ color: CORP.textTertiary }}>
            Severidad
          </span>
          <span
            className={`text-[13px] font-mono font-medium tracking-[0.08em] ${isCritical ? 'animate-status-flash' : ''}`}
            style={{ color: sevColor }}
          >
            {severity}
          </span>
        </div>
      )}

      {/* ── Left panel: Telemetry ── */}
      <div className="absolute top-[165px] left-8 z-10">
        <TelemetryPanel telemetry={telemetry} isEscalating={isEscalating} />
      </div>

      {/* ── Domain legend — bottom-left ── */}
      <div className="absolute bottom-7 left-8 z-10">
        <div className="text-[9px] uppercase tracking-[0.18em] mb-3 font-medium" style={{ color: CORP.textTertiary }}>
          Dominios del Sistema
        </div>
        <div className="grid grid-cols-3 gap-x-5 gap-y-2">
          {DOMAINS.map((dt) => {
            const state = domains.find((d) => d.id === dt.id);
            const isOp = !state || state.status === 'OPERATIVO' || state.status === 'ESTABLE';
            const isOff = state && (state.status === 'AISLADO' || state.status === 'FUERA DE SERVICIO' || state.status === 'REVOCADA');
            const Icon = DOMAIN_ICONS[dt.id];

            const statusColor = isOff ? SEVERITY.offline
              : !isOp ? (state!.status === 'ADVERTENCIA' || state!.status === 'ALERTA' ? SEVERITY.warning : SEVERITY.critical)
              : undefined;

            return (
              <div key={dt.id} className="flex items-center gap-1.5">
                {Icon && <Icon size={14} color={isOff ? SEVERITY.offline : dt.color} />}
                <span className="text-[11px] font-medium tracking-[0.02em]" style={{ color: isOff ? SEVERITY.offline : dt.color }}>
                  {dt.label}
                </span>
                {!isOp && (
                  <span
                    className={`text-[8px] font-mono font-medium tracking-wider ml-1 ${!isOff ? 'animate-status-flash' : ''}`}
                    style={{ color: statusColor }}
                  >
                    {state!.status}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Countdown — bottom-right ── */}
      {countdownVisible && (
        <div className="absolute bottom-7 right-8 z-10 text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] mb-1 font-medium" style={{ color: CORP.textTertiary }}>
            Tiempo de Respuesta
          </div>
          <div
            className="font-mono font-light tracking-[0.08em] leading-none transition-colors duration-500"
            style={{
              fontSize: '60px',
              color: countdownRunning ? CORP.textPrimary : CORP.textTertiary,
            }}
          >
            {countdownDisplay}
          </div>
        </div>
      )}

      {/* ── Activity feed — right side ── */}
      <div className="absolute right-8 top-[140px] z-10 w-[300px]">
        <div className="text-[9px] uppercase tracking-[0.18em] mb-3 font-medium" style={{ color: CORP.textTertiary }}>
          Actividad Reciente
        </div>
        <div className="space-y-2.5">
          {visibleEvents.map((ev, i) => {
            const age = visibleEvents.length - i;
            const fadeAlpha = Math.max(0.4, 1 - (age - 1) * 0.12);
            const levelColor = ev.level === 'critical' ? SEVERITY.critical
              : ev.level === 'warning' ? SEVERITY.warning
              : CORP.textSecondary;
            const dotColor = ev.level === 'critical' ? SEVERITY.critical
              : ev.level === 'warning' ? SEVERITY.warning
              : CORP.caribeCyan;

            return (
              <div key={ev.id} className="animate-fade-in-up" style={{ opacity: fadeAlpha }}>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0" style={{ backgroundColor: dotColor }} />
                  <div>
                    <span className="text-[10px] font-mono font-medium" style={{ color: CORP.textTertiary }}>
                      {ev.timestamp}
                    </span>
                    <div className="text-[12px] leading-snug mt-0.5 font-medium" style={{ color: levelColor }}>
                      {ev.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
