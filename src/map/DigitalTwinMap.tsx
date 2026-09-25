import { useEffect, useRef, useMemo } from 'react';
import type { DomainState } from '../types';
import type { TelemetrySnapshot } from '../hooks/useTelemetry';
import { CORP, DOMAIN_MAP, SEVERITY } from '../brand/tokens';
import type { Coord, ServiceNode } from './geo';
import {
  project, projectPath, projectLine,
  MAINLAND, LAGOON, HOTEL_ZONE_NORTH, HOTEL_ZONE_SOUTH,
  BLVD_KUKULCAN, AV_TULUM, AV_BONAMPAK, RUTA_AEROPUERTO, PUENTE_NICHUPTE,
  PLACE_LABELS, ZONE_CONTEXT, SERVICE_NODES, ROUTES, URBAN_GRID,
} from './geo';

interface Props {
  domains: DomainState[];
  isEscalating: boolean;
  telemetry: TelemetrySnapshot;
}

// ── Domain layer shapes — semantic spatial footprints ──

function buildDomainLayers() {
  // Tourism: follows the Hotel Zone strip shape
  const turismo: Coord[] = [
    [-86.795, 21.170], [-86.775, 21.175], [-86.760, 21.168],
    [-86.750, 21.155], [-86.748, 21.140], [-86.750, 21.120],
    [-86.755, 21.100], [-86.762, 21.080], [-86.772, 21.060],
    [-86.785, 21.042], [-86.795, 21.035],
  ];

  // Movilidad: corridor bands along major roads
  const movilidadCorridors: Coord[][] = [
    // Kukulcan corridor (offset)
    [[-86.800, 21.172], [-86.778, 21.177], [-86.760, 21.170],
     [-86.750, 21.155], [-86.748, 21.135], [-86.752, 21.110],
     [-86.760, 21.085], [-86.775, 21.055], [-86.790, 21.035]],
    // Tulum corridor
    [[-86.845, 21.188], [-86.848, 21.155], [-86.852, 21.120],
     [-86.858, 21.085], [-86.865, 21.055]],
    // Airport connector
    [[-86.860, 21.060], [-86.878, 21.045], [-86.895, 21.032]],
  ];

  // Sensores: distributed coverage zones (circles/halos)
  const sensoresPoints: Coord[] = [
    [-86.810, 21.200], [-86.870, 21.185], [-86.900, 21.095],
    [-86.850, 21.135], [-86.790, 21.080], [-86.782, 21.148],
    [-86.835, 21.200], [-86.770, 21.115], [-86.800, 21.060],
    [-86.815, 21.160], [-86.860, 21.170], [-86.905, 21.058],
  ];

  // Infraestructura: structural mainland zones
  const infraZones: Coord[][] = [
    // Main datacenter cluster
    [[-86.855, 21.155], [-86.835, 21.155], [-86.835, 21.135],
     [-86.855, 21.135], [-86.855, 21.155]],
    // Southern hub
    [[-86.870, 21.080], [-86.850, 21.080], [-86.850, 21.060],
     [-86.870, 21.060], [-86.870, 21.080]],
  ];

  // Identidad: small access point zones
  const identidadPoints: Coord[] = [
    [-86.845, 21.172], [-86.830, 21.165], [-86.855, 21.155],
    [-86.815, 21.195], [-86.765, 21.160], [-86.840, 21.140],
    [-86.870, 21.100], [-86.800, 21.170],
  ];

  return { turismo, movilidadCorridors, sensoresPoints, infraZones, identidadPoints };
}

const DOMAIN_LAYERS = buildDomainLayers();

