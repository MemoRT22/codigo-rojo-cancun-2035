import { useEffect, useRef, useMemo } from 'react';
import type { DomainState } from '../types';
import type { TelemetrySnapshot } from '../hooks/useTelemetry';
import { CORP, DOMAIN_MAP, SEVERITY } from '../brand/tokens';
import type { Coord, ServiceNode, PlaceLabel } from './cancunGeo';
import {
  project, projectPath, projectLine,
  MAINLAND, LAGOON, HOTEL_OUTER, HOTEL_INNER,
  BLVD_KUKULCAN, AV_TULUM, AV_BONAMPAK, RUTA_AEROPUERTO,
  PLACE_LABELS, SERVICE_NODES, ROUTES, URBAN_GRID,
} from './cancunGeo';

interface Props {
  domains: DomainState[];
  isEscalating: boolean;
  telemetry: TelemetrySnapshot;
}

// Zone context micro-data tied to geographic locations
interface ZoneInfo {
  coord: Coord;
  label: string;
  getValue: (t: TelemetrySnapshot, escalating: boolean) => string;
}

const ZONE_CONTEXT: ZoneInfo[] = [
  {
    coord: [-86.755, 21.152],
    label: 'ZONA HOTELERA',
    getValue: (t) => `${Math.round(t.servicesUp * 1.5)} servicios activos`,
  },
  {
    coord: [-86.852, 21.175],
    label: 'CENTRO',
    getValue: (t) => `${Math.min(12, Math.round(t.nodesLinked * 0.25))} nodos operativos`,
  },
  {
    coord: [-86.892, 21.042],
    label: 'AEROPUERTO',
    getValue: (_, esc) => esc ? 'Enlace degradado' : 'Enlace estable',
  },
  {
    coord: [-86.752, 21.080],
    label: 'CORREDOR KUKULCÁN',
    getValue: (_, esc) => esc ? 'Movilidad restringida' : 'Movilidad normal',
  },
  {
    coord: [-86.802, 21.098],
    label: 'LAGUNA NICHUPTÉ',
    getValue: (_, esc) => esc ? 'Sensores intermitentes' : 'Sensores activos',
  },
];

