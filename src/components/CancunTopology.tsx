import { useEffect, useRef, useMemo } from 'react';
import type { DomainState } from '../types';

interface Props {
  domains: DomainState[];
  accentColor: 'teal' | 'amber' | 'red';
}

const STATUS_COLORS: Record<string, string> = {
  OPERATIVO: '#2a8a8a',
  ESTABLE: '#27ae60',
  ADVERTENCIA: '#d4913a',
  ALERTA: '#e67e22',
  'CRÍTICO': '#c0392b',
  AISLANDO: '#d4913a',
  AISLADO: '#6b7f95',
  REVOCANDO: '#d4913a',
  REVOCADA: '#6b7f95',
  'FUERA DE SERVICIO': '#c0392b',
  CONTENIDO: '#27ae60',
};

const ACCENT_MAP = {
  teal: { primary: '#2a8a8a', glow: '#3bb5b044', line: '#2a8a8a55' },
  amber: { primary: '#d4913a', glow: '#f0a84844', line: '#d4913a55' },
  red: { primary: '#c0392b', glow: '#e74c3c44', line: '#c0392b55' },
};

// Node positions on the SVG - hybrid Cancún territorial layout
// Continental area on the left, hotel zone corridor curving to the right
const NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  identidad:       { x: 280, y: 210 },
  infraestructura: { x: 480, y: 380 },
  movilidad:       { x: 200, y: 440 },
  turismo:         { x: 680, y: 230 },
  sensores:        { x: 620, y: 450 },
  inteligencia:    { x: 440, y: 160 },
};

// Connections between domains
const CONNECTIONS: [string, string][] = [
  ['inteligencia', 'identidad'],
  ['inteligencia', 'infraestructura'],
  ['inteligencia', 'sensores'],
  ['inteligencia', 'turismo'],
  ['identidad', 'movilidad'],
  ['identidad', 'infraestructura'],
  ['infraestructura', 'sensores'],
  ['infraestructura', 'movilidad'],
  ['turismo', 'sensores'],
  ['turismo', 'movilidad'],
];

// Cancún territory outline (simplified) - a subtle background shape
const TERRITORY_PATH = `
  M 160,120 
  C 200,100 320,90 400,110
  C 460,125 520,100 600,120
  C 680,150 740,200 730,260
  C 720,340 700,400 720,460
  C 730,500 680,520 640,510
  C 580,490 520,500 460,480
  C 380,460 300,490 220,470
  C 160,450 130,400 140,340
  C 150,280 140,200 160,120
  Z
`;

// Lagoon shape inside territory
const LAGOON_PATH = `
  M 260,260
  C 300,240 380,250 400,280
  C 420,310 400,350 360,360
  C 320,370 270,350 260,320
  C 250,290 240,270 260,260
  Z
`;

