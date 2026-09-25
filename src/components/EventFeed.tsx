import { useRef, useEffect } from 'react';
import type { SystemEvent } from '../types';

interface Props {
  events: SystemEvent[];
}

const LEVEL_COLORS: Record<string, string> = {
  info: '#6b7f95',
  warning: '#d4913a',
  critical: '#e74c3c',
};

const LEVEL_DOT_COLORS: Record<string, string> = {
  info: '#2a8a8a',
  warning: '#d4913a',
  critical: '#e74c3c',
};

export function EventFeed({ events }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="rounded-lg border border-vertice-border bg-vertice-panel flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-vertice-border flex-shrink-0">
        <div className="text-[10px] uppercase tracking-[0.15em] text-vertice-text-muted">
          Actividad Reciente
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
        {events.map((event, i) => (
          <div
            key={event.id}
            className="animate-fade-in-up flex items-start gap-2 px-2 py-1.5 rounded hover:bg-vertice-surface/50"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
              style={{ backgroundColor: LEVEL_DOT_COLORS[event.level] }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-mono text-vertice-text-muted flex-shrink-0">
                  {event.timestamp}
                </span>
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: LEVEL_COLORS[event.level] }}
              >
                {event.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
