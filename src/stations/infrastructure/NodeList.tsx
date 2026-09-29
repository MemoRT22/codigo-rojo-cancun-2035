import { useRef, type KeyboardEvent } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { Sparkline } from './ActivityChart';
import { currentOf } from './data';
import { FILTERS, SORTS } from './logic';
import type { InfraNode, NodeFilter, NodeSort } from './types';

interface Props {
  nodes: InfraNode[];
  total: number;
  selectedId: string | null;
  linkedIds: readonly string[];
  filter: NodeFilter;
  sort: NodeSort;
  onFilter: (f: NodeFilter) => void;
  onSort: (s: NodeSort) => void;
  onSelect: (id: string) => void;
}

export function NodeList({ nodes, total, selectedId, linkedIds, filter, sort, onFilter, onSort, onSelect }: Props) {
  const { theme: T } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (document.activeElement instanceof HTMLSelectElement) return;
    e.preventDefault();
    const i = nodes.findIndex((n) => n.id === selectedId);
    const next = nodes[Math.min(nodes.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (!next) return;
    onSelect(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };

  return (
    <section
      className="flex flex-col min-h-0"
      onKeyDown={onKey}
      aria-label="Servicios y nodos"
      style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' }}
    >
      <div style={{ padding: '1rem 1.125rem 0.75rem' }}>
        <div className="flex items-baseline justify-between">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 650 }}>Servicios y nodos</h2>
          <span style={{ fontSize: '0.8125rem', fontWeight: 560, color: T.INK.secondary }}>
            {nodes.length === total ? `${total} nodos` : `${nodes.length} de ${total}`}
          </span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.2rem' }}>Solicitudes por segundo · 08:50 – 09:20</div>

        <div id="infra-filters" className="flex flex-wrap" style={{ gap: '0.375rem', marginTop: '0.75rem' }} role="group" aria-label="Filtro de nodos">
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => onFilter(f.id)}
                aria-pressed={on}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${on ? T.BRAND.blue : T.SURFACE.hairline}`, background: on ? `${T.BRAND.blue}18` : 'transparent', color: on ? T.BRAND.blue : T.INK.secondary,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center" style={{ gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: T.INK.secondary }}>
          Orden
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as NodeSort)}
            aria-label="Ordenar nodos"
            style={{ flex: 1, padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, color: T.INK.primary, fontSize: '0.875rem' }}
          >
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      <div ref={listRef} role="listbox" aria-label="Nodos" className="flex-1 overflow-y-auto" style={{ borderTop: `1px solid ${T.SURFACE.hairline}` }}>
        {nodes.map((n) => {
          const selected = n.id === selectedId;
          return (
            <button
              key={n.id}
              data-id={n.id}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(n.id)}
              className="w-full text-left block"
              style={{
                padding: '0.7rem 1.125rem 0.7rem 1.25rem', cursor: 'pointer', position: 'relative',
                borderBottom: `1px solid ${T.SURFACE.hairlineSoft}`, background: selected ? `${T.BRAND.blue}12` : 'transparent', color: T.INK.primary, transition: 'background .15s',
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: selected ? T.BRAND.blue : 'transparent' }} />
              <div className="flex items-center justify-between" style={{ gap: '0.75rem' }}>
                <div className="min-w-0">
                  <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 650 }}>{n.id}</span>
                    {linkedIds.includes(n.id) && <span style={{ fontSize: '0.75rem', fontWeight: 650, color: T.BRAND.blue }}>En investigación</span>}
                  </div>
                  <div className="truncate" style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.1rem' }}>{n.name}</div>
                </div>
                <div className="flex items-center shrink-0" style={{ gap: '0.65rem' }}>
                  <Sparkline id={n.id} color={T.INK.secondary} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 620, minWidth: '3.4rem', textAlign: 'right' }}>{currentOf(n.id)}<span style={{ fontWeight: 480, color: T.INK.secondary }}>/s</span></span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