export function DigitalTwinMap({ domains, isEscalating, telemetry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domainMap = useMemo(() => {
    const m = new Map<string, DomainState>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

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

    const latencyFactor = Math.max(0.4, 1 - (telemetry.latencyMs - 18) / 150);
    const eventDensity = Math.max(1, telemetry.eventsPerMin / 2000);

    function spawnParticles() {
      const p: Particle[] = [];
      ROUTES.forEach(([fi, ti]) => {
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
      const color = dm?.color ?? '#2878E8';
      pulses.push({ x, y, radius: 3, maxR: isEscalating ? 30 : 18, alpha: 0.5, color });
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
        const alpha = Math.sin(p.progress * Math.PI) * 0.55;
        const dm = DOMAIN_MAP.get(p.domain);
        const col = dm?.color ?? '#2878E8';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = col + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Sensor pulses
      pulses = pulses.filter((p) => p.alpha > 0.02);
      pulses.forEach((p) => {
        p.radius += isEscalating ? 0.5 : 0.3;
        p.alpha = Math.max(0, 0.5 * (1 - p.radius / p.maxR));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.strokeStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Node rendering
      SERVICE_NODES.forEach((node: ServiceNode, i: number) => {
        const [x, y] = project(node.coord);
        const dm = DOMAIN_MAP.get(node.domain);
        const col = dm?.color ?? '#2878E8';
        const dState = domainMap.get(node.domain);
        const isStressed = dState && dState.status !== 'OPERATIVO' && dState.status !== 'ESTABLE';
        const isOff = dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO');

        if (isOff) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = SEVERITY.offline + '40';
          ctx.fill();
          return;
        }

        const pulse = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
        const baseR = node.hub ? 5 : (node.label ? 3.5 : 2.2);
        const r = baseR + pulse * (isStressed ? 1.8 : 0.6);

        // Node dot
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = col + (isStressed ? 'cc' : '90');
        ctx.fill();

        // Stressed halo — severity overlay ON TOP of domain color
        if (isStressed) {
          const sevColor = dState!.status === 'ALERTA' || dState!.status === 'CRÍTICO'
            ? SEVERITY.critical : SEVERITY.warning;
          const glowR = r + 10 + Math.sin(t * 3 + i) * 4;
          const grad = ctx.createRadialGradient(x, y, r, x, y, glowR);
          grad.addColorStop(0, sevColor + '35');
          grad.addColorStop(1, sevColor + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Severity ring
          ctx.beginPath();
          ctx.arc(x, y, r + 3, 0, Math.PI * 2);
          ctx.strokeStyle = sevColor + '60';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Hub label
        if (node.label) {
          ctx.font = '500 10px "Inter", sans-serif';
          ctx.fillStyle = CORP.textSecondary;
          ctx.textAlign = 'left';
          ctx.fillText(node.label, x + r + 5, y + 3.5);
        }
      });

      // Corridor animated dashes
      const dashSpeed = 20 * latencyFactor;
      ctx.setLineDash([5, 10]);
      ctx.lineDashOffset = -t * dashSpeed;
      ctx.lineWidth = 1;

      const corridorColor = CORP.verticeBlue;
      ctx.strokeStyle = corridorColor + '30';
      ctx.beginPath();
      BLVD_KUKULCAN.forEach((c: Coord, i: number) => {
        const [x, y] = project(c);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.strokeStyle = corridorColor + '25';
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

  // Helper: severity overlay color for a domain (null when normal)
  function domainSevOverlay(domainId: string): string | null {
    const dState = domainMap.get(domainId);
    if (!dState || dState.status === 'OPERATIVO' || dState.status === 'ESTABLE') return null;
    if (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO') return SEVERITY.offline;
    if (dState.status === 'ALERTA' || dState.status === 'CRÍTICO') return SEVERITY.critical;
    return SEVERITY.warning;
  }

  // Domain base color (always the domain's own color, desaturated when offline)
  function domainBaseColor(domainId: string): string {
    const dm = DOMAIN_MAP.get(domainId);
    const baseColor = dm?.color ?? '#2878E8';
    const dState = domainMap.get(domainId);
    if (dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO')) {
      return SEVERITY.offline;
    }
    return baseColor;
  }

  return (
    <div className="absolute inset-0">
      {/* SVG territory layers */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Sea gradient — light blue-gray */}
          <radialGradient id="sea-grad" cx="65%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#D6E4F2" />
            <stop offset="100%" stopColor="#C4D6E8" />
          </radialGradient>
          {/* Lagoon fill */}
          <radialGradient id="lagoon-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B8D4E2" />
            <stop offset="100%" stopColor="#A8C8DA" />
          </radialGradient>
          {/* Land */}
          <linearGradient id="land-grad" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#E8EEF5" />
            <stop offset="100%" stopColor="#DEE6F0" />
          </linearGradient>
          {/* Hotel Zone */}
          <linearGradient id="hotel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D8E2EE" />
            <stop offset="100%" stopColor="#CDD8E8" />
          </linearGradient>
          {/* Territory shadow */}
          <filter id="land-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#132238" floodOpacity="0.08" />
          </filter>
          <filter id="hz-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#132238" floodOpacity="0.06" />
          </filter>
          {/* Bathymetric line style */}
          <filter id="bath-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Layer 0: Sea */}
        <rect width="1920" height="1080" fill="url(#sea-grad)" />

        {/* Bathymetric contours — subtle depth hints */}
        <g opacity="0.08" stroke="#8BACC4" strokeWidth="0.5" fill="none">
          {[180, 280, 400, 530].map((r) => (
            <ellipse key={r} cx="1250" cy="550" rx={r} ry={r * 0.7} />
          ))}
        </g>

        {/* Coordinate grid */}
        <g opacity="0.05" stroke={CORP.mapGrid}>
          {Array.from({ length: 25 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 45} x2="1920" y2={i * 45} strokeWidth="0.4" />
          ))}
          {Array.from({ length: 43 }, (_, i) => (
            <line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="1080" strokeWidth="0.4" />
          ))}
        </g>

        {/* Layer 1: Mainland — real geographic polygon */}
        <path
          d={projectPath(MAINLAND)}
          fill="url(#land-grad)"
          stroke={CORP.border}
          strokeWidth="1"
          strokeOpacity="0.4"
          filter="url(#land-shadow)"
        />

        {/* Urban grid */}
        <g opacity="0.12" stroke={CORP.border} strokeWidth="0.5">
          {URBAN_GRID.map((line: Coord[], i: number) => (
            <path key={i} d={projectLine(line)} fill="none" />
          ))}
        </g>

        {/* Layer 2: Laguna Nichupté — real polygon */}
        <path
          d={projectPath(LAGOON)}
          fill="url(#lagoon-grad)"
          stroke="#8BACC4"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />

        {/* Lagoon sensor wave hints */}
        <g opacity="0.06" stroke={CORP.caribeCyan} strokeWidth="0.4" fill="none">
          {(() => {
            const center = project([-86.790, 21.098]);
            return [50, 80, 115].map((r) => (
              <ellipse key={r} cx={center[0]} cy={center[1]} rx={r} ry={r * 0.6} />
            ));
          })()}
        </g>

        {/* Layer 3: Hotel Zone — both polygons for the "7" shape */}
        <path
          d={projectPath(HOTEL_ZONE_NORTH)}
          fill="url(#hotel-grad)"
          stroke={CORP.border}
          strokeWidth="0.8"
          strokeOpacity="0.3"
          filter="url(#hz-shadow)"
        />
        <path
          d={projectPath(HOTEL_ZONE_SOUTH)}
          fill="url(#hotel-grad)"
          stroke={CORP.border}
          strokeWidth="0.8"
          strokeOpacity="0.3"
          filter="url(#hz-shadow)"
        />

        {/* ── Domain presence layers ── */}

        {/* Tourism: contour along Hotel Zone strip */}
        <path
          d={projectLine(DOMAIN_LAYERS.turismo)}
          fill="none"
          stroke={domainBaseColor('turismo')}
          strokeWidth="2"
          strokeOpacity="0.25"
          strokeLinejoin="round"
        />
        <path
          d={projectLine(DOMAIN_LAYERS.turismo)}
          fill="none"
          stroke={domainBaseColor('turismo')}
          strokeWidth="6"
          strokeOpacity="0.08"
          strokeLinejoin="round"
        />
        {domainSevOverlay('turismo') && (
          <path
            d={projectLine(DOMAIN_LAYERS.turismo)}
            fill="none"
            stroke={domainSevOverlay('turismo')!}
            strokeWidth="8"
            strokeOpacity="0.12"
            strokeLinejoin="round"
          />
        )}

        {/* Movilidad: corridor bands */}
        {DOMAIN_LAYERS.movilidadCorridors.map((corridor, i) => {
          const baseCol = domainBaseColor('movilidad');
          const sevCol = domainSevOverlay('movilidad');
          return (
            <g key={`mov-${i}`}>
              <path d={projectLine(corridor)} fill="none"
                stroke={baseCol} strokeWidth="4" strokeOpacity="0.1"
                strokeLinejoin="round" strokeLinecap="round" />
              <path d={projectLine(corridor)} fill="none"
                stroke={baseCol} strokeWidth="1.2" strokeOpacity="0.2"
                strokeLinejoin="round" strokeLinecap="round" />
              {sevCol && (
                <path d={projectLine(corridor)} fill="none"
                  stroke={sevCol} strokeWidth="6" strokeOpacity="0.1"
                  strokeLinejoin="round" strokeLinecap="round" />
              )}
            </g>
          );
        })}

        {/* Sensores: coverage halos */}
        {DOMAIN_LAYERS.sensoresPoints.map((pt, i) => {
          const [x, y] = project(pt);
          const base = domainBaseColor('sensores');
          const sev = domainSevOverlay('sensores');
          return (
            <g key={`sen-${i}`}>
              <circle cx={x} cy={y} r={14}
                fill={base} fillOpacity={0.04}
                stroke={base} strokeWidth="0.6" strokeOpacity={0.15}
              />
              {sev && (
                <circle cx={x} cy={y} r={18}
                  fill="none"
                  stroke={sev} strokeWidth="1.2" strokeOpacity={0.12}
                />
              )}
            </g>
          );
        })}

        {/* Infraestructura: structural zones */}
        {DOMAIN_LAYERS.infraZones.map((zone, i) => {
          const base = domainBaseColor('infraestructura');
          const sev = domainSevOverlay('infraestructura');
          return (
            <g key={`infra-${i}`}>
              <path
                d={projectPath(zone)}
                fill={base}
                fillOpacity={0.04}
                stroke={base}
                strokeWidth="0.8"
                strokeOpacity={0.2}
                strokeDasharray="3 3"
              />
              {sev && (
                <path
                  d={projectPath(zone)}
                  fill={sev}
                  fillOpacity={0.06}
                  stroke={sev}
                  strokeWidth="1.5"
                  strokeOpacity={0.18}
                />
              )}
            </g>
          );
        })}

        {/* Identidad: access point halos */}
        {DOMAIN_LAYERS.identidadPoints.map((pt, i) => {
          const [x, y] = project(pt);
          const base = domainBaseColor('identidad');
          const sev = domainSevOverlay('identidad');
          return (
            <g key={`id-${i}`}>
              <circle cx={x} cy={y} r={8}
                fill={base} fillOpacity={0.05}
                stroke={base} strokeWidth="0.5" strokeOpacity={0.2}
              />
              {sev && (
                <circle cx={x} cy={y} r={12}
                  fill="none"
                  stroke={sev} strokeWidth="1" strokeOpacity={0.15}
                />
              )}
            </g>
          );
        })}

        {/* Intelligence: correlation arcs connecting domains */}
        {(() => {
          const niCenter = project([-86.842, 21.138]);
          const targets = [
            project([-86.845, 21.172]),  // identidad
            project([-86.845, 21.148]),  // infraestructura
            project([-86.768, 21.165]),  // turismo
            project([-86.835, 21.200]),  // sensores
            project([-86.842, 21.185]),  // movilidad
          ];
          const base = domainBaseColor('inteligencia');
          const sev = domainSevOverlay('inteligencia');
          return targets.map(([tx, ty], i) => {
            const mx = (niCenter[0] + tx) / 2;
            const my = (niCenter[1] + ty) / 2 - 15;
            return (
              <g key={`ni-arc-${i}`}>
                <path
                  d={`M${niCenter[0]},${niCenter[1]} Q${mx},${my} ${tx},${ty}`}
                  fill="none"
                  stroke={base}
                  strokeWidth="0.8"
                  strokeOpacity={0.15}
                  strokeDasharray="4 6"
                />
                {sev && (
                  <path
                    d={`M${niCenter[0]},${niCenter[1]} Q${mx},${my} ${tx},${ty}`}
                    fill="none"
                    stroke={sev}
                    strokeWidth="2"
                    strokeOpacity={0.15}
                  />
                )}
              </g>
            );
          });
        })()}

        {/* Roads — static lines */}
        <path d={projectLine(BLVD_KUKULCAN)} fill="none" stroke={CORP.textTertiary} strokeWidth="1.5" strokeOpacity="0.18" />
        <path d={projectLine(AV_TULUM)} fill="none" stroke={CORP.textTertiary} strokeWidth="1.2" strokeOpacity="0.15" />
        <path d={projectLine(AV_BONAMPAK)} fill="none" stroke={CORP.textTertiary} strokeWidth="1" strokeOpacity="0.12" />
        <path d={projectLine(RUTA_AEROPUERTO)} fill="none" stroke={CORP.textTertiary} strokeWidth="1" strokeOpacity="0.12" strokeDasharray="4 4" />
        <path d={projectLine(PUENTE_NICHUPTE)} fill="none" stroke={CORP.textTertiary} strokeWidth="1" strokeOpacity="0.15" />

        {/* Route connections — data flow paths */}
        <g opacity={isEscalating ? 0.22 : 0.12}>
          {ROUTES.map(([fi, ti], idx) => {
            const from = SERVICE_NODES[fi];
            const to = SERVICE_NODES[ti];
            if (!from || !to) return null;
            const [fx, fy] = project(from.coord);
            const [tx, ty] = project(to.coord);
            const dm = DOMAIN_MAP.get(from.domain);
            const col = dm?.color ?? '#2878E8';
            const dState = domainMap.get(from.domain);
            const stressed = dState && dState.status !== 'OPERATIVO' && dState.status !== 'ESTABLE';
            const off = dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO');
            if (off) {
              return (
                <line key={idx}
                  x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke={SEVERITY.offline} strokeWidth={0.4} strokeOpacity={0.4}
                  strokeDasharray="2 6"
                />
              );
            }
            return (
              <line key={idx}
                x1={fx} y1={fy} x2={tx} y2={ty}
                stroke={col} strokeWidth={stressed ? 1.2 : 0.6}
                strokeDasharray={stressed ? '3 3' : 'none'}
              />
            );
          })}
        </g>

        {/* Place labels */}
        {PLACE_LABELS.map((pl) => {
          const [x, y] = project(pl.coord);
          return (
            <text key={pl.name} x={x} y={y}
              fill={CORP.textTertiary}
              fontSize={pl.size === 'lg' ? 12 : 10}
              fontFamily="'Inter', sans-serif"
              fontWeight="600"
              letterSpacing="0.1em"
              opacity={0.55}
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
            <text key={zone.label} x={x} y={y + 16}
              fill={isWarning ? SEVERITY.warning : CORP.textSecondary}
              fontSize="9.5"
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
              letterSpacing="0.04em"
              opacity={isWarning ? 0.8 : 0.55}
            >
              {val}
            </text>
          );
        })}
      </svg>

      {/* Canvas animation overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
