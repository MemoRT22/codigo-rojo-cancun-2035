import { useEffect, useRef, useMemo, useCallback } from 'react';
import type { DomainState } from '../types';

interface Props {
  domains: DomainState[];
  accentColor: 'teal' | 'amber' | 'red';
  narrativeState: string;
}

const ACCENT = {
  teal:  { r: 42, g: 138, b: 138, hex: '#2a8a8a' },
  amber: { r: 212, g: 145, b: 58, hex: '#d4913a' },
  red:   { r: 192, g: 57, b: 43, hex: '#c0392b' },
};

const STATUS_COLORS: Record<string, { r: number; g: number; b: number }> = {
  OPERATIVO:          { r: 42, g: 138, b: 138 },
  ESTABLE:            { r: 39, g: 174, b: 96 },
  ADVERTENCIA:        { r: 212, g: 145, b: 58 },
  ALERTA:             { r: 230, g: 126, b: 34 },
  'CRÍTICO':          { r: 192, g: 57, b: 43 },
  AISLANDO:           { r: 212, g: 145, b: 58 },
  AISLADO:            { r: 80, g: 95, b: 110 },
  REVOCANDO:          { r: 212, g: 145, b: 58 },
  REVOCADA:           { r: 80, g: 95, b: 110 },
  'FUERA DE SERVICIO':{ r: 192, g: 57, b: 43 },
  CONTENIDO:          { r: 39, g: 174, b: 96 },
};

// ------------------------------------------------------------------
// Cancún geography – stylised but recognisable.
// Coordinate space: 1920×1080 (matches viewport).
// Mainland on the left, lagoon in the centre, hotel-zone strip
// curving from upper-centre rightward and then south.
// ------------------------------------------------------------------

// Mainland (zona continental) – large organic polygon
const MAINLAND: [number, number][] = [
  [220, 180], [340, 130], [500, 120], [620, 160],
  [680, 220], [700, 340], [690, 480], [660, 600],
  [620, 700], [560, 780], [440, 830], [320, 820],
  [240, 760], [190, 660], [170, 540], [175, 400],
  [190, 280],
];

// Lagoon (Nichupté) – enclosed between mainland and hotel zone
const LAGOON: [number, number][] = [
  [700, 240], [780, 220], [880, 240], [960, 300],
  [1000, 400], [1010, 520], [980, 630], [930, 720],
  [860, 770], [780, 780], [720, 740], [680, 660],
  [670, 540], [680, 400], [690, 300],
];

// Hotel zone strip – the distinctive narrow barrier island
// Outer edge (Caribbean side)
const HOTEL_OUTER: [number, number][] = [
  [740, 170], [870, 140], [1020, 130], [1180, 140],
  [1340, 170], [1440, 230], [1500, 320], [1530, 440],
  [1540, 580], [1520, 720], [1480, 830], [1430, 900],
  [1380, 940],
];
// Inner edge (lagoon side)
const HOTEL_INNER: [number, number][] = [
  [1340, 890], [1390, 840], [1430, 760], [1460, 640],
  [1470, 500], [1460, 370], [1420, 260], [1340, 200],
  [1200, 170], [1040, 160], [880, 170], [760, 200],
];

