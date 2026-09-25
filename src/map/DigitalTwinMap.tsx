import { useEffect, useRef, useMemo } from 'react';
import type { DomainState } from '../types';
import { CORP, DOMAIN_MAP } from '../brand/tokens';
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
}

export function DigitalTwinMap({ domains, isEscalating }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const domainMap = useMemo(() => {
    const m = new Map<string, DomainState>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

  // Build hotel zone closed polygon path
  const hotelZonePath = useMemo(() => {
    const outer = HOTEL_OUTER.map((c: Coord) => project(c));
    const inner = [...HOTEL_INNER].reverse().map((c: Coord) => project(c));
    const all = [...outer, ...inner];
    return all.map((p: [number, number], i: number) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
  }, []);

  // ── Canvas animation layer ──
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

    function spawnParticles() {
      const p: Particle[] = [];
      ROUTES.forEach(([fi, ti]: [number, number]) => {
        const from = SERVICE_NODES[fi];
        const to = SERVICE_NODES[ti];
        if (!from || !to) return;
        const dState = domainMap.get(from.domain);
        const activity = dState?.activity ?? 30;
        const count = isEscalating ? Math.ceil(activity / 15) : Math.max(1, Math.floor(activity / 30));
        const [fx, fy] = project(from.coord);
        const [tx, ty] = project(to.coord);
        for (let i = 0; i < count; i++) {
          p.push({ fx, fy, tx, ty, progress: Math.random(), speed: 0.002 + Math.random() * 0.003, domain: from.domain });
        }
      });
      particles = p;
    }

    function spawnPulse(nodeIdx: number) {
      const node = SERVICE_NODES[nodeIdx];
      if (!node) return;
      const [x, y] = project(node.coord);
      const dm = DOMAIN_MAP.get(node.domain);
      const color = dm?.color ?? '#4d9fff';
      pulses.push({ x, y, radius: 3, maxR: isEscalating ? 35 : 20, alpha: 0.5, color });
    }

    spawnParticles();
    const respawn = setInterval(spawnParticles, 5000);
    const pulseIv = setInterval(() => {
      const idx = Math.floor(Math.random() * SERVICE_NODES.length);
      spawnPulse(idx);
    }, isEscalating ? 400 : 1200);

    function render() {
      if (!ctx || !canvas) return;
      t += 0.016;
      ctx.clearRect(0, 0, 1920, 1080);

      // ── Route particles ──
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

      // ── Sensor pulses ──
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

      // ── Node breathing ──
      SERVICE_NODES.forEach((node: ServiceNode, i: number) => {
        const [x, y] = project(node.coord);
        const dm = DOMAIN_MAP.get(node.domain);
        const col = dm?.color ?? '#4d9fff';
        const dState = domainMap.get(node.domain);
        const isStressed = dState && dState.status !== 'OPERATIVO' && dState.status !== 'ESTABLE';
        const isOff = dState && (dState.status === 'AISLADO' || dState.status === 'FUERA DE SERVICIO');

        const pulse = Math.sin(t * 2 + i * 0.5) * 0.5 + 0.5;
        const baseAlpha = isOff ? 0.15 : isStressed ? 0.8 : 0.5;
        const r = isOff ? 2 : (node.label ? 4 : 2.5) + pulse * (isStressed ? 2 : 0.8);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isOff ? '#4A6480' + '40' : col + Math.round(baseAlpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Stress glow
        if (isStressed && !isOff) {
          const glowR = r + 8 + Math.sin(t * 3 + i) * 4;
          const grad = ctx.createRadialGradient(x, y, r, x, y, glowR);
          grad.addColorStop(0, col + '30');
          grad.addColorStop(1, col + '00');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node label
        if (node.label) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = isOff ? '#4A648060' : col + '80';
          ctx.textAlign = 'left';
          ctx.fillText(node.label, x + r + 4, y + 3);
        }
      });

      // ── Corridor activity (moving dashes on major roads) ──
      ctx.setLineDash([4, 8]);
      ctx.lineDashOffset = -t * 20;
      ctx.lineWidth = 0.8;
      const corridorAlpha = isEscalating ? '50' : '25';
      // Kukulcan
      ctx.strokeStyle = '#4d9fff' + corridorAlpha;
      ctx.beginPath();
      BLVD_KUKULCAN.forEach((c: Coord, i: number) => {
        const [x, y] = project(c);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Tulum
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
  }, [domainMap, isEscalating]);

  return (
    <div className="absolute inset-0">
      {/* ── SVG territory layers ── */}
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
        </defs>

        {/* Sea background */}
        <rect width="1920" height="1080" fill="url(#sea-grad)" />

        {/* Subtle sea texture — bathymetric lines */}
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

        {/* Mainland territory */}
        <path d={projectPath(MAINLAND)} fill="url(#land-grad)" stroke={CORP.verticeBlue} strokeWidth="1" strokeOpacity="0.2" />

        {/* Urban grid (downtown) */}
        <g opacity="0.08" stroke={CORP.verticeBlue} strokeWidth="0.4">
          {URBAN_GRID.map((line: Coord[], i: number) => (
            <path key={i} d={projectLine(line)} fill="none" />
          ))}
        </g>

        {/* Laguna Nichupté */}
        <path d={projectPath(LAGOON)} fill="url(#lagoon-grad)" stroke={CORP.caribeCyan} strokeWidth="0.8" strokeOpacity="0.15" />

        {/* Lagoon texture — subtle ripples */}
        <g opacity="0.035" stroke={CORP.caribeCyan} strokeWidth="0.3" fill="none">
          {(() => {
            const center = project([-86.795, 21.100]);
            return [60, 90, 125].map((r) => (
              <ellipse key={r} cx={center[0]} cy={center[1]} rx={r} ry={r * 0.65} />
            ));
          })()}
        </g>

        {/* Hotel Zone strip */}
        <path d={hotelZonePath} fill="url(#hotel-grad)" stroke={CORP.caribeCyan} strokeWidth="0.8" strokeOpacity="0.2" />

        {/* Major corridors */}
        <path d={projectLine(BLVD_KUKULCAN)} fill="none" stroke="#4d9fff" strokeWidth="1.2" strokeOpacity="0.12" />
        <path d={projectLine(AV_TULUM)} fill="none" stroke="#4d9fff" strokeWidth="1" strokeOpacity="0.1" />
        <path d={projectLine(AV_BONAMPAK)} fill="none" stroke="#4d9fff" strokeWidth="0.8" strokeOpacity="0.08" />
        <path d={projectLine(RUTA_AEROPUERTO)} fill="none" stroke="#4d9fff" strokeWidth="0.8" strokeOpacity="0.08" strokeDasharray="4 4" />

        {/* Route connections between service nodes */}
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

        {/* Coastline glow overlay */}
        <path d={projectPath(MAINLAND)} fill="none" stroke={CORP.verticeBlue}
          strokeWidth="3" strokeOpacity="0.05" filter="url(#coast-glow)" />
        <defs>
          <filter id="coast-glow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
      </svg>

      {/* ── Canvas animation overlay ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
