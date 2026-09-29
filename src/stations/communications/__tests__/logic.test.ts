import { describe, expect, it, vi } from 'vitest';
import { MissionEngine } from '../../../mission/engine';
import type { MissionEvent } from '../../../mission/types';
import { MESSAGE_MAP } from '../data';
import { deriveStationPhase, initialUi, submitToInvestigation, uiReducer } from '../logic';

const canonical = MESSAGE_MAP.get('COR-512');
const distractor = MESSAGE_MAP.get('COR-513'); // urgente pero legítimo
const ordinary = MESSAGE_MAP.get('COR-508');

function running() {
  const engine = new MissionEngine();
  engine.dispatch({ type: 'MISSION_START' });
  const dispatch = vi.fn((e: MissionEvent) => engine.dispatch(e));
  return { engine, dispatch };
}

describe('Comunicaciones — descubrimiento de COR-512', () => {
  it('información incorrecta no registra evidencia', () => {
    const { engine, dispatch } = running();
    for (const m of [distractor, ordinary, undefined]) {
      expect(submitToInvestigation(m, engine.getState(), dispatch).kind).toBe('no-match');
    }
    expect(dispatch).not.toHaveBeenCalled();
    expect(engine.getState().discoveredEvidence).toEqual([]);
    expect(deriveStationPhase(engine.getState())).toBe('ACTIVE');
  });

  it('la acción correcta registra COR-512 en el Mission Engine', () => {
    const { engine, dispatch } = running();
    const r = submitToInvestigation(canonical, engine.getState(), dispatch);
    expect(r.kind).toBe('registered');
    expect(dispatch).toHaveBeenCalledWith({ type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' });
    expect(engine.getState().discoveredEvidence).toContain('COR-512');
    expect(deriveStationPhase(engine.getState())).toBe('EVIDENCE_FOUND');
  });

  it('volver a enviarla no produce efectos duplicados', () => {
    const { engine, dispatch } = running();
    submitToInvestigation(canonical, engine.getState(), dispatch);
    const after = engine.getState();
    expect(submitToInvestigation(canonical, engine.getState(), dispatch).kind).toBe('already');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(engine.getState()).toBe(after);
    expect(engine.getState().discoveredEvidence).toEqual(['COR-512']);
  });

  it('sin misión en curso la estación no registra nada', () => {
    const engine = new MissionEngine();
    const dispatch = vi.fn();
    expect(submitToInvestigation(canonical, engine.getState(), dispatch).kind).toBe('inactive');
    expect(dispatch).not.toHaveBeenCalled();
    expect(deriveStationPhase(engine.getState())).toBe('WAITING');
  });

  it('el reset devuelve la estación a su estado inicial', () => {
    const { engine, dispatch } = running();
    submitToInvestigation(canonical, engine.getState(), dispatch);
    let ui = uiReducer(initialUi(), { type: 'SELECT', id: 'COR-512' });
    ui = uiReducer(ui, { type: 'MISS' });
    engine.dispatch({ type: 'MISSION_RESET' });
    expect(deriveStationPhase(engine.getState())).toBe('WAITING');
    expect(engine.getState().discoveredEvidence).toEqual([]);
    expect(uiReducer(ui, { type: 'RESET' })).toEqual(initialUi());
  });
});
