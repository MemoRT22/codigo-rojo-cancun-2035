import { DOMAINS, INK } from '../brand/tokens';
import { DOMAIN_ICONS } from '../brand/DomainIcons';
import type { WorldView } from '../world/useWorld';
import { DOCK_H, H } from '../map/scene';
import { domainLabel } from '../world/derive';
import { STATUS_FILL, STATUS_TEXT } from './status';

/**
 * Dominios de la plataforma. Cada segmento es un nodo real del modelo: 48 segmentos en total,
 * los mismos que cuenta "Nodos enlazados".
 */
export function Dock({ w, countdown, countdownRunning }: { w: WorldView; countdown: string | null; countdownRunning: boolean }) {
  return (
    <div className="absolute" style={{ left: 48, top: H - DOCK_H + 8, width: 1824, height: 100 }}>
      <div className="flex" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 14, border: '1px solid #D8E0E9', boxShadow: '0 10px 30px rgba(14,29,51,0.12)', height: 100, overflow: 'hidden' }}>
        {DOMAINS.map((d, i) => {
          const s = w.derived.domains.find((x) => x.id === d.id)!;
          const Icon = DOMAIN_ICONS[d.id];
          return (
            <div key={d.id} style={{ flex: 1, padding: '11px 16px 0 18px', borderLeft: i ? '1px solid #DAE2ED' : undefined, position: 'relative' }}>
              <div className="flex items-center" style={{ gap: 9 }}>
                <Icon size={23} color={d.color} />
                <span style={{ fontSize: 17, fontWeight: 650, color: INK.primary, whiteSpace: 'nowrap' }}>{d.label}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                <div className="flex" style={{ gap: 3 }}>
                  {s.segments.map((seg, k) => (
                    <span key={k} style={{ width: 15, height: 11, borderRadius: 3, background: STATUS_FILL[seg] ?? d.color, opacity: 1, transition: 'background .8s' }} />
                  ))}
                </div>
                <span style={{ fontSize: 15, fontWeight: 620, color: s.online < s.total ? STATUS_TEXT.warn : INK.secondary }}>{s.online}/{s.total}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 650, color: STATUS_TEXT[s.worst], marginTop: 6, whiteSpace: 'nowrap' }}>{domainLabel(s)}</div>
            </div>
          );
        })}
        <div style={{ width: countdown ? 262 : 0, borderLeft: '1px solid #DAE2ED', padding: '12px 20px 0 24px', display: countdown ? 'block' : 'none', background: 'rgba(237,241,245,0.6)', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: 14, fontWeight: 650, letterSpacing: '0.1em', color: INK.secondary }}>TIEMPO DE RESPUESTA</div>
          <div style={{ fontSize: 50, fontWeight: 560, lineHeight: 1.05, marginTop: 6, color: countdownRunning ? INK.primary : INK.tertiary, letterSpacing: '0.02em' }}>{countdown}</div>
        </div>
      </div>
    </div>
  );
}
