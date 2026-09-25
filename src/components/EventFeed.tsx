import { useRef, useEffect } from 'react';
import type { SystemEvent } from '../types';

interface Props {
  events: SystemEvent[];
}

const LEVEL_COLORS: Record<string, string> = {
  info: 'rgba(255,255,255,0.22)',
  warning: 'rgba(212,145,58,0.55)',
  critical: 'rgba(192,57,43,0.65)',
};

const LEVEL_DOT: Record<string, string> = {
  info: 'rgba(42,138,138,0.4)',
  warning: 'rgba(212,145,58,0.6)',
  critical: 'rgba(192,57,43,0.7)',
};

export function EventFeed({ events }: Props) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  const visibleEvents = events.slice(-8);

  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 w-[340px]">
      <div className="text-[9px] uppercase tracking-[0.2em] text-white/15 mb-3">
        Actividad Reciente
      </div>
      <div ref={listRef} className="space-y-2.5 max-h-[400px] overflow-hidden">
        {visibleEvents.map((event, i) => {
          const age = visibleEvents.length - i;
          const fade = Math.max(0.3, 1 - (age - 1) * 0.12);

          return (
            <div
              key={event.id}
              className="flex items-start gap-2.5 animate-fade-in-up"
              style={{ opacity: fade, animationDelay: `${i * 40}ms` }}
            >
              <div
                className="w-1 h-1 rounded-full mt-[7px] flex-shrink-0"
                style={{ backgroundColor: LEVEL_DOT[event.level] }}
              />
              <div>
                <div
                  className="text-[10px] font-mono tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                >
                  {event.timestamp}
                </div>
                <div
                  className="text-[12px] leading-snug mt-0.5"
                  style={{ color: LEVEL_COLORS[event.level] }}
                >
                  {event.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
