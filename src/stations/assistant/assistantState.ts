// ── Analysis Assistant: estado y transiciones (puras, sin React ni Mission Engine) ──

import type { AssistantAct, AssistantState, AssistantTiming } from './types';

export const initialAssistant = (): AssistantState => ({
  shownLevel: 0,
  availableLevel: 0,
  requestedCount: 0,
  inactiveSeconds: 0,
  elapsedSeconds: 0,
  failedAttempts: 0,
  seenSignals: [],
});

export const levelsOf = (t: AssistantTiming) => t.stepSeconds.length;

/** Muestra recomendaciones: un nivel si lo pidió el equipo, todas las disponibles si es automático. */
function reveal(s: AssistantState, manual: boolean): AssistantState {
  return {
    ...s,
    shownLevel: manual ? s.shownLevel + 1 : s.availableLevel,
    requestedCount: s.requestedCount + (manual ? 1 : 0),
    inactiveSeconds: 0,
    elapsedSeconds: 0,
  };
}

/** Decide qué niveles quedan disponibles. Nunca desbloquea más de uno por tiempo mientras haya uno sin mostrar. */
function unlock(s: AssistantState, t: AssistantTiming): AssistantState {
  const levels = levelsOf(t);
  let available = s.availableLevel;
  while (available < levels && s.failedAttempts >= (t.failedAttemptsAt[available] ?? Infinity)) available++;
  if (available === s.shownLevel && available < levels) {
    const step = t.stepSeconds[available]!;
    if (s.inactiveSeconds >= step || s.elapsedSeconds >= step * t.maxDeferFactor) available++;
  }
  if (available === s.availableLevel) return s;
  const next = { ...s, availableLevel: available };
  return t.autoReveal ? reveal(next, false) : next;
}

const withSignal = (s: AssistantState, key: string | undefined): AssistantState => {
  if (!key || s.seenSignals.includes(key)) return s;
  return { ...s, seenSignals: [...s.seenSignals, key], inactiveSeconds: 0 };
};

export function assistantReducer(s: AssistantState, a: AssistantAct, t: AssistantTiming): AssistantState {
  switch (a.type) {
    case 'TICK': {
      const seconds = a.seconds ?? 1;
      return unlock({ ...s, inactiveSeconds: s.inactiveSeconds + seconds, elapsedSeconds: s.elapsedSeconds + seconds }, t);
    }
    // Actividad significativa: solo la primera vez que ocurre (repetir la misma acción no es avanzar).
    case 'PROGRESS':
      return withSignal(s, a.key);
    case 'FAILED_ATTEMPT':
      return unlock(withSignal({ ...s, failedAttempts: s.failedAttempts + 1 }, a.key), t);
    // Solicitud manual: revela exactamente el siguiente nivel, y solo si hay uno disponible.
    case 'REQUEST':
      return s.shownLevel >= s.availableLevel ? s : reveal(s, true);
    // Herramienta de desarrollo: adelanta un nivel sin contarlo como solicitud.
    case 'FORCE_NEXT': {
      if (s.shownLevel >= levelsOf(t)) return s;
      const shownLevel = s.shownLevel + 1;
      return { ...s, shownLevel, availableLevel: Math.max(s.availableLevel, shownLevel), inactiveSeconds: 0, elapsedSeconds: 0 };
    }
    case 'RESET':
      return initialAssistant();
  }
}
