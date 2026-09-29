import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '../brand/ThemeContext';
import { VerticeBrand } from '../brand/VerticeLogo';
import { W, H } from '../map/scene';
import type { MissionState } from '../mission/types';
import { OUTCOMES } from '../stations/response/logic';
import { planName } from '../stations/response/ResponsePlans';

// ── VÉRTICE · CIERRE DE MISIÓN ──
// Apoyo visual del debrief que dice el facilitador (docs/pilot/debrief.md): diagramas, cronología, frases clave y conceptos; no repite el guion.
// Es presentación del host (estado local de la LED): no toca MissionState, ni eventos, ni estaciones. Lo abre el facilitador desde su consola.

export type DebriefPhase = 'off' | 'open' | 'ending';

const FADE_MS = 1000;
const STEP_LABELS = ['Reconstruir', 'Entender', 'Conectar'];

const CHAIN: { label: string; time: string; id?: string }[] = [
  { label: 'Correo fraudulento', time: '09:11:08', id: 'COR-512' },
  { label: 'Identidad comprometida', time: '09:16:04', id: 'ACC-417' },
  { label: 'Acceso anómalo', time: '09:16:51' },
  { label: 'SIN-04', time: '09:17:22', id: 'NOD-204' },
  { label: 'Propagación', time: '09:18:36', id: 'AGR-27' },
  { label: 'Inteligencia detecta el patrón', time: '09:20:11' },
];

const AI_DID = ['Detectó desviaciones', 'Agrupó señales', 'Calculó confianza', 'Propuso hipótesis'];
const TEAM_DID = ['Comparó cronología', 'Conectó evidencia', 'Cuestionó hipótesis', 'Tomó la decisión'];
const CYBER = [['Investigar', 'comunicaciones, identidades, sesiones'], ['Correlacionar', 'evidencia entre sistemas'], ['Responder', 'evaluar impacto y contener'], ['Proteger', 'preservar lo que no está afectado']] as const;
const AI = [['Detectar', 'patrones y desviaciones'], ['Analizar', 'señales y niveles de confianza'], ['Inferir', 'hipótesis y relaciones'], ['Validar', 'cuestionar con contexto']] as const;

