import { useRef, type KeyboardEvent } from 'react';
import { useTheme } from '../../brand/ThemeContext';
import { IconDenied, IconGranted, IconPulse, IconSearch } from '../shell/icons';
import { RESULT_FILTERS } from './logic';
import { USER_MAP, ZONES } from './data';
import type { AccessEvent, EventKind, ResultFilter } from './types';

interface Props {
  events: AccessEvent[];
  total: number;
  selectedId: string | null;
  linkedIds: readonly string[];
  query: string;
  result: ResultFilter;
  zone: string;
  onQuery: (q: string) => void;
  onResult: (r: ResultFilter) => void;
  onZone: (z: string) => void;
  onSelect: (id: string) => void;
}

const SHORT: Record<EventKind, string> = { concedido: 'Acceso concedido', denegado: 'Acceso denegado', actividad: 'Actividad de sesión' };

export function KindIcon({ kind, size = 17, color }: { kind: EventKind; size?: number; color: string }) {
  return kind === 'concedido' ? <IconGranted size={size} color={color} /> : kind === 'denegado' ? <IconDenied size={size} color={color} /> : <IconPulse size={size} color={color} />;
}

export function IdentityEventList({ events, total, selectedId, linkedIds, query, result, zone, onQuery, onResult, onZone, onSelect }: Props) {
  const { theme: T } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === '/' && document.activeElement !== searchRef.current && !(document.activeElement instanceof HTMLSelectElement)) {
      e.preventDefault();
      searchRef.current?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (document.activeElement === searchRef.current || document.activeElement instanceof HTMLSelectElement) return;
    e.preventDefault();
    const i = events.findIndex((m) => m.id === selectedId);
    const next = events[Math.min(events.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (!next) return;
    onSelect(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
  };

  return (
    <section
      className="flex flex-col min-h-0"
      onKeyDown={onKey}
      aria-label="Actividad de identidades"
      style={{ background: T.SURFACE.card, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: '0.875rem', boxShadow: `0 6px 24px ${T.SURFACE.shadow}`, overflow: 'hidden' }}
    >
      <div style={{ padding: '1rem 1.125rem 0.75rem' }}>
        <div className="flex items-baseline justify-between">
          <h2 style={{ fontSize: '1.05rem', fontWeight: 650 }}>Actividad de identidades</h2>
          <span style={{ fontSize: '0.8125rem', fontWeight: 560, color: T.INK.secondary }}>
            {events.length === total ? `${total} eventos` : `${events.length} de ${total}`}
          </span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: T.INK.secondary, marginTop: '0.2rem' }}>Accesos y sesiones · hoy</div>

        <label
          className="flex items-center"
          style={{ gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '0.625rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, color: T.INK.secondary }}
        >
          <IconSearch size={17} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Buscar usuario o dispositivo"
            aria-label="Buscar usuario o dispositivo"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9375rem', color: T.INK.primary }}
          />
          <kbd style={{ fontSize: '0.75rem', color: T.INK.secondary, border: `1px solid ${T.SURFACE.hairline}`, borderRadius: 5, padding: '0 0.35rem' }}>/</kbd>
        </label>

        <div className="flex flex-wrap" style={{ gap: '0.375rem', marginTop: '0.75rem' }} role="group" aria-label="Filtro por resultado">
          {RESULT_FILTERS.map((f) => {
            const on = f.id === result;
            return (
              <button
                key={f.id}
                onClick={() => onResult(f.id)}
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

        <label className="flex items-center" style={{ gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: T.INK.secondary }}>
          Zona
          <select
            id="identity-zone-filter"
            value={zone}
            onChange={(e) => onZone(e.target.value)}
            aria-label="Filtrar por zona"
            style={{ flex: 1, padding: '0.35rem 0.5rem', borderRadius: '0.5rem', border: `1px solid ${T.SURFACE.hairline}`, background: T.SURFACE.page, color: T.INK.primary, fontSize: '0.875rem' }}
          >
            <option value="todas">Todas las zonas</option>
            {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </label>
      </div>

      <div ref={listRef} role="listbox" aria-label="Eventos" className="flex-1 overflow-y-auto" style={{ borderTop: `1px solid ${T.SURFACE.hairline}` }}>
        {events.length === 0 && (
          <div style={{ padding: '2rem 1.25rem', fontSize: '0.9375rem', color: T.INK.secondary }}>
            Ningún evento coincide con la búsqueda o los filtros actuales.
          </div>
        )}
        {events.map((e) => {
          const selected = e.id === selectedId;
          const linked = linkedIds.includes(e.id);
          const user = USER_MAP.get(e.userId);
          return (
            <button
              key={e.id}
              data-id={e.id}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(e.id)}
              className="w-full text-left block"
              style={{
                padding: '0.75rem 1.125rem 0.75rem 1.25rem', cursor: 'pointer', position: 'relative',
                borderBottom: `1px solid ${T.SURFACE.hairlineSoft}`,
                background: selected ? `${T.BRAND.blue}12` : 'transparent',
                color: T.INK.primary,
                transition: 'background .15s',
              }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: selected ? T.BRAND.blue : 'transparent' }} />
              <div className="flex items-center justify-between" style={{ gap: '0.75rem' }}>
                <span className="flex items-center min-w-0" style={{ gap: '0.55rem' }}>
                  <span className="shrink-0 inline-flex" title={SHORT[e.kind]} aria-label={SHORT[e.kind]}><KindIcon kind={e.kind} color={T.INK.secondary} /></span>
                  <span className="truncate" style={{ fontSize: '0.9375rem', fontWeight: 620 }}>{e.userId}</span>
                  <span className="truncate" style={{ fontSize: '0.875rem', color: T.INK.secondary }}>{user?.name}</span>
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: T.INK.secondary, flexShrink: 0 }}>{e.time}</span>
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: '0.25rem', gap: '0.5rem', paddingLeft: '1.55rem' }}>
                <span style={{ fontSize: '0.8125rem', color: T.INK.secondary, wordBreak: 'break-word' }}>{e.device} · {e.zone}</span>
                {linked && <span className="shrink-0" style={{ fontSize: '0.75rem', fontWeight: 650, color: T.BRAND.blue }}>En investigación</span>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
