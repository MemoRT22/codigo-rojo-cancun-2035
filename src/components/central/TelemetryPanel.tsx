import { useEffect, useRef, useState } from 'react';
import type { TelemetrySnapshot } from '../../hooks/useTelemetry';
import { CORP, SEVERITY } from '../../brand/tokens';

interface Props {
  telemetry: TelemetrySnapshot;
  isEscalating: boolean;
}

// ── Sparkline ──────────────────────────────────────────────────────────

function Sparkline({
  data,
  color,
  warning,
}: {
  data: number[];
  color: string;
  warning?: boolean;
}) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 26;
  const w = 80;
  const padY = 3;
  const step = w / (data.length - 1);

  const strokeColor = warning ? SEVERITY.warning : color;

  const points = data
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(h - padY - ((v - min) / range) * (h - padY * 2)).toFixed(1)}`,
    )
    .join(' ');

  // Gradient fill beneath the line
  const fillPoints = `0,${h} ${points} ${((data.length - 1) * step).toFixed(1)},${h}`;

  // Current-value dot position
  const lastVal = data[data.length - 1]!;
  const dotX = (data.length - 1) * step;
  const dotY = h - padY - ((lastVal - min) / range) * (h - padY * 2);

  return (
    <svg
      width={w}
      height={h}
      className="flex-shrink-0"
      style={{ overflow: 'visible' }}
    >
      {/* Subtle area fill */}
      <polygon points={fillPoints} fill={strokeColor} opacity={0.06} />

      {/* Main line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.65}
      />

      {/* Current-value dot */}
      <circle cx={dotX} cy={dotY} r="2.5" fill={strokeColor} opacity={0.9} />
      <circle cx={dotX} cy={dotY} r="4.5" fill={strokeColor} opacity={0.15} />
    </svg>
  );
}

// ── Animated Number ────────────────────────────────────────────────────

function AnimatedNum({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(0);
  const currentRef = useRef(value);

  useEffect(() => {
    const target = value;
    const start = currentRef.current;
    if (Math.abs(target - start) < 0.5) {
      currentRef.current = target;
      setDisplay(target);
      return;
    }
    let frame = 0;
    const totalFrames = 18;

    function step() {
      frame++;
      const t = Math.min(1, frame / totalFrames);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const v = start + (target - start) * eased;
      currentRef.current = v;
      setDisplay(
        decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.round(v),
      );
      if (frame < totalFrames) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, decimals]);

  return (
    <>{decimals > 0 ? display.toFixed(decimals) : display.toLocaleString('es-MX')}</>
  );
}

// ── Delta badge ────────────────────────────────────────────────────────

function Delta({ value, invert }: { value: number; invert?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [displayVal, setDisplayVal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (Math.abs(value) >= 2) {
      setDisplayVal(value);
      setVisible(true);
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    }
    return () => {
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    };
  }, [value]);

  if (!visible || displayVal === 0) return null;

  const isUp = displayVal > 0;
  const bad = invert ? !isUp : isUp;
  const color = bad ? SEVERITY.critical : SEVERITY.warning;

  return (
    <span
      className="inline-flex items-center ml-1.5 rounded-full px-1 py-px text-[9px] font-mono font-medium leading-none animate-fade-in-up"
      style={{
        color,
        backgroundColor: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      {isUp ? '▲' : '▼'}&thinsp;{Math.abs(displayVal)}
    </span>
  );
}

// ── Separator ──────────────────────────────────────────────────────────

function Separator() {
  return (
    <div
      className="h-px my-0.5"
      style={{
        background: `linear-gradient(90deg, ${CORP.borderSubtle} 0%, ${CORP.border} 40%, transparent 100%)`,
      }}
    />
  );
}

// ── Indicator row ──────────────────────────────────────────────────────

interface IndicatorProps {
  label: string;
  value: number;
  suffix?: string;
  denominator?: number;
  sparkData?: number[];
  sparkColor?: string;
  delta?: number;
  deltaInvert?: boolean;
  warning?: boolean;
  critical?: boolean;
}

function Indicator({
  label,
  value,
  suffix,
  denominator,
  sparkData,
  sparkColor,
  delta,
  deltaInvert,
  warning,
  critical,
}: IndicatorProps) {
  const valueColor = critical
    ? SEVERITY.critical
    : warning
      ? SEVERITY.warning
      : CORP.textPrimary;

  const labelColor = critical
    ? SEVERITY.critical
    : warning
      ? SEVERITY.warning
      : CORP.textTertiary;

  return (
    <div className="flex items-center justify-between gap-3 py-[7px]">
      {/* Left: label + value */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[9px] uppercase tracking-[0.12em] leading-tight mb-1 truncate"
          style={{ color: labelColor }}
        >
          {label}
        </div>
        <div className="flex items-baseline gap-0.5">
          <span
            className={`font-mono font-semibold leading-none tracking-tight transition-colors duration-500 ${critical ? 'animate-status-flash' : ''}`}
            style={{
              color: valueColor,
              fontSize: '21px',
              letterSpacing: '-0.02em',
            }}
          >
            <AnimatedNum value={value} />
          </span>
          {denominator !== undefined && (
            <span
              className="font-mono font-normal"
              style={{ color: CORP.textTertiary, fontSize: '13px' }}
            >
              /{denominator}
            </span>
          )}
          {suffix && (
            <span
              className="font-mono font-normal ml-px"
              style={{ color: CORP.textTertiary, fontSize: '10px' }}
            >
              {suffix}
            </span>
          )}
          {delta !== undefined && (
            <Delta value={delta} invert={deltaInvert} />
          )}
        </div>
      </div>

      {/* Right: sparkline */}
      {sparkData && sparkData.length > 2 && (
        <Sparkline
          data={sparkData}
          color={sparkColor ?? CORP.caribeCyan}
          warning={warning || critical}
        />
      )}
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────

export function TelemetryPanel({ telemetry, isEscalating }: Props) {
  const t = telemetry;

  const latencyWarning = t.latencyMs > 30;
  const latencyCritical = t.latencyMs > 60;
  const eventsWarning = t.eventsPerMin > 4000;
  const eventsCritical = t.eventsPerMin > 6000;
  const servicesWarning = t.servicesUp < t.servicesTotal;

  const statusColor = isEscalating ? SEVERITY.warning : CORP.caribeCyan;
  const statusLabel = isEscalating ? 'ALERTA' : 'ACTIVA';

  return (
    <div className="w-[260px] select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span
            className="text-[8px] font-mono uppercase tracking-[0.22em] leading-none"
            style={{ color: CORP.textTertiary }}
          >
            TELEMETRÍA
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.08em] leading-tight mt-0.5"
            style={{ color: CORP.textPrimary }}
          >
            Estado Operacional
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 10, height: 10 }}
          >
            {/* Outer ring pulse */}
            <div
              className={`absolute inset-0 rounded-full ${isEscalating ? 'animate-status-flash' : 'animate-pulse-slow'}`}
              style={{
                backgroundColor: statusColor,
                opacity: 0.2,
              }}
            />
            {/* Inner dot */}
            <div
              className="relative w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          </div>
          <span
            className="text-[8px] font-mono font-medium tracking-[0.15em]"
            style={{ color: isEscalating ? SEVERITY.warning : CORP.textSecondary }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* ── Top separator ── */}
      <Separator />

      {/* ── Indicators ── */}
      <Indicator
        label="Usuarios conectados"
        value={t.users}
        sparkData={t.sparkUsers}
        sparkColor={CORP.caribeCyan}
        delta={t.deltaUsers}
        deltaInvert
      />
      <Separator />

      <Indicator
        label="Sesiones activas"
        value={t.sessions}
        sparkData={t.sparkSessions}
        sparkColor={CORP.verticeBlue}
        delta={t.deltaSessions}
        warning={t.sessions > 122}
      />
      <Separator />

      <Indicator
        label="Servicios operativos"
        value={t.servicesUp}
        denominator={t.servicesTotal}
        warning={servicesWarning}
      />
      <Separator />

      <Indicator
        label="Nodos enlazados"
        value={t.nodesLinked}
        denominator={t.nodesTotal}
        warning={t.nodesLinked < t.nodesTotal}
      />
      <Separator />

      <Indicator
        label="Eventos procesados"
        value={t.eventsPerMin}
        suffix="/min"
        sparkData={t.sparkEvents}
        sparkColor={CORP.caribeCyan}
        delta={t.deltaEvents}
        warning={eventsWarning && !eventsCritical}
        critical={eventsCritical}
      />
      <Separator />

      <Indicator
        label="Latencia de sincronización"
        value={t.latencyMs}
        suffix=" ms"
        sparkData={t.sparkLatency}
        sparkColor={CORP.caribeCyan}
        delta={t.deltaLatency}
        warning={latencyWarning && !latencyCritical}
        critical={latencyCritical}
      />

      {/* ── Footer ── */}
      <div
        className="h-px mt-2"
        style={{
          background: `linear-gradient(90deg, ${CORP.border}, ${CORP.borderSubtle} 60%, transparent 100%)`,
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <div className="relative flex items-center justify-center w-2 h-2">
          <div
            className="absolute inset-0 rounded-full animate-pulse-slow"
            style={{ backgroundColor: CORP.caribeCyan, opacity: 0.25 }}
          />
          <div
            className="relative w-1 h-1 rounded-full"
            style={{ backgroundColor: CORP.caribeCyan }}
          />
        </div>
        <span
          className="text-[8px] font-mono tracking-[0.1em]"
          style={{ color: CORP.textTertiary }}
        >
          {t.lastUpdateTime}
        </span>
      </div>
    </div>
  );
}
