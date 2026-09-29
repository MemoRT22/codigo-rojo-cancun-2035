import { useRef, type KeyboardEvent } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconClip, IconFlag, IconLink, IconSearch } from '../shell/icons';
import { FILTERS } from './logic';
import { MAILBOX } from './data';
import type { FilterId, Message } from './types';

interface Props {
  messages: Message[];
  total: number;
  selectedId: string | null;
  readIds: readonly string[];
  linkedIds: readonly string[];
  query: string;
  filter: FilterId;
  onQuery: (q: string) => void;
  onFilter: (f: FilterId) => void;
  onSelect: (id: string) => void;
}

export function MessageList({ messages, total, selectedId, readIds, linkedIds, query, filter, onQuery, onFilter, onSelect }: Props) {
  const { theme: T } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === '/' && document.activeElement !== searchRef.current) {
      e.preventDefault();
      searchRef.current?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (document.activeElement === searchRef.current) return;
    e.preventDefault();
    const i = messages.findIndex((m) => m.id === selectedId);
    const next = messages[Math.min(messages.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (!next) return;
    onSelect(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };

  return (
    <section
      className="flex flex-col min-h-0"
      onKeyDown={onKey}
      aria-label="Bandeja de comunicaciones"
      style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' }}
    >
      <div style={{ padding: '1rem 1.125rem 0.75rem' }}>
        <div className="flex items-baseline justify-between">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 650 }}>Bandeja de entrada</h2>
          <span style={{ fontSize: '0.8125rem', fontWeight: 560, color: T.INK.secondary }}>
            {messages.length === total ? `${total} comunicaciones` : `${messages.length} de ${total}`}
          </span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.2rem' }}>
          {MAILBOX.address}
        </div>
        <label
          className="flex items-center"
          style={{ gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, color: T.INK.secondary }}
        >
          <IconSearch size={17} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar en comunicaciones"
            aria-label="Buscar en comunicaciones"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9375rem', color: T.INK.primary }}
          />
          <kbd style={{ fontSize: '0.75rem', color: T.INK.secondary, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: 5, padding: '0 0.35rem' }}>/</kbd>
        </label>
        <div className="flex flex-wrap" style={{ gap: '0.375rem', marginTop: '0.75rem' }} role="group" aria-label="Filtros">
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <button
                key={f.id}
                onClick={() => onFilter(f.id)}
                aria-pressed={on}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: 999, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${on ? T.BRAND.blue : T.SURFACE.hairline}`,
                  background: on ? `${T.BRAND.blue}18` : 'transparent',
                  color: on ? T.BRAND.blue : T.INK.secondary,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={listRef} role="listbox" aria-label="Comunicaciones" className="flex-1 overflow-y-auto" style={{ borderTop: `1px solid ${T.SURFACE.hairline}` }}>
        {messages.length === 0 && (
          <div style={{ padding: '2rem 1.25rem', fontSize: '0.9375rem', color: T.INK.secondary }}>
            Ninguna comunicación coincide con la búsqueda o el filtro actual.
          </div>
        )}
        {messages.map((m) => {
          const unread = !readIds.includes(m.id);
          const selected = m.id === selectedId;
          const linked = linkedIds.includes(m.id);
          return (
            <button
              key={m.id}
              data-id={m.id}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(m.id)}
              className="w-full text-left block"
              style={{
                padding: '0.8rem 1.125rem 0.8rem 1.25rem', cursor: 'pointer', position: 'relative',
                borderBottom: `1px solid ${T.SURFACE.hairlineSoft}`,
                background: selected ? `${T.BRAND.blue}12` : 'transparent',
                color: T.INK.primary,
                transition: 'background .15s',
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: selected ? T.BRAND.blue : 'transparent' }} />
              <div className="flex items-center justify-between" style={{ gap: '0.75rem' }}>
                <span className="flex items-center min-w-0" style={{ gap: '0.5rem' }}>
                  {unread && <span aria-label="No leído" style={{ width: 9, height: 9, borderRadius: 5, background: T.BRAND.blue, flexShrink: 0 }} />}
                  <span className="truncate" style={{ fontSize: '0.9375rem', fontWeight: unread ? 680 : 520 }}>{m.senderName}</span>
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 560, color: T.INK.secondary, flexShrink: 0 }}>{m.time}</span>
              </div>
              <div className="truncate" style={{ fontSize: '0.9375rem', fontWeight: unread ? 620 : 480, marginTop: '0.2rem' }}>{m.subject}</div>
              <div className="flex items-center justify-between" style={{ marginTop: '0.2rem', gap: '0.75rem' }}>
                <span className="truncate" style={{ fontSize: '0.875rem', color: T.INK.secondary }}>{m.body[1] ?? m.body[0]}</span>
                <span className="flex items-center shrink-0" style={{ gap: '0.375rem', color: T.INK.secondary }}>
                  {linked && <span style={{ fontSize: '0.75rem', fontWeight: 650, color: T.BRAND.blue }}>En investigación</span>}
                  {m.priority === 'Alta' && <span title="Prioridad alta" aria-label="Prioridad alta" className="inline-flex"><IconFlag size={15} /></span>}
                  {m.links.length > 0 && <span title="Contiene enlaces" aria-label="Contiene enlaces" className="inline-flex"><IconLink size={15} /></span>}
                  {m.attachments.length > 0 && <span title="Contiene adjuntos" aria-label="Contiene adjuntos" className="inline-flex"><IconClip size={15} /></span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
