import { useCallback, useReducer } from 'react';
import type { MissionEvent, MissionState, ResponsePlan } from '../../mission/types';
import { deriveStage, type LockKey, type Stage } from './logic';

// Flujo de Respuesta COMPARTIDO por la estación (`/station/respuesta`) y la consola de VÉRTICE (LED).
// La verdad de la misión sigue en MissionState (validación de la correlación, autorización, plan, desenlace);
// aquí solo vive la presentación local: plan en revisión, «volver a los planes» y el intento de correlación en curso.

interface Ui { reviewing: ResponsePlan | null; changing: boolean; attemptBase: number | null }
type Act = { type: 'RESET' } | { type: 'REVIEW'; plan: ResponsePlan } | { type: 'SELECTED' } | { type: 'CHANGE' } | { type: 'ATTEMPT'; base: number };

const initialUi = (): Ui => ({ reviewing: null, changing: false, attemptBase: null });

function uiReducer(s: Ui, a: Act): Ui {
  switch (a.type) {
    case 'RESET': return initialUi();
    case 'REVIEW': return { ...s, reviewing: a.plan };
    case 'SELECTED': return { ...s, changing: false };
    case 'CHANGE': return { ...s, changing: true };
    case 'ATTEMPT': return { ...s, attemptBase: a.base };
  }
}

export interface ResponseFlow {
  reviewing: ResponsePlan | null;
  stage: Stage;
  /** El último envío del candado fue rechazado por el Mission Engine. */
  rejected: boolean;
  reset: () => void;
  submitLock: (ids: Record<LockKey, string>) => void;
  review: (plan: ResponsePlan) => void;
  selectPlan: (plan: ResponsePlan) => void;
  /** «Volver a los planes» desde la confirmación. */
  change: () => void;
  confirm: () => void;
}

export function useResponseFlow(mission: Readonly<MissionState>, dispatch: (e: MissionEvent) => void): ResponseFlow {
  const [ui, act] = useReducer(uiReducer, undefined, initialUi);
  const attempts = mission.failedCorrelationAttempts;

  const submitLock = useCallback((ids: Record<LockKey, string>) => {
    act({ type: 'ATTEMPT', base: attempts });
    dispatch({ type: 'FINAL_CORRELATION_SUBMITTED', ...ids });
  }, [attempts, dispatch]);

  return {
    reviewing: ui.reviewing,
    stage: deriveStage(mission, ui.changing),
    rejected: ui.attemptBase !== null && attempts > ui.attemptBase && !mission.finalCorrelationValidated,
    reset: useCallback(() => act({ type: 'RESET' }), []),
    submitLock,
    review: useCallback((plan: ResponsePlan) => act({ type: 'REVIEW', plan }), []),
    selectPlan: useCallback((plan: ResponsePlan) => { dispatch({ type: 'PLAN_SELECTED', plan }); act({ type: 'SELECTED' }); }, [dispatch]),
    change: useCallback(() => act({ type: 'CHANGE' }), []),
    confirm: useCallback(() => dispatch({ type: 'PLAN_CONFIRMED' }), [dispatch]),
  };
}