// Micro-nodes – small service points distributed across the territory
interface MicroNode { x: number; y: number; domain: string; }
const MICRO_NODES: MicroNode[] = [
  // Mainland cluster – Identidad & administrative
  { x: 350, y: 300, domain: 'identidad' },
  { x: 420, y: 250, domain: 'identidad' },
  { x: 480, y: 350, domain: 'identidad' },
  // Mainland – Infraestructura
  { x: 380, y: 500, domain: 'infraestructura' },
  { x: 460, y: 560, domain: 'infraestructura' },
  { x: 540, y: 480, domain: 'infraestructura' },
  { x: 330, y: 620, domain: 'infraestructura' },
  // Movilidad – roads/bridges connecting zones
  { x: 620, y: 280, domain: 'movilidad' },
  { x: 700, y: 200, domain: 'movilidad' },
  { x: 580, y: 450, domain: 'movilidad' },
  { x: 500, y: 680, domain: 'movilidad' },
  // Hotel zone – Servicios Turísticos
  { x: 1100, y: 150, domain: 'turismo' },
  { x: 1280, y: 190, domain: 'turismo' },
  { x: 1430, y: 310, domain: 'turismo' },
  { x: 1480, y: 500, domain: 'turismo' },
  { x: 1460, y: 680, domain: 'turismo' },
  { x: 1400, y: 850, domain: 'turismo' },
  // Sensores – distributed everywhere
  { x: 280, y: 400, domain: 'sensores' },
  { x: 550, y: 200, domain: 'sensores' },
  { x: 440, y: 720, domain: 'sensores' },
  { x: 850, y: 300, domain: 'sensores' },
  { x: 1200, y: 400, domain: 'sensores' },
  { x: 1500, y: 600, domain: 'sensores' },
  // Núcleo de Inteligencia – central, connecting point
  { x: 600, y: 380, domain: 'inteligencia' },
  { x: 650, y: 500, domain: 'inteligencia' },
  { x: 560, y: 320, domain: 'inteligencia' },
];

// Domain anchor positions (where labels sit on the territory)
const DOMAIN_ANCHORS: Record<string, { x: number; y: number }> = {
  identidad:       { x: 400, y: 280 },
  infraestructura: { x: 420, y: 540 },
  movilidad:       { x: 640, y: 230 },
  turismo:         { x: 1320, y: 350 },
  sensores:        { x: 260, y: 460 },
  inteligencia:    { x: 580, y: 400 },
};

// Connections between domains (routes across territory)
const ROUTES: [string, string][] = [
  ['identidad', 'inteligencia'],
  ['identidad', 'movilidad'],
  ['identidad', 'infraestructura'],
  ['infraestructura', 'inteligencia'],
  ['infraestructura', 'sensores'],
  ['movilidad', 'turismo'],
  ['movilidad', 'inteligencia'],
  ['turismo', 'sensores'],
  ['sensores', 'inteligencia'],
  ['inteligencia', 'turismo'],
];

// Topographic-style contour rings
const CONTOURS: { cx: number; cy: number; r: number }[] = [
  { cx: 440, cy: 450, r: 180 },
  { cx: 440, cy: 450, r: 280 },
  { cx: 440, cy: 450, r: 380 },
  { cx: 850, cy: 500, r: 200 },
  { cx: 1300, cy: 500, r: 300 },
];

function drawPath(ctx: CanvasRenderingContext2D, pts: [number, number][], close = true) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]!;
    const curr = pts[i]!;
    const cpx = (prev[0] + curr[0]) / 2;
    const cpy = (prev[1] + curr[1]) / 2;
    ctx.quadraticCurveTo(prev[0], prev[1], cpx, cpy);
  }
  if (close) {
    const last = pts[pts.length - 1]!;
    const first = pts[0]!;
    const cpx = (last[0] + first[0]) / 2;
    const cpy = (last[1] + first[1]) / 2;
    ctx.quadraticCurveTo(last[0], last[1], cpx, cpy);
    ctx.closePath();
  }
}

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  progress: number;
  speed: number;
  domain: string;
}

