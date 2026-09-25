import { CORP } from './tokens';

interface LogoProps {
  size?: number;
  color?: string;
}

// Isotipo: three systems converging at a vertex point,
// suggesting urban connectivity and a stylised "V".
export function VerticeIsotipo({ size = 40, color = CORP.verticeBlue }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Left arm — two connected segments */}
      <path d="M 6 8 L 16 22 L 24 40" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right arm */}
      <path d="M 42 8 L 32 22 L 24 40" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Center vertical — intelligence/core axis */}
      <path d="M 24 4 L 24 40" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      {/* Cross connection — network link */}
      <path d="M 16 22 L 32 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Endpoint nodes */}
      <circle cx="6"  cy="8"  r="2.2" fill={color} />
      <circle cx="42" cy="8"  r="2.2" fill={color} />
      <circle cx="24" cy="4"  r="1.8" fill={color} opacity="0.6" />
      {/* Mid-junction nodes */}
      <circle cx="16" cy="22" r="2" fill={color} opacity="0.7" />
      <circle cx="32" cy="22" r="2" fill={color} opacity="0.7" />
      {/* Vertex — the convergence point */}
      <circle cx="24" cy="40" r="3.5" fill={color} />
      <circle cx="24" cy="40" r="6" fill="none" stroke={color} strokeWidth="0.8" opacity="0.25" />
    </svg>
  );
}

// Full brand lockup: isotipo + wordmark + descriptor
interface BrandProps {
  compact?: boolean;
}

export function VerticeBrand({ compact = false }: BrandProps) {
  return (
    <div className="flex items-center gap-4">
      <VerticeIsotipo size={compact ? 32 : 44} />
      <div>
        <div
          className="font-semibold tracking-[0.3em] leading-none"
          style={{
            fontSize: compact ? '22px' : '30px',
            color: CORP.textPrimary,
          }}
        >
          VÉRTICE
        </div>
        <div
          className="tracking-[0.18em] uppercase leading-none mt-1"
          style={{
            fontSize: compact ? '8px' : '10px',
            color: CORP.textTertiary,
          }}
        >
          Sistemas Urbanos
        </div>
      </div>
    </div>
  );
}
