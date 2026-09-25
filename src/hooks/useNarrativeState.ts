import { useState, useCallback } from 'react';
import type { NarrativeState, SystemEvent } from '../types';
import { STATE_CONFIGS } from '../data/stateConfigs';

let _customId = 5000;

export function useNarrativeState() {
  const [state, setState] = useState<NarrativeState>('OPERACION_NORMAL');
  const [extraEvents, setExtraEvents] = useState<SystemEvent[]>([]);

  const setNarrativeState = useCallback((next: NarrativeState) => {
    setState(next);
    setExtraEvents([]);
  }, []);

  const reset = useCallback(() => {
    setState('OPERACION_NORMAL');
    setExtraEvents([]);
  }, []);

  const injectEvent = useCallback((message: string, level: SystemEvent['level'] = 'info') => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setExtraEvents((prev) => [
      ...prev,
      { id: `CUSTOM-${++_customId}`, timestamp: ts, message, level },
    ]);
  }, []);

  const config = STATE_CONFIGS[state]!;
  const allEvents = [...config.events, ...extraEvents];

  return { state, config, allEvents, setNarrativeState, reset, injectEvent };
}
