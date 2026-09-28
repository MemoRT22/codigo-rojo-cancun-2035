import type { DomainId } from './tokens';

interface IconProps { size?: number; color: string }

const P = { strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

function Identidad({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke={color} {...P} />
      <circle cx="12" cy="10" r="2.6" stroke={color} {...P} />
      <path d="M6.8 17.4 C8 15.2 9.8 14.4 12 14.4 C14.2 14.4 16 15.2 17.2 17.4" stroke={color} {...P} />
    </svg>
  );
}
function Infraestructura({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="4.5" y="4" width="15" height="6.4" rx="1.8" stroke={color} {...P} />
      <rect x="4.5" y="13.6" width="15" height="6.4" rx="1.8" stroke={color} {...P} />
      <circle cx="8" cy="7.2" r="0.9" fill={color} />
      <circle cx="8" cy="16.8" r="0.9" fill={color} />
    </svg>
  );
}
function Movilidad({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="6" cy="18" r="2" stroke={color} {...P} />
      <circle cx="18" cy="6" r="2" stroke={color} {...P} />
      <path d="M8 18 H13 A3.5 3.5 0 0 0 13 11 H11 A3.5 3.5 0 0 1 11 4 H16" stroke={color} {...P} />
    </svg>
  );
}
function Turismo({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.2 L19 7.2 V15.2 L12 19.2 L5 15.2 V7.2 Z" stroke={color} {...P} />
      <path d="M12 3.2 V10.8 M12 10.8 L19 7.2 M12 10.8 L5 7.2" stroke={color} {...P} opacity="0.55" />
    </svg>
  );
}
function Sensores({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="2.2" fill={color} />
      <circle cx="12" cy="12" r="5.8" stroke={color} {...P} opacity="0.75" />
      <circle cx="12" cy="12" r="9.2" stroke={color} {...P} opacity="0.4" />
    </svg>
  );
}
function Inteligencia({ size = 22, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.6 L20 12 L12 20.4 L4 12 Z" stroke={color} {...P} />
      <circle cx="12" cy="12" r="2.4" fill={color} />
    </svg>
  );
}

export const DOMAIN_ICONS: Record<DomainId, (p: IconProps) => React.JSX.Element> = {
  identidad: Identidad,
  infraestructura: Infraestructura,
  movilidad: Movilidad,
  turismo: Turismo,
  sensores: Sensores,
  inteligencia: Inteligencia,
};