export function CancunTopology({ domains, accentColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const accent = ACCENT_MAP[accentColor];
  const domainMap = useMemo(() => {
    const m = new Map<string, DomainState>();
    domains.forEach((d) => m.set(d.id, d));
    return m;
  }, [domains]);

  // Particle animation on canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 900;
    canvas.height = 600;

    interface Particle {
      fromX: number; fromY: number;
      toX: number; toY: number;
      progress: number;
      speed: number;
      color: string;
    }

    let particles: Particle[] = [];
    let animFrame: number;

    function spawnParticles() {
      particles = [];
      CONNECTIONS.forEach(([fromId, toId]) => {
        const from = NODE_LAYOUT[fromId];
        const to = NODE_LAYOUT[toId];
        if (!from || !to) return;
        const fromDomain = domainMap.get(fromId);
        const toDomain = domainMap.get(toId);
        const activity = Math.max(fromDomain?.activity ?? 30, toDomain?.activity ?? 30);
        const count = Math.max(1, Math.floor(activity / 25));
        for (let i = 0; i < count; i++) {
          particles.push({
            fromX: from.x, fromY: from.y,
            toX: to.x, toY: to.y,
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003 + (activity / 10000),
            color: accent.primary,
          });
        }
      });
    }

    spawnParticles();

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const x = p.fromX + (p.toX - p.fromX) * p.progress;
        const y = p.fromY + (p.toY - p.fromY) * p.progress;
        const alpha = Math.sin(p.progress * Math.PI) * 0.8;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      animFrame = requestAnimationFrame(animate);
    }

    animate();

    const respawnInterval = setInterval(spawnParticles, 3000);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(respawnInterval);
    };
  }, [domainMap, accent.primary]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 900 600" className="w-full h-full max-h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="territory-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent.primary} stopOpacity="0.06" />
            <stop offset="100%" stopColor={accent.primary} stopOpacity="0.01" />
          </radialGradient>
          <radialGradient id="lagoon-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent.primary} stopOpacity="0.04" />
            <stop offset="100%" stopColor={accent.primary} stopOpacity="0.01" />
          </radialGradient>
        </defs>

        {/* Territory silhouette */}
        <path d={TERRITORY_PATH} fill="url(#territory-grad)" stroke={accent.line} strokeWidth="0.5" />
        <path d={LAGOON_PATH} fill="url(#lagoon-grad)" stroke={accent.line} strokeWidth="0.3" />

        {/* Grid overlay for territory */}
        <g opacity="0.05" stroke={accent.primary}>
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`h${i}`} x1="100" y1={80 + i * 40} x2="800" y2={80 + i * 40} strokeWidth="0.3" />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`v${i}`} x1={100 + i * 45} y1="80" x2={100 + i * 45} y2="540" strokeWidth="0.3" />
          ))}
        </g>

        {/* Connections */}
        {CONNECTIONS.map(([fromId, toId]) => {
          const from = NODE_LAYOUT[fromId];
          const to = NODE_LAYOUT[toId];
          if (!from || !to) return null;
          const fromDomain = domainMap.get(fromId);
          const toDomain = domainMap.get(toId);
          const isStressed =
            (fromDomain && fromDomain.status !== 'OPERATIVO' && fromDomain.status !== 'ESTABLE') ||
            (toDomain && toDomain.status !== 'OPERATIVO' && toDomain.status !== 'ESTABLE');
          const lineColor = isStressed ? accent.primary : '#1e2a38';

          return (
            <g key={`${fromId}-${toId}`}>
              <line
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={lineColor}
                strokeWidth={isStressed ? 1.2 : 0.6}
                opacity={isStressed ? 0.6 : 0.25}
                strokeDasharray={isStressed ? '4 4' : 'none'}
                style={isStressed ? { animation: 'data-flow 1s linear infinite' } : undefined}
              />
            </g>
          );
        })}

        {/* Domain nodes */}
        {Object.entries(NODE_LAYOUT).map(([id, pos]) => {
          const domain = domainMap.get(id);
          if (!domain) return null;
          const color = STATUS_COLORS[domain.status] ?? accent.primary;
          const isNormal = domain.status === 'OPERATIVO' || domain.status === 'ESTABLE';
          const isOffline = domain.status === 'AISLADO' || domain.status === 'REVOCADA' || domain.status === 'FUERA DE SERVICIO';
          const ringRadius = 28;

          return (
            <g key={id} style={{ transition: 'all 0.8s ease' }}>
              {/* Outer glow */}
              {!isNormal && !isOffline && (
                <circle
                  cx={pos.x} cy={pos.y} r={ringRadius + 8}
                  fill="none" stroke={color} strokeWidth="1"
                  opacity="0.2" filter="url(#glow-strong)"
                  className="animate-pulse-slow"
                />
              )}

              {/* Activity ring */}
              <circle
                cx={pos.x} cy={pos.y} r={ringRadius}
                fill="none" stroke={color}
                strokeWidth={isOffline ? 1 : 2}
                opacity={isOffline ? 0.3 : 0.5}
                strokeDasharray={`${(domain.activity / 100) * (2 * Math.PI * ringRadius)} ${2 * Math.PI * ringRadius}`}
                transform={`rotate(-90 ${pos.x} ${pos.y})`}
                style={{ transition: 'all 1.2s ease' }}
              />

              {/* Center circle */}
              <circle
                cx={pos.x} cy={pos.y} r={isOffline ? 6 : 8}
                fill={isOffline ? '#1e2a38' : color}
                opacity={isOffline ? 0.5 : 0.9}
                filter={isNormal ? undefined : 'url(#glow)'}
                style={{ transition: 'all 0.8s ease' }}
              />

              {/* Label */}
              <text
                x={pos.x} y={pos.y + ringRadius + 18}
                textAnchor="middle"
                fill="#c8d6e5"
                fontSize="11"
                fontFamily="Inter, sans-serif"
                fontWeight="500"
                letterSpacing="0.02em"
              >
                {domain.label}
              </text>

              {/* Status label */}
              <text
                x={pos.x} y={pos.y + ringRadius + 33}
                textAnchor="middle"
                fill={color}
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="400"
                letterSpacing="0.05em"
                opacity="0.8"
              >
                {domain.status}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Particle overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}
