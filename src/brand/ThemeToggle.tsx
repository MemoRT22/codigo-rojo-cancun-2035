import { useTheme } from './ThemeContext';

/**
 * Selector DAY ↔ MIDNIGHT. Mismo componente y misma posición (arriba a la derecha) en VÉRTICE y
 * en todas las estaciones. Es un control normal del producto, no de desarrollo.
 */
export function ThemeToggle() {
  const { theme: T, mode, toggle } = useTheme();
  const night = mode === 'midnight';
  const label = night ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={night}
      aria-label="Modo nocturno"
      title={label}
      onClick={toggle}
      className="inline-flex items-center justify-center"
      style={{ width: 64, height: 44, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 12 }}
    >
      <span
        aria-hidden
        style={{
          position: 'relative', width: 52, height: 28, borderRadius: 14, display: 'block',
          background: night ? T.SURFACE.hairline : T.SURFACE.hairlineSoft,
          border: `1px solid ${night ? T.INK.faint : T.SURFACE.hairline}`,
          boxShadow: `inset 0 1px 2px ${T.SURFACE.shadow}`,
        }}
      >
        {/* Iconos de referencia en la pista: el estado no depende de un solo símbolo */}
        <span style={{ position: 'absolute', left: 7, top: 5, opacity: night ? 0.55 : 0 }}><Sun size={16} color={T.INK.secondary} /></span>
        <span style={{ position: 'absolute', right: 7, top: 5, opacity: night ? 0 : 0.55 }}><Moon size={16} color={T.INK.secondary} /></span>
        {/* Perilla */}
        <span
          style={{
            position: 'absolute', top: 2, left: night ? 26 : 2, width: 22, height: 22, borderRadius: 11,
            background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`,
            boxShadow: `0 1px 3px ${T.SURFACE.shadow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'left .35s cubic-bezier(.4,.1,.2,1)',
          }}
        >
          {night ? <Moon size={14} color={T.BRAND.blue} /> : <Sun size={14} color={T.STATUS.warn} />}
        </span>
      </span>
    </button>
  );
}

const S = { fill: 'none', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Sun({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke={color} {...S} />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke={color} {...S} />
    </svg>
  );
}

function Moon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" stroke={color} {...S} />
    </svg>
  );
}
