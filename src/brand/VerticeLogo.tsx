import { useTheme } from './ThemeContext';

export function VerticeIsotipo({ size = 44, mono = false }: { size?: number; mono?: boolean }) {
  const { theme: T } = useTheme();
  const accent = T.mode === 'midnight' ? '#4A90F0' : '#6CB2FF';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="12" fill={mono ? T.INK.primary : T.BRAND.navy} />
      <path d="M11.5 12.5 L24 35.5 L36.5 12.5" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 12.5 L24 24.5 L30.5 12.5" stroke={mono ? '#9FB4CE' : accent} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="35.5" r="2.4" fill="#fff" />
    </svg>
  );
}

export function VerticeBrand({ size = 44 }: { size?: number }) {
  const { theme: T } = useTheme();
  return (
    <div className="flex items-center" style={{ gap: size * 0.34 }}>
      <VerticeIsotipo size={size} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: size * 0.58, fontWeight: 620, letterSpacing: '0.18em', color: T.INK.primary }}>VÉRTICE</div>
        <div style={{ fontSize: size * 0.24, fontWeight: 540, letterSpacing: '0.32em', color: T.INK.faint, marginTop: size * 0.16 }}>
          SISTEMAS URBANOS
        </div>
      </div>
    </div>
  );
}
