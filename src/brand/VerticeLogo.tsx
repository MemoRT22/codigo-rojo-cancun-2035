import { CORP } from './tokens';

interface LogoProps {
  size?: number;
  color?: string;
}

export function VerticeIsotipo({ size = 40, color = CORP.verticeBlue }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Left convergence arm */}
      <path d="M 8 6 L 24 38" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      {/* Right convergence arm */}
      <path d="M 40 6 L 24 38" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      {/* Horizontal system link */}
      <path d="M 14 18 L 34 18" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      {/* Vertex point — convergence */}
      <circle cx="24" cy="38" r="3" fill={color} />
      {/* System nodes at arms */}
      <circle cx="8" cy="6" r="2" fill={color} opacity="0.6" />
      <circle cx="40" cy="6" r="2" fill={color} opacity="0.6" />
    </svg>
  );
}

interface BrandProps {
  compact?: boolean;
}

export function VerticeBrand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-3">
      <VerticeIsotipo size={compact ? 28 : 38} />
      <div>
        <div
          className="font-semibold tracking-[0.25em] leading-none"
          style={{
            fontSize: compact ? '20px' : '26px',
            color: CORP.textPrimary,
          }}
        >
          VÉRTICE
        </div>
        <div
          className="tracking-[0.16em] uppercase leading-none mt-1"
          style={{
            fontSize: compact ? '8px' : '9.5px',
            color: CORP.textTertiary,
            fontWeight: 500,
          }}
        >
          Sistemas Urbanos
        </div>
      </div>
    </div>
  );
}