export function CancunTopology({ domains, accentColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const accent = ACCENT[accentColor];
  const domainMap = useMemo(() => {
    const m = new Map<string, DomainState>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

  const getDomainColor = useCallback((domainId: string) => {
    const d = domainMap.get(domainId);
    if (!d) return accent;
    return STATUS_COLORS[d.status] ?? accent;
  }, [domainMap, accent]);

  const isStressed = useCallback((domainId: string) => {
    const d = domainMap.get(domainId);
    if (!d) return false;
    return d.status !== 'OPERATIVO' && d.status !== 'ESTABLE';
  }, [domainMap]);

  const isOffline = useCallback((domainId: string) => {
    const d = domainMap.get(domainId);
    if (!d) return false;
    return d.status === 'AISLADO' || d.status === 'REVOCADA' || d.status === 'FUERA DE SERVICIO';
  }, [domainMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1920;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Spawn particles along routes
    function spawnParticles() {
      const p: Particle[] = [];
      ROUTES.forEach(([fromId, toId]) => {
        const from = DOMAIN_ANCHORS[fromId];
        const to = DOMAIN_ANCHORS[toId];
        if (!from || !to) return;
        const fromD = domainMap.get(fromId);
        const toD = domainMap.get(toId);
        const act = Math.max(fromD?.activity ?? 30, toD?.activity ?? 30);
        const count = Math.max(1, Math.floor(act / 20));
        for (let i = 0; i < count; i++) {
          p.push({
            x: from.x, y: from.y,
            tx: to.x, ty: to.y,
            progress: Math.random(),
            speed: 0.0015 + Math.random() * 0.003 + (act / 15000),
            domain: fromId,
          });
        }
      });
      // Extra micro-node particles
      MICRO_NODES.forEach((mn) => {
        const anchor = DOMAIN_ANCHORS[mn.domain];
        if (!anchor) return;
        const d = domainMap.get(mn.domain);
        if (d && d.activity > 40) {
          p.push({
            x: mn.x, y: mn.y,
            tx: anchor.x, ty: anchor.y,
            progress: Math.random(),
            speed: 0.001 + Math.random() * 0.002,
            domain: mn.domain,
          });
        }
      });
      particlesRef.current = p;
    }

    spawnParticles();
    const respawn = setInterval(spawnParticles, 4000);

    let animFrame: number;
    let time = 0;

    function render() {
      if (!ctx) return;
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // === LAYER 0: Subtle coordinate grid ===
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.03)`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // === LAYER 1: Topographic contours ===
      ctx.lineWidth = 0.4;
      CONTOURS.forEach((c) => {
        ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.04)`;
        ctx.beginPath();
        ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // === LAYER 2: Mainland ===
      drawPath(ctx, MAINLAND);
      const mainGrad = ctx.createRadialGradient(440, 450, 50, 440, 450, 400);
      mainGrad.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.08)`);
      mainGrad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.02)`);
      ctx.fillStyle = mainGrad;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.2)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // === LAYER 3: Lagoon ===
      drawPath(ctx, LAGOON);
      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.03)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.12)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // Lagoon ripple
      const rippleAlpha = 0.03 + Math.sin(time * 0.5) * 0.02;
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${rippleAlpha})`;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.arc(850, 500, 120 + Math.sin(time * 0.3) * 20, 0, Math.PI * 2);
      ctx.stroke();

      // === LAYER 4: Hotel zone strip ===
      ctx.beginPath();
      ctx.moveTo(HOTEL_OUTER[0]![0], HOTEL_OUTER[0]![1]);
      for (let i = 1; i < HOTEL_OUTER.length; i++) {
        const prev = HOTEL_OUTER[i - 1]!;
        const curr = HOTEL_OUTER[i]!;
        ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2);
      }
      const lastOuter = HOTEL_OUTER[HOTEL_OUTER.length - 1]!;
      const firstInner = HOTEL_INNER[0]!;
      ctx.lineTo(lastOuter[0], lastOuter[1]);
      ctx.lineTo(firstInner[0], firstInner[1]);
      for (let i = 1; i < HOTEL_INNER.length; i++) {
        const prev = HOTEL_INNER[i - 1]!;
        const curr = HOTEL_INNER[i]!;
        ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2);
      }
      ctx.closePath();
      const hotelGrad = ctx.createLinearGradient(740, 170, 1480, 830);
      hotelGrad.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.06)`);
      hotelGrad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.03)`);
      ctx.fillStyle = hotelGrad;
      ctx.fill();
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.18)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // === LAYER 5: Coastline glow ===
      ctx.save();
      ctx.shadowColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.15)`;
      ctx.shadowBlur = 15;
      // Outer coast of hotel zone
      ctx.beginPath();
      ctx.moveTo(HOTEL_OUTER[0]![0], HOTEL_OUTER[0]![1]);
      for (let i = 1; i < HOTEL_OUTER.length; i++) {
        const prev = HOTEL_OUTER[i - 1]!;
        const curr = HOTEL_OUTER[i]!;
        ctx.quadraticCurveTo(prev[0], prev[1], (prev[0] + curr[0]) / 2, (prev[1] + curr[1]) / 2);
      }
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.1 + Math.sin(time * 0.8) * 0.04})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // === LAYER 6: Domain connection routes ===
      ROUTES.forEach(([fromId, toId]) => {
        const from = DOMAIN_ANCHORS[fromId];
        const to = DOMAIN_ANCHORS[toId];
        if (!from || !to) return;

        const stressed = isStressed(fromId) || isStressed(toId);
        const off = isOffline(fromId) || isOffline(toId);
        const col = stressed ? getDomainColor(fromId) : accent;
        const alpha = off ? 0.04 : stressed ? 0.15 : 0.06;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        // Curved route through midpoint
        const mx = (from.x + to.x) / 2 + (from.y - to.y) * 0.15;
        const my = (from.y + to.y) / 2 + (to.x - from.x) * 0.15;
        ctx.quadraticCurveTo(mx, my, to.x, to.y);
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
        ctx.lineWidth = stressed ? 1.5 : 0.8;
        if (stressed && !off) {
          ctx.setLineDash([6, 6]);
          ctx.lineDashOffset = -time * 30;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // === LAYER 7: Micro-nodes ===
      MICRO_NODES.forEach((mn, i) => {
        const col = getDomainColor(mn.domain);
        const off = isOffline(mn.domain);
        const pulse = Math.sin(time * 1.5 + i * 0.7) * 0.5 + 0.5;
        const alpha = off ? 0.05 : 0.15 + pulse * 0.2;
        const radius = off ? 1.5 : 2 + pulse * 0.8;

        ctx.beginPath();
        ctx.arc(mn.x, mn.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
        ctx.fill();
      });

      // === LAYER 8: Domain anchor zones ===
      Object.entries(DOMAIN_ANCHORS).forEach(([id, pos]) => {
        const d = domainMap.get(id);
        if (!d) return;
        const col = getDomainColor(id);
        const off = isOffline(id);
        const stressed_d = isStressed(id);

        // Zone glow
        if (!off) {
          const glowR = stressed_d ? 60 + Math.sin(time * 2) * 10 : 45;
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowR);
          glowGrad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${stressed_d ? 0.12 : 0.06})`);
          glowGrad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
          ctx.fillStyle = glowGrad;
          ctx.fillRect(pos.x - glowR, pos.y - glowR, glowR * 2, glowR * 2);
        }

        // Center dot
        const dotR = off ? 3 : stressed_d ? 5 + Math.sin(time * 3) * 1 : 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = off
          ? 'rgba(80, 95, 110, 0.3)'
          : `rgba(${col.r}, ${col.g}, ${col.b}, 0.9)`;
        ctx.fill();

        // Outer ring
        if (!off) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${stressed_d ? 0.35 : 0.15})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (stressed_d && !off) {
          const pulseR = 20 + (time * 15) % 30;
          const pulseA = Math.max(0, 0.2 - (pulseR - 20) / 150);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${pulseA})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // === LAYER 9: Particles ===
      particlesRef.current.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const col = getDomainColor(p.domain);
        const off = isOffline(p.domain);
        if (off) return;

        // Follow curved route
        const from = DOMAIN_ANCHORS[p.domain];
        if (!from) return;
        const t = p.progress;
        const mx = (from.x + p.tx) / 2 + (from.y - p.ty) * 0.15;
        const my = (from.y + p.ty) / 2 + (p.tx - from.x) * 0.15;
        const x = (1 - t) * (1 - t) * p.x + 2 * (1 - t) * t * mx + t * t * p.tx;
        const y = (1 - t) * (1 - t) * p.y + 2 * (1 - t) * t * my + t * t * p.ty;
        const alpha = Math.sin(t * Math.PI) * 0.6;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(render);
    }

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(respawn);
    };
  }, [domainMap, accent, getDomainColor, isStressed, isOffline]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  );
}
