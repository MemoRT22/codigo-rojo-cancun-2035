import { BRAND, INK } from './tokens';

/**
 * Isotipo VÉRTICE: dos planos que convergen en un vértice. El chevrón exterior es la ciudad; el
 * interior, la capa de inteligencia que la lee. Sobrio, sin brillo, pensado como marca de producto.
 */
export function VerticeIsotipo({ size = 44, mono = false }: { size?: number; mono?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="11" fill={mono ? INK.primary : BRAND.navy} />
      <path d="M11.5 12.5 L24 35.5 L36.5 12.5" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 12.5 L24 24.5 L30.5 12.5" stroke={mono ? '#9FB4CE' : '#5B9BFF'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="35.5" r="2.5" fill="#fff" />
    </svg>
  );
}

export function VerticeBrand({ size = 44 }: { size?: number }) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.32 }}>
      <VerticeIsotipo size={size} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: size * 0.6, fontWeight: 650, letterSpacing: '0.16em', color: INK.primary }}>VÉRTICE</div>
        <div style={{ fontSize: size * 0.25, fontWeight: 600, letterSpacing: '0.34em', color: INK.tertiary, marginTop: size * 0.16 }}>
          SISTEMAS URBANOS
        </div>
      </div>
    </div>
  );
}
