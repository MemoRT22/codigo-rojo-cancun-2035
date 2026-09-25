// Coherent monoline icon family — shared stroke width and geometry.

interface IconProps {
  size?: number;
  color?: string;
}

const D = { strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

export function IconIdentidad({ size = 18, color = '#9b7aff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke={color} {...D} />
      <circle cx="12" cy="10" r="3" stroke={color} {...D} />
      <path d="M 7 18 C 7 15 9 14 12 14 C 15 14 17 15 17 18" stroke={color} {...D} />
    </svg>
  );
}

export function IconInfraestructura({ size = 18, color = '#e8923a' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="6" y="3" width="12" height="8" rx="1.5" stroke={color} {...D} />
      <rect x="6" y="13" width="12" height="8" rx="1.5" stroke={color} {...D} />
      <circle cx="9" cy="7" r="1" fill={color} />
      <circle cx="9" cy="17" r="1" fill={color} />
      <line x1="12" y1="7" x2="16" y2="7" stroke={color} {...D} />
      <line x1="12" y1="17" x2="16" y2="17" stroke={color} {...D} />
    </svg>
  );
}

export function IconMovilidad({ size = 18, color = '#4d9fff' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M 3 12 L 9 12 L 12 6 L 15 18 L 18 12 L 21 12" stroke={color} {...D} />
      <circle cx="3" cy="12" r="1.5" fill={color} opacity="0.5" />
      <circle cx="21" cy="12" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

export function IconTurismo({ size = 18, color = '#22c5c5' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M 12 2 L 12 2 C 16 2 19 5 19 9 C 19 14 12 22 12 22 C 12 22 5 14 5 9 C 5 5 8 2 12 2Z" stroke={color} {...D} />
      <circle cx="12" cy="9" r="3" stroke={color} {...D} />
    </svg>
  );
}

export function IconSensores({ size = 18, color = '#7acc29' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="2" fill={color} />
      <circle cx="12" cy="12" r="6" stroke={color} {...D} opacity="0.6" />
      <circle cx="12" cy="12" r="10" stroke={color} {...D} opacity="0.3" />
    </svg>
  );
}

export function IconInteligencia({ size = 18, color = '#b065f0' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="2" stroke={color} {...D} />
      <circle cx="5" cy="14" r="2" stroke={color} {...D} />
      <circle cx="19" cy="14" r="2" stroke={color} {...D} />
      <circle cx="12" cy="20" r="2" stroke={color} {...D} />
      <line x1="12" y1="7" x2="5" y2="12" stroke={color} {...D} opacity="0.5" />
      <line x1="12" y1="7" x2="19" y2="12" stroke={color} {...D} opacity="0.5" />
      <line x1="5" y1="16" x2="12" y2="18" stroke={color} {...D} opacity="0.5" />
      <line x1="19" y1="16" x2="12" y2="18" stroke={color} {...D} opacity="0.5" />
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.4" />
    </svg>
  );
}

export const DOMAIN_ICONS: Record<string, React.FC<IconProps>> = {
  identidad: IconIdentidad,
  infraestructura: IconInfraestructura,
  movilidad: IconMovilidad,
  turismo: IconTurismo,
  sensores: IconSensores,
  inteligencia: IconInteligencia,
};
