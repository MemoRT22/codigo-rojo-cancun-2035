import { useTheme } from '../../brand/ThemeContext';
import { VerticeIsotipo } from '../../brand/VerticeLogo';
import type { StationRole } from './roles';

/**
 * Pantalla de espera común: el puesto operativo, preparado. Si la estación tiene rol, presenta quién eres,
 * qué observas y la pregunta con la que empiezas (solo método de pensamiento; sin respuestas ni tutorial).
 * Sin rol (p. ej. Respuesta) conserva la pantalla genérica «Estación preparada».
 */
export function WaitingScreen({ label, role }: { label: string; role?: StationRole }) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = {
    background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '1.1rem', boxShadow: `0 10px 36px ${T.SURFACE.shadow}`,
  };
  const status = (
    <div className="inline-flex items-center" style={{ gap: '0.6rem', fontSize: '0.9375rem', fontWeight: 620, letterSpacing: '0.14em', color: T.INK.secondary, textTransform: 'uppercase' }}>
      <span className="animate-status" style={{ width: 10, height: 10, borderRadius: 5, background: T.INK.faint }} />
      Esperando activación de VÉRTICE
    </div>
  );

  if (!role) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center" style={{ ...card, padding: '3rem 4rem', minWidth: '30rem' }}>
          <div className="inline-flex"><VerticeIsotipo size={64} /></div>
          <div style={{ fontSize: '0.875rem', fontWeight: 650, letterSpacing: '0.2em', color: T.INK.secondary, marginTop: '1.25rem' }}>{label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 620, marginTop: '0.9rem', letterSpacing: '-0.01em' }}>Estación preparada</div>
          <div style={{ marginTop: '0.9rem' }}>{status}</div>
        </div>
      </div>
    );
  }

  const cap: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.16em', color: T.INK.secondary, textTransform: 'uppercase' };
  return (
    <div className="h-full flex items-center justify-center">
      <div style={{ ...card, padding: '2.75rem 3.5rem 2.25rem', width: '44rem', maxWidth: '92%' }}>
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <VerticeIsotipo size={48} />
          <div style={{ fontSize: '0.9375rem', fontWeight: 620, letterSpacing: '0.2em', color: T.INK.secondary }}>VÉRTICE</div>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 650, letterSpacing: '-0.012em', lineHeight: 1.15, marginTop: '1.6rem', textTransform: 'uppercase' }}>{role.title}</h1>

        <div style={{ ...cap, marginTop: '1.6rem' }}>Tu responsabilidad</div>
        <div style={{ fontSize: '1.2rem', lineHeight: 1.45, marginTop: '0.35rem' }}>{role.responsibility}</div>

        <div style={{ ...cap, marginTop: '1.4rem' }}>Observa</div>
        <div className="flex flex-wrap" style={{ gap: '0.45rem', marginTop: '0.55rem' }}>
          {role.observes.map((o) => (
            <span key={o} style={{ padding: '0.3rem 0.8rem', borderRadius: 999, border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, fontSize: '0.9375rem', fontWeight: 560 }}>{o}</span>
          ))}
        </div>

        <div style={{ ...cap, marginTop: '1.4rem' }}>Pregunta de inicio</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.35, marginTop: '0.35rem' }}>{role.question}</div>

        <div style={{ fontSize: '0.9375rem', color: T.INK.secondary, marginTop: '1.1rem', fontStyle: 'italic' }}>{role.rule}</div>

        <div style={{ borderTop: `1px solid ${T.SURFACE.hairlineSoft}`, marginTop: '1.75rem', paddingTop: '1.25rem' }}>{status}</div>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
