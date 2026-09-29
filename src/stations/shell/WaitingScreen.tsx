import { useTheme } from '../../brand/ThemeContext';
import { VerticeIsotipo } from '../../brand/VerticeLogo';

/** Pantalla de espera común («Estación preparada · Esperando inicio de sesión»). */
export function WaitingScreen({ label }: { label: string }) {
  const { theme: T } = useTheme();
  return (
    <div className="h-full flex items-center justify-center">
      <div
        className="text-center"
        style={{ padding: '3rem 4rem', background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '1.1rem', boxShadow: `0 10px 36px ${T.SURFACE.shadow}`, minWidth: '30rem' }}
      >
        <div className="inline-flex"><VerticeIsotipo size={64} /></div>
        <div style={{ fontSize: '0.875rem', fontWeight: 650, letterSpacing: '0.2em', color: T.INK.secondary, marginTop: '1.25rem' }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 620, marginTop: '0.9rem', letterSpacing: '-0.01em' }}>Estación preparada</div>
        <div className="inline-flex items-center" style={{ gap: '0.6rem', marginTop: '0.7rem', fontSize: '1.05rem', color: T.INK.secondary }}>
          <span className="animate-status" style={{ width: 9, height: 9, borderRadius: 5, background: T.INK.faint }} />
          Esperando inicio de sesión
        </div>
      </div>
    </div>
  );
}
