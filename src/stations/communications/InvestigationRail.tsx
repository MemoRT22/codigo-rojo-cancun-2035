import { useTheme } from '../../brand/ThemeContext';
import { IconCheck, IconMail, IconSpark, IconTrace } from '../shell/icons';
import type { StationPhase } from '../shell/types';
import type { HelpLevel } from './logic';
import type { Message } from './types';

interface Props {
  phase: StationPhase;
  linked: Message[];
  help: HelpLevel;
  trace: string[];
}

export function InvestigationRail({ phase, linked, help, trace }: Props) {
  const { theme: T } = useTheme();
  const card: React.CSSProperties = {
    background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, padding: '1.1rem 1.2rem',
  };
  const label: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.INK.secondary, textTransform: 'uppercase' };
  const found = phase === 'EVIDENCE_FOUND' || (phase === 'MISSION_FINISHED' && linked.length > 0);

  return (
    <aside className="flex flex-col min-h-0" style={{ gap: '1rem' }} aria-label="Investigación">
      <section style={card}>
        <div className="flex items-center justify-between">
          <span style={label}>Investigación actual</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: T.INK.secondary }}>{linked.length} {linked.length === 1 ? 'comunicación' : 'comunicaciones'}</span>
        </div>

        {linked.length === 0 ? (
          <div style={{ marginTop: '0.9rem', fontSize: '0.9375rem', color: T.INK.secondary, lineHeight: 1.5 }}>
            Ninguna comunicación vinculada todavía. Las comunicaciones que agregues aparecerán aquí.
          </div>
        ) : (
          linked.map((m) => (
            <div
              key={m.id}
              className="animate-fade-in-up"
              style={{ marginTop: '0.9rem', padding: '0.85rem 0.95rem', borderRadius: '0.75rem', border: `1px solid ${T.STATUS.info}44`, background: `${T.STATUS.info}0F` }}
            >
              <div className="flex items-start" style={{ gap: '0.65rem' }}>
                <span style={{ marginTop: 2 }}><IconMail size={18} color={T.STATUS.info} /></span>
                <div className="min-w-0">
                  <div style={{ fontSize: '0.9375rem', fontWeight: 620, lineHeight: 1.35 }}>{m.subject}</div>
                  <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.2rem' }}>{m.senderName} · {m.time}</div>
                </div>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: '0.7rem', paddingTop: '0.6rem', borderTop: `1px solid ${T.STATUS.info}33` }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: T.STATUS.info }}>EVIDENCIA</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 650, letterSpacing: '0.03em' }}>{m.evidence}</span>
              </div>
            </div>
          ))
        )}

        {found && (
          <div className="animate-fade-in-up" style={{ marginTop: '0.9rem' }}>
            <StatusLine icon={<IconCheck size={16} color={T.STATUS.ok} />} text="Evidencia registrada y enviada" />
            <StatusLine icon={<span className="animate-status" style={{ width: 9, height: 9, borderRadius: 5, background: T.STATUS.warn, display: 'inline-block', margin: '0 3.5px' }} />} text="En espera de correlación" />
          </div>
        )}
      </section>

      {help > 0 && phase === 'ACTIVE' && (
        <section className="animate-fade-in-up" style={{ ...card, borderColor: `${T.BRAND.blue}44` }}>
          <div className="flex items-center" style={{ gap: '0.5rem' }}>
            <IconSpark size={17} color={T.BRAND.blue} />
            <span style={{ ...label, color: T.BRAND.blue }}>VÉRTICE · Asistente de análisis</span>
          </div>
          <div style={{ marginTop: '0.7rem', fontSize: '0.9375rem', lineHeight: 1.55 }}>
            VÉRTICE detecta comunicaciones recientes con metadatos que conviene revisar.
          </div>
          {help > 1 && (
            <div className="animate-fade-in-up" style={{ marginTop: '0.7rem', fontSize: '0.9375rem', lineHeight: 1.55, color: T.INK.secondary }}>
              <span style={{ fontWeight: 650, color: T.INK.primary }}>Sugerencia de análisis:</span> compara remitente, dominio y horario. Un mensaje urgente no necesariamente es malicioso.
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col min-h-0 flex-1" style={card}>
        <div className="flex items-center" style={{ gap: '0.5rem' }}>
          <IconTrace size={16} color={T.INK.secondary} />
          <span style={label}>Historial de análisis</span>
        </div>
        <ol style={{ marginTop: '0.8rem', listStyle: 'none', overflowY: 'auto' }}>
          {trace.length === 0 && <li style={{ fontSize: '0.9rem', color: T.INK.secondary }}>Aún no hay actividad de análisis en esta sesión.</li>}
          {trace.map((t, i) => (
            <li key={`${t}-${i}`} className="flex items-start" style={{ gap: '0.6rem', padding: '0.4rem 0', opacity: Math.max(0.55, 1 - i * 0.1) }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: T.INK.faint, marginTop: '0.5rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>{t}</span>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}

function StatusLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: '0.5rem', padding: '0.2rem 0', fontSize: '0.9rem', fontWeight: 560 }}>
      <span className="inline-flex" style={{ width: 16, justifyContent: 'center' }}>{icon}</span>
      {text}
    </div>
  );
}
