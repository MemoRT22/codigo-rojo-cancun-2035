import { useCallback, useEffect, useReducer } from 'react';
import { assistantReducer, initialAssistant } from './assistantState';
import type { AssistantPlan, AssistantState } from './types';

/**
 * Analysis Assistant de una estación. Determinista y local: la «IA de VÉRTICE» son recomendaciones curadas
 * (`plan.hints`); no hay red, modelo ni API. Solo cuenta tiempo mientras la estación está activa (`active`).
 *
 * Futuro (no implementado): el plan podría venir de un `StaticAnalysisProvider` (este) o de un
 * `LocalAIProvider` que devuelva el mismo tipo `AssistantHint` ya validado. La UI y el estado no cambiarían.
 */
export function useAnalysisAssistant(plan: AssistantPlan, active: boolean) {
  const { hints, timing } = plan;
  const [state, dispatch] = useReducer(
    (s: AssistantState, a: Parameters<typeof assistantReducer>[1]) => assistantReducer(s, a, timing),
    undefined,
    initialAssistant,
  );

  useEffect(() => {
    if (!active) return;
    let last = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      const seconds = Math.round((now - last) / 1000);
      if (seconds < 1) return;
      last += seconds * 1000;
      dispatch({ type: 'TICK', seconds });
    }, 1000);
    return () => clearInterval(iv);
  }, [active]);

  const request = useCallback(() => dispatch({ type: 'REQUEST' }), []);
  const progress = useCallback((key: string) => dispatch({ type: 'PROGRESS', key }), []);
  const failedAttempt = useCallback((key?: string) => dispatch({ type: 'FAILED_ATTEMPT', key }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const forceNext = useCallback(() => dispatch({ type: 'FORCE_NEXT' }), []);
  const simulateInactivity = useCallback((seconds: number) => dispatch({ type: 'TICK', seconds }), []);

  return {
    state,
    levels: hints.length,
    shown: hints.slice(0, state.shownLevel),
    pending: state.availableLevel > state.shownLevel,
    request, progress, failedAttempt, reset,
    /** Solo para el panel de desarrollo. */
    forceNext, simulateInactivity,
  };
}

export type AnalysisAssistant = ReturnType<typeof useAnalysisAssistant>;
