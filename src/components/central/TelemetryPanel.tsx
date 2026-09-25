import { useEffect, useRef, useState } from 'react';
import type { TelemetrySnapshot } from '../../hooks/useTelemetry';
import { CORP, SEVERITY } from '../../brand/tokens';

interface Props {
  telemetry: TelemetrySnapshot;
  isEscalating: boolean;
}

// ── Sparkline ──

function Sparkline({ data, color, warning }: { data: number[]; color: string; warning?: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 22;
  const w = 72;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h * 0.85 - h * 0.075).toFixed(1)}`).join(' ');

  return (
    <svg width={w} height={h} className="flex-shrink-0" style={{ opacity: 0.7 }}>
      <polyline
        points={points}
        fill="none"
        stroke={warning ? SEVERITY.warning : color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Current value dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1]!;
        const x = (data.length - 1) * step;
        const y = h - ((last - min) / range) * h * 0.85 - h * 0.075;
        return <circle cx={x} cy={y} r="2" fill={warning ? SEVERITY.warning : color} />;
      })()}
    </svg>
  );
}

// ── Animated Number ──

function AnimatedNum({ value, decimals = 0 }: { value: number; decimals?: number }) {
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
      setDisplay(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.round(v));
      if (frame < totalFrames) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, decimals]);

  return <>{decimals > 0 ? display.toFixed(decimals) : display.toLocaleString('es-MX')}</>;
}

// ── Delta badge ──

function Delta({ value, invert }: { value: number; invert?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [displayVal, setDisplayVal] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (Math.abs(value) >= 2) {
      setDisplayVal(value);
      setVisible(true);
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2500);
    }
    return () => { if (timerRef.current !== undefined) clearTimeout(timerRef.current); };
  }, [value]);

  if (!visible || displayVal === 0) return null;

  const isUp = displayVal > 0;
  const bad = invert ? !isUp : isUp;
  const color = bad ? SEVERITY.critical : SEVERITY.warning;

  return (
    <span
      className="text-[9px] font-mono ml-1 animate-fade-in-up"
      style={{ color, opacity: 0.7 }}
    >
      {isUp ? '\u2191' : '\u2193'}{Math.abs(displayVal)}
    </span>
  );
}

// ── Indicator row ──

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

function Indicator({ label, value, suffix, denominator, sparkData, sparkColor, delta, deltaInvert, warning, critical }: IndicatorProps) {
  const valueColor = critical ? SEVERITY.critical
    : warning ? SEVERITY.warning
    : CORP.textPrimary;

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: CORP.textTertiary }}>
          {label}
        </div>
        <div className="flex items-baseline gap-0.5 mt-0.5">
          <span
            className={`text-[18px] font-mono font-light leading-none transition-colors duration-500 ${critical ? 'animate-status-flash' : ''}`}
            style={{ color: valueColor }}
          >
            <AnimatedNum value={value} />
          </span>
          {denominator !== undefined && (
            <span className="text-[12px] font-mono" style={{ color: CORP.textTertiary }}>
              /{denominator}
            </span>
          )}
          {suffix && (
            <span className="text-[10px] font-mono" style={{ color: CORP.textTertiary }}>
              {suffix}
            </span>
          )}
          {delta !== undefined && <Delta value={delta} invert={deltaInvert} />}
        </div>
      </div>
      {sparkData && sparkData.length > 2 && (
        <Sparkline data={sparkData} color={sparkColor ?? CORP.caribeCyan} warning={warning || critical} />
      )}
    </div>
  );
}

// ── Main panel ──

export function TelemetryPanel({ telemetry, isEscalating }: Props) {
  const t = telemetry;
  const latencyWarning = t.latencyMs > 30;
  const latencyCritical = t.latencyMs > 60;
  const eventsWarning = t.eventsPerMin > 4000;
  const eventsCritical = t.eventsPerMin > 6000;
  const servicesWarning = t.servicesUp < t.servicesTotal;

  return (
    <div className="w-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: CORP.textTertiary }}>
          Estado Operacional
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isEscalating ? 'animate-status-flash' : 'animate-pulse-slow'}`}
            style={{ backgroundColor: isEscalating ? SEVERITY.warning : CORP.caribeCyan }}
          />
          <span className="text-[8px] font-mono tracking-wider" style={{ color: CORP.textTertiary }}>
            {isEscalating ? 'ALERTA' : 'ACTIVA'}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px mb-1" style={{ background: `linear-gradient(90deg, ${CORP.border}, transparent)` }} />

      {/* Indicators */}
      <Indicator
        label="Usuarios conectados"
        value={t.users}
        sparkData={t.sparkUsers}
        sparkColor={CORP.caribeCyan}
        delta={t.deltaUsers}
        deltaInvert
      />
      <Indicator
        label="Sesiones activas"
        value={t.sessions}
        sparkData={t.sparkSessions}
        sparkColor={CORP.verticeBlue}
        delta={t.deltaSessions}
        warning={t.sessions > 122}
      />
      <Indicator
        label="Servicios operativos"
        value={t.servicesUp}
        denominator={t.servicesTotal}
        warning={servicesWarning}
      />
      <Indicator
        label="Nodos enlazados"
        value={t.nodesLinked}
        denominator={t.nodesTotal}
        warning={t.nodesLinked < t.nodesTotal}
      />
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

      {/* Footer — last update */}
      <div className="h-px mt-2 mb-2" style={{ background: `linear-gradient(90deg, ${CORP.border}, transparent)` }} />
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full animate-pulse-slow" style={{ backgroundColor: CORP.caribeCyan }} />
        <span className="text-[8px] font-mono tracking-wider" style={{ color: CORP.textTertiary }}>
          TELEMETRÍA {t.lastUpdateTime}
        </span>
      </div>
    </div>
  );
}