export function DigitalTwinMap({ domains, isEscalating, telemetry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domainMap = useMemo(() => {
    const m = new Map<string, DomainState>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

  const hotelZonePath = useMemo(() => {
    const outer = HOTEL_OUTER.map((c: Coord) => project(c));
    const inner = [...HOTEL_INNER].reverse().map((c: Coord) => project(c));
    const all = [...outer, ...inner];
    return all.map((p: [number, number], i: number) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  }, []);

  // ── Canvas animation — reactive to telemetry ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1920;
    canvas.height = 1080;

    interface Particle {
      fx: number; fy: number; tx: number; ty: number;
      progress: number; speed: number; domain: string;
    }
    interface Pulse {
      x: number; y: number; radius: number; maxR: number;
      alpha: number; color: string;
    }

    let particles: Particle[] = [];
    let pulses: Pulse[] = [];
    let animFrame = 0;
    let t = 0;

    // Latency affects particle speed — higher latency = slower particles
    const latencyFactor = Math.max(0.4, 1 - (telemetry.latencyMs - 18) / 150);
    // Event volume affects particle density
    const eventDensity = Math.max(1, telemetry.eventsPerMin / 2000);

    function spawnParticles() {
      const p: Particle[] = [];
      ROUTES.forEach(([fi, ti]: [number, number]) => {
        const from = SERVICE_NODES[fi];
        const to = SERVICE_NODES[ti];
        if (!from || !to) return;
        const dState = domainMap.get(from.domain);
        const activity = dState?.activity ?? 30;
        const count = Math.max(1, Math.round((activity / 25) * eventDensity));
        const [fx, fy] = project(from.coord);
        const [tx, ty] = project(to.coord);
        for (let i = 0; i < count; i++) {
          p.push({
            fx, fy, tx, ty,
            progress: Math.random(),
            speed: (0.002 + Math.random() * 0.003) * latencyFactor,
            domain: from.domain,
          });
        }
      });
      particles = p;
    }

    function spawnPulse(nodeIdx: number) {
      const node = SERVICE_NODES[nodeIdx];
      if (!node) return;
      const dState = domainMap.get(node.domain);
      if (dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO')) return;
      const [x, y] = project(node.coord);
      const dm = DOMAIN_MAP.get(node.domain);
      const color = dm?.color ?? '#4d9fff';
      pulses.push({ x, y, radius: 3, maxR: isEscalating ? 35 : 20, alpha: 0.5, color });
    }

    spawnParticles();
    const respawn = setInterval(spawnParticles, 4000);
    const pulseRate = isEscalating ? Math.max(200, 800 - telemetry.eventsPerMin / 15) : 1200;
    const pulseIv = setInterval(() => {
      const idx = Math.floor(Math.random() * SERVICE_NODES.length);
      spawnPulse(idx);
    }, pulseRate);

    function render() {
      if (!ctx || !canvas) return;
      t += 0.016;
      ctx.clearRect(0, 0, 1920, 1080);

      // Route particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const x = p.fx + (p.tx - p.fx) * p.progress;
        const y = p.fy + (p.ty - p.fy) * p.progress;
        const alpha = Math.sin(p.progress * Math.PI) * 0.7;
        const dm = DOMAIN_MAP.get(p.domain);
        const col = dm?.color ?? '#4d9fff';
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = col + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Sensor pulses
      pulses = pulses.filter((p) => p.alpha > 0.02);
      pulses.forEach((p) => {
        p.radius += isEscalating ? 0.6 : 0.35;
        p.alpha = Math.max(0, 0.5 * (1 - p.radius / p.maxR));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Node breathing — suppressed for isolated/offline nodes
      SERVICE_NODES.forEach((node: ServiceNode, i: number) => {
        const [x, y] = project(node.coord);
        const dm = DOMAIN_MAP.get(node.domain);
        const col = dm?.color ?? '#4d9fff';
        const dState = domainMap.get(node.domain);
        const isStressed = dState && dState.status !== 'OPERATIVO' && dState.status !== 'ESTABLE';
        const isOff = dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO');

        if (isOff) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#4A648030';
          ctx.fill();
          if (node.label) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#4A648040';
            ctx.textAlign = 'left';
            ctx.fillText(node.label, x + 6, y + 3);
          }
          return;
        }

        const pulse = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
        const baseAlpha = isStressed ? 0.8 : 0.5;
        const r = (node.label ? 4 : 2.5) + pulse * (isStressed ? 2 : 0.8);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = col + Math.round(baseAlpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        if (isStressed) {
          const glowR = r + 8 + Math.sin(t * 3 + i) * 4;
          const grad = ctx.createRadialGradient(x, y, r, x, y, glowR);
          grad.addColorStop(0, col + '30');
          grad.addColorStop(1, col + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        if (node.label) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = col + '80';
          ctx.textAlign = 'left';
          ctx.fillText(node.label, x + r + 4, y + 3);
        }
      });

      // Corridor animated dashes — speed affected by latency
      const dashSpeed = 20 * latencyFactor;
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -t * dashSpeed;
      ctx.lineWidth = 0.8;
      const corridorAlpha = isEscalating ? '50' : '25';

      ctx.strokeStyle = '#4d9fff' + corridorAlpha;
      ctx.beginPath();
      BLVD_KUKULCAN.forEach((c: Coord, i: number) => {
        const [x, y] = project(c);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.strokeStyle = '#4d9fff' + corridorAlpha;
      ctx.beginPath();
      AV_TULUM.forEach((c: Coord, i: number) => {
        const [x, y] = project(c);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      animFrame = requestAnimationFrame(render);
    }

    animFrame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(respawn);
      clearInterval(pulseIv);
    };
  }, [domainMap, isEscalating, telemetry.latencyMs, telemetry.eventsPerMin]);

  return (
    <div className="absolute inset-0">
      {/* SVG territory layers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sea-grad" cx="75%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0A1624" />
            <stop offset="100%" stopColor="#050B12" />
          </radialGradient>
          <radialGradient id="lagoon-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0D2038" />
            <stop offset="100%" stopColor="#0A1624" />
          </radialGradient>
          <radialGradient id="land-grad" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#0F1F33" />
            <stop offset="100%" stopColor="#0B1825" />
          </radialGradient>
          <linearGradient id="hotel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#122640" />
            <stop offset="100%" stopColor="#0E1D30" />
          </linearGradient>
          <filter id="coast-glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="1920" height="1080" fill="url(#sea-grad)" />

        {/* Bathymetric texture */}
        <g opacity="0.04" stroke={CORP.caribeCyan} strokeWidth="0.5" fill="none">
          {[200, 320, 450, 580, 700].map((r) => (
            <ellipse key={r} cx="1300" cy="600" rx={r} ry={r * 0.7} />
          ))}
        </g>

        {/* Coordinate grid */}
        <g opacity="0.025" stroke={CORP.verticeBlue}>
          {Array.from({ length: 25 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 45} x2="1920" y2={i * 45} strokeWidth="0.3" />
          ))}
          {Array.from({ length: 43 }, (_, i) => (
            <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="1080" strokeWidth="0.3" />
          ))}
        </g>

        {/* Mainland */}
        <path d={projectPath(MAINLAND)} fill="url(#land-grad)" stroke={CORP.verticeBlue} strokeWidth="1" strokeOpacity="0.2" />

        {/* Urban grid */}
        <g opacity="0.08" stroke={CORP.verticeBlue} strokeWidth="0.4">
          {URBAN_GRID.map((line: Coord[], i: number) => (
            <path key={i} d={projectLine(line)} fill="none" />
          ))}
        </g>

        {/* Lagoon */}
        <path d={projectPath(LAGOON)} fill="url(#lagoon-grad)" stroke={CORP.caribeCyan} strokeWidth="0.8" strokeOpacity="0.15" />

        {/* Lagoon ripples */}
        <g opacity="0.035" stroke={CORP.caribeCyan} strokeWidth="0.3" fill="none">
          {(() => {
            const center = project([-86.795, 21.100]);
            return [60, 90, 125].map((r) => (
              <ellipse key={r} cx={center[0]} cy={center[1]} rx={r} ry={r * 0.65} />
            ));
          })()}
        </g>

        {/* Hotel Zone */}
        <path d={hotelZonePath} fill="url(#hotel-grad)" stroke={CORP.caribeCyan} strokeWidth="0.8" strokeOpacity="0.2" />

        {/* Corridors */}
        <path d={projectLine(BLVD_KUKULCAN)} fill="none" stroke="#4d9fff" strokeWidth="1.2" strokeOpacity="0.12" />
        <path d={projectLine(AV_TULUM)} fill="none" stroke="#4d9fff" strokeWidth="1" strokeOpacity="0.1" />
        <path d={projectLine(AV_BONAMPAK)} fill="none" stroke="#4d9fff" strokeWidth="0.8" strokeOpacity="0.08" />
        <path d={projectLine(RUTA_AEROPUERTO)} fill="none" stroke="#4d9fff" strokeWidth="0.8" strokeOpacity="0.08" strokeDasharray="4 4" />

        {/* Route connections */}
        <g opacity={isEscalating ? 0.18 : 0.08}>
          {ROUTES.map(([fi, ti]: [number, number], idx: number) => {
            const from = SERVICE_NODES[fi];
            const to = SERVICE_NODES[ti];
            if (!from || !to) return null;
            const [fx, fy] = project(from.coord);
            const [tx, ty] = project(to.coord);
            const dm = DOMAIN_MAP.get(from.domain);
            const col = dm?.color ?? '#4d9fff';
            const dState = domainMap.get(from.domain);
            const stressed = dState && dState.status !== 'OPERATIVO' && dState.status !== 'ESTABLE';
            const off = dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO');
            if (off) {
              return (
                <line key={idx}
                  x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke={SEVERITY.offline} strokeWidth={0.4} strokeOpacity={0.3}
                  strokeDasharray="2 6"
                />
              );
            }
            return (
              <line key={idx}
                x1={fx} y1={fy} x2={tx} y2={ty}
                stroke={col} strokeWidth={stressed ? 1.2 : 0.5}
                strokeDasharray={stressed ? '3 3' : 'none'}
              />
            );
          })}
        </g>

        {/* Place labels */}
        {PLACE_LABELS.map((pl: PlaceLabel) => {
          const [x, y] = project(pl.coord);
          return (
            <text key={pl.name} x={x} y={y}
              fill={CORP.textTertiary}
              fontSize={pl.size === 'lg' ? 11 : 9}
              fontFamily="Inter, sans-serif"
              fontWeight="500"
              letterSpacing="0.12em"
              opacity={0.5}
            >
              {pl.name}
            </text>
          );
        })}

        {/* Zone context micro-data */}
        {ZONE_CONTEXT.map((zone) => {
          const [x, y] = project(zone.coord);
          const val = zone.getValue(telemetry, isEscalating);
          const isWarning = val.includes('degradado') || val.includes('restringida') || val.includes('intermitentes');
          return (
            <g key={zone.label}>
              <text x={x} y={y + 14}
                fill={isWarning ? SEVERITY.warning : CORP.textTertiary}
                fontSize="8"
                fontFamily="'JetBrains Mono', monospace"
                letterSpacing="0.06em"
                opacity={isWarning ? 0.65 : 0.4}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Coastline glow */}
        <path d={projectPath(MAINLAND)} fill="none" stroke={CORP.verticeBlue}
          strokeWidth="3" strokeOpacity="0.05" filter="url(#coast-glow)" />
      </svg>

      {/* Canvas animation overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
