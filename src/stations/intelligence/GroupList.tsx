import { useRef, type KeyboardEvent } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { toSeconds, EVENT_MAP } from './data';
import type { Group } from './types';

export function ConfidenceBar({ value, width = '100%' }: { value: number; width?: string }) {
  const { theme: T } = useTheme();
  return (
    <span aria-hidden style={{ display: 'block', width, height: 6, borderRadius: 3, background: T.SURFACE.hairline, overflow: 'hidden' }}>
      <span style={{ display: 'block', width: `${value}%`, height: '100%', background: T.BRAND.blue, opacity: 0.85 }} />
    </span>
  );
}

const span = (g: Group) => {
  const t = g.signals.map((s) => EVENT_MAP.get(s)!.time).sort((a, b) => toSeconds(a) - toSeconds(b));
  return t.length === 1 ? t[0]! : `${t[0]} – ${t[t.length - 1]}`;
};

interface Props { groups: Group[]; selectedId: string | null; linkedIds: readonly string[]; onSelect: (id: string) => void }

export function GroupList({ groups, selectedId, linkedIds, onSelect }: Props) {
  const { theme: T } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = groups.findIndex((g) => g.id === selectedId);
    const next = groups[Math.min(groups.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (!next) return;
    onSelect(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };
  return (
    <section
      className="flex flex-col min-h-0"
      onKeyDown={onKey}
      aria-label="Agrupaciones de anomalías"
      style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' }}
    >
      <div style={{ padding: '1rem 1.125rem 0.75rem' }}>
        <div className="flex items-baseline justify-between">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 650 }}>Agrupaciones</h2>
          <span style={{ fontSize: '0.8125rem', fontWeight: 560, color: T.INK.secondary }}>{groups.length} agrupaciones</span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.2rem', lineHeight: 1.4 }}>
          Anomalías agrupadas por el sistema. El nivel de confianza mide cuánto encajan las señales, no si la interpretación es cierta.
        </div>
      </div>
      <div ref={listRef} role="listbox" aria-label="Agrupaciones" className="flex-1 overflow-y-auto" style={{ borderTop: `1px solid ${T.SURFACE.hairline}` }}>
        {groups.map((g) => {
          const selected = g.id === selectedId;
          return (
            <button
              key={g.id}
              data-id={g.id}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(g.id)}
              className="w-full text-left block"
              style={{ padding: '0.85rem 1.125rem 0.85rem 1.25rem', cursor: 'pointer', position: 'relative', borderBottom: `1px solid ${T.SURFACE.hairlineSoft}`, background: selected ? `${T.BRAND.blue}12` : 'transparent', color: T.INK.primary, transition: 'background .15s' }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: selected ? T.BRAND.blue : 'transparent' }} />
              <div className="flex items-baseline justify-between" style={{ gap: '0.5rem' }}>
                <span className="flex items-baseline" style={{ gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 650 }}>{g.id}</span>
                  {linkedIds.includes(g.id) && <span style={{ fontSize: '0.75rem', fontWeight: 650, color: T.BRAND.blue }}>En investigación</span>}
                </span>
                <span style={{ fontSize: '0.9375rem', fontWeight: 650 }}>{g.confidence}%</span>
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.15rem', lineHeight: 1.35 }}>{g.name}</div>
              <div style={{ marginTop: '0.5rem' }}><ConfidenceBar value={g.confidence} /></div>
              <div className="flex justify-between" style={{ fontSize: '0.75rem', color: T.INK.secondary, marginTop: '0.4rem' }}>
                <span>Confianza del modelo</span>
                <span>{g.signals.length} {g.signals.length === 1 ? 'señal' : 'señales'} · {span(g)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