export function MissionDebrief({ mission, phase, step }: { mission: Readonly<MissionState>; phase: DebriefPhase; step: number }) {
  const { theme: T } = useTheme();
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const label: React.CSSProperties = { fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: T.INK.secondary, textTransform: 'uppercase' };
  const card: React.CSSProperties = { background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: 22, boxShadow: `0 8px 28px ${T.SURFACE.shadow}` };
  const plan = mission.selectedPlan;
  const outcome = plan ? OUTCOMES[plan] : null;

  const title = (children: ReactNode, size = 76) => (
    <div key={`t${step}`} className="animate-fade-in-up" style={{ fontSize: size, fontWeight: 650, letterSpacing: '-0.015em', lineHeight: 1.06, textAlign: 'center' }}>{children}</div>
  );

  let body: ReactNode = null;
  if (phase === 'ending') {
    body = (
      <div className="flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ height: '100%' }}>
        <div style={{ ...label, fontSize: 30 }}>Código Rojo</div>
        <div style={{ fontSize: 110, fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 12 }}>Cancún 2035</div>
        <div style={{ ...label, fontSize: 34, color: T.BRAND.blue, marginTop: 44 }}>Misión finalizada</div>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="flex flex-col items-center" style={{ height: '100%' }}>
        {outcome && plan && (
          <div className="flex items-center" style={{ gap: 18, ...label, fontSize: 20 }}>
            <span>Respuesta ejecutada · {planName(plan)}</span>
            <span style={{ width: 2, height: 20, background: T.SURFACE.hairline }} />
            <span style={{ color: plan === 'DELTA' ? T.STATUS.recover : T.INK.primary }}>{outcome.banner}</span>
          </div>
        )}
        <div style={{ marginTop: 26 }}>{title('Así ocurrió')}</div>
        <div className="flex items-start justify-center" style={{ marginTop: 84, width: '100%' }}>
          {CHAIN.map((n, i) => (
            <div key={n.label} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${200 + i * 170}ms` }}>
              <div className="flex flex-col items-center" style={{ width: 250 }}>
                <div style={{ ...card, width: 250, height: 200, padding: '16px 14px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: T.INK.secondary, letterSpacing: '0.04em' }}>{n.time}</div>
                  <div style={{ fontSize: 30, fontWeight: 650, lineHeight: 1.15 }}>{n.label}</div>
                </div>
                <div style={{ height: 84, marginTop: 22 }}>
                  {n.id && (
                    <span style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 999, border: `2px solid ${T.BRAND.blue}66`, background: `${T.BRAND.blue}10`, color: T.BRAND.blue, fontSize: 32, fontWeight: 700, letterSpacing: '0.05em' }}>{n.id}</span>
                  )}
                </div>
              </div>
              {i < CHAIN.length - 1 && <span aria-hidden style={{ fontSize: 46, color: T.INK.faint, lineHeight: '200px', width: 48, textAlign: 'center' }}>→</span>}
            </div>
          ))}
        </div>
        <div className="animate-fade-in-up text-center" style={{ animationDelay: '1400ms', marginTop: 'auto', paddingBottom: 30 }}>
          <div style={{ fontSize: 56, fontWeight: 620, letterSpacing: '-0.01em' }}>Ninguna estación tenía la historia completa.</div>
          <div style={{ fontSize: 34, color: T.INK.secondary, marginTop: 14 }}>La respuesta apareció cuando el equipo conectó evidencia entre sistemas.</div>
        </div>
      </div>
    );
  } else if (step === 2) {
    const col = (head: string, items: string[], accent: string) => (
      <div style={{ ...card, flex: 1, padding: '18px 30px' }}>
        <div style={{ ...label, color: accent, fontSize: 24 }}>{head}</div>
        <ul style={{ listStyle: 'none', marginTop: 8 }}>
          {items.map((it) => <li key={it} style={{ fontSize: 32, fontWeight: 560, padding: '4px 0' }}>{it}</li>)}
        </ul>
      </div>
    );
    body = (
      <div className="flex flex-col items-center" style={{ height: '100%' }}>
        {title(<>La IA encontró patrones.<br />Ustedes encontraron la causa.</>, 58)}
        <div className="flex items-center animate-fade-in-up" style={{ gap: 26, marginTop: 22, width: '100%', animationDelay: '150ms' }}>
          {col('VÉRTICE · IA', AI_DID, T.BRAND.blue)}
          <span style={{ ...label, fontSize: 30, color: T.INK.faint }}>vs</span>
          {col('Equipo', TEAM_DID, T.STATUS.recover)}
        </div>
        <div className="flex items-stretch animate-fade-in-up" style={{ gap: 22, marginTop: 24, width: '100%', animationDelay: '350ms' }}>
          <div style={{ ...card, flex: 1.5, padding: '16px 26px' }}>
            <div className="flex items-baseline justify-between"><span style={{ fontSize: 34, fontWeight: 700 }}>AGR-31</span><span style={{ fontSize: 30, fontWeight: 650, color: T.INK.secondary }}>84% de confianza</span></div>
            <div style={{ fontSize: 26, color: T.INK.secondary, marginTop: 2 }}>«Núcleo de Inteligencia como posible origen»</div>
            <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>09:19:44</div>
          </div>
          <div className="flex items-center" style={{ fontSize: 40, color: T.INK.faint }}>vs</div>
          <div style={{ ...card, flex: 1, padding: '16px 26px' }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>NOD-204</div>
            <div style={{ fontSize: 26, color: T.INK.secondary, marginTop: 2 }}>SIN-04 cambia de actividad</div>
            <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>09:17:22</div>
          </div>
        </div>
        <div className="animate-fade-in-up" style={{ fontSize: 30, color: T.INK.secondary, marginTop: 14, animationDelay: '500ms' }}>Una hipótesis puede ser plausible y aun así no explicar qué ocurrió primero.</div>
        <div className="animate-fade-in-up text-center" style={{ marginTop: 'auto', paddingBottom: 14, animationDelay: '700ms' }}>
          <div style={{ fontSize: 86, fontWeight: 680, letterSpacing: '-0.015em', lineHeight: 1.05 }}>Confianza ≠ certeza</div>
          <div style={{ fontSize: 56, fontWeight: 560, color: T.INK.secondary, marginTop: 8 }}>Correlación ≠ causalidad</div>
        </div>
      </div>
    );
  } else {
    const disc = (head: string, sub: string, rows: readonly (readonly [string, string])[], accent: string) => (
      <div style={{ ...card, flex: 1, padding: '22px 28px' }}>
        <div style={{ ...label, color: accent, fontSize: 26 }}>{head}</div>
        <div style={{ ...label, fontSize: 16, marginTop: 2 }}>{sub}</div>
        <ul style={{ listStyle: 'none', marginTop: 12 }}>
          {rows.map(([v, d]) => (
            <li key={v} style={{ padding: '7px 0', borderTop: `1px solid ${T.SURFACE.hairlineSoft}` }}>
              <div style={{ fontSize: 34, fontWeight: 680, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{v}</div>
              <div style={{ fontSize: 24, color: T.INK.secondary }}>{d}</div>
            </li>
          ))}
        </ul>
      </div>
    );
    body = (
      <div className="flex flex-col items-center" style={{ height: '100%' }}>
        {title(<>Esto es trabajo de<br />IA + Ciberseguridad</>, 60)}
        <div className="flex items-stretch animate-fade-in-up" style={{ gap: 22, marginTop: 26, width: '100%', animationDelay: '150ms' }}>
          {disc('Ciberseguridad', 'Lo que hicieron', CYBER, T.BRAND.blue)}
          <div className="flex flex-col items-center justify-center text-center" style={{ width: 330, gap: 8 }}>
            <div style={{ ...label, fontSize: 20 }}>Cuando se conectan</div>
            {['datos', 'contexto', 'criterio', 'decisión'].map((t, i) => (
              <div key={t} className="flex flex-col items-center">
                {i > 0 && <span style={{ fontSize: 28, color: T.INK.faint, lineHeight: 1 }}>+</span>}
                <span style={{ fontSize: 38, fontWeight: 620 }}>{t}</span>
              </div>
            ))}
            <span style={{ fontSize: 30, color: T.INK.faint, lineHeight: 1 }}>↓</span>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '0.06em', color: T.BRAND.blue, textTransform: 'uppercase', lineHeight: 1.15 }}>Respuesta<br />tecnológica</div>
          </div>
          {disc('Inteligencia artificial', 'Lo que hicieron', AI, T.STATUS.recover)}
        </div>
        <div className="animate-fade-in-up text-center" style={{ marginTop: 'auto', paddingBottom: 18, animationDelay: '600ms' }}>
          <div style={{ fontSize: 58, fontWeight: 650, letterSpacing: '-0.01em', lineHeight: 1.1 }}>La tecnología encontró señales.<br />Ustedes encontraron la historia.</div>
          <div style={{ ...label, fontSize: 24, marginTop: 14 }}>Código Rojo · Cancún 2035</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute"
      style={{
        left: 0, top: 0, width: W, height: H, zIndex: 90, background: T.SURFACE.page, color: T.INK.primary, display: 'flex', flexDirection: 'column',
        opacity: entered ? 1 : 0, transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <div className="flex items-center justify-between" style={{ height: 104, padding: '0 64px', flexShrink: 0 }}>
        <div className="flex items-center" style={{ gap: 28 }}>
          <VerticeBrand size={42} />
          <span style={{ width: 2, height: 34, background: T.SURFACE.hairline }} />
          <span style={{ ...label, fontSize: 22, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Cierre de misión</span>
        </div>
        {phase === 'open' && (
          <ol className="flex items-center" style={{ listStyle: 'none', gap: 14, whiteSpace: 'nowrap' }} aria-label="Pasos del cierre">
            {STEP_LABELS.map((s, i) => {
              const on = step === i + 1;
              return (
                <li key={s} className="flex items-center" style={{ gap: 14, fontSize: 19, fontWeight: on ? 700 : 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: on ? T.BRAND.blue : T.INK.secondary, opacity: on ? 1 : 0.6 }}>
                  {i + 1} · {s}{i < STEP_LABELS.length - 1 && <span aria-hidden style={{ color: T.INK.faint }}>→</span>}
                </li>
              );
            })}
          </ol>
        )}
        <span style={{ width: 200 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: '4px 64px 36px', overflow: 'hidden' }}>{body}</div>
    </div>
  );
}
