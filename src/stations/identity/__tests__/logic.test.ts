import { describe, expect, it, vi } from 'vitest';
import { MissionEngine } from '../../../mission/engine';
import type { MissionEvent } from '../../../mission/types';
import { MESSAGE_MAP } from '../../communications/data';
import { submitToInvestigation as submitComms } from '../../communications/logic';
import { EVENT_MAP } from '../data';
import { deriveStationPhase, initialUi, sessionsOf, submitToInvestigation, uiReducer } from '../logic';

const canonical = EVENT_MAP.get('ACC-417');
const otherGrant = EVENT_MAP.get('ACC-410'); // pnunez: acceso concedido tras un fallo (distractor)
const support = EVENT_MAP.get('ACC-406'); // ftorres: sesión remota legítima con ventana de soporte

function running() {
  const engine = new MissionEngine();
  engine.dispatch({ type: 'MISSION_START' });
  const dispatch = vi.fn((e: MissionEvent) => engine.dispatch(e));
  return { engine, dispatch };
}

describe('Identidad — descubrimiento de ACC-417', () => {
  it('un evento que no corresponde no registra evidencia', () => {
    const { engine, dispatch } = running();
    for (const e of [otherGrant, support, EVENT_MAP.get('ACC-409'), undefined]) {
      expect(submitToInvestigation(e, engine.getState(), dispatch).kind).toBe('no-match');
    }
    expect(dispatch).not.toHaveBeenCalled();
    expect(engine.getState().discoveredEvidence).toEqual([]);
  });

  it('ACC-417 emite EVIDENCE_DISCOVERED con source = identidad', () => {
    const { engine, dispatch } = running();
    expect(submitToInvestigation(canonical, engine.getState(), dispatch).kind).toBe('registered');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'EVIDENCE_DISCOVERED', evidenceId: 'ACC-417', source: 'identidad' });
    expect(engine.getState().discoveredEvidence).toEqual(['ACC-417']);
    expect(deriveStationPhase(engine.getState())).toBe('EVIDENCE_FOUND');
  });

  it('un segundo intento no duplica ni emite eventos', () => {
    const { engine, dispatch } = running();
    submitToInvestigation(canonical, engine.getState(), dispatch);
    const after = engine.getState();
    expect(submitToInvestigation(canonical, engine.getState(), dispatch).kind).toBe('already');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(engine.getState()).toBe(after);
  });

  it('con la misión inactiva no registra nada', () => {
    const engine = new MissionEngine();
    const dispatch = vi.fn();
    expect(submitToInvestigation(canonical, engine.getState(), dispatch).kind).toBe('inactive');
    expect(dispatch).not.toHaveBeenCalled();
    expect(deriveStationPhase(engine.getState())).toBe('WAITING');
  });

  it('el reset limpia la estación', () => {
    const { engine, dispatch } = running();
    submitToInvestigation(canonical, engine.getState(), dispatch);
    const ui = uiReducer(uiReducer(initialUi(), { type: 'SELECT', id: 'ACC-417' }), { type: 'MISS' });
    engine.dispatch({ type: 'MISSION_RESET' });
    expect(deriveStationPhase(engine.getState())).toBe('WAITING');
    expect(engine.getState().discoveredEvidence).toEqual([]);
    expect(uiReducer(ui, { type: 'RESET' })).toEqual(initialUi());
  });
});

describe('Primera convergencia: COR-512 + ACC-417 (autoridad: Mission Engine)', () => {
  const cor = MESSAGE_MAP.get('COR-512');

  function play(order: 'cor-primero' | 'acc-primero') {
    const { engine, dispatch } = running();
    const steps = order === 'cor-primero'
      ? [() => submitComms(cor, engine.getState(), dispatch), () => submitToInvestigation(canonical, engine.getState(), dispatch)]
      : [() => submitToInvestigation(canonical, engine.getState(), dispatch), () => submitComms(cor, engine.getState(), dispatch)];
    expect(engine.getState().identityCorrelationEstablished).toBe(false);
    steps[0]!();
    expect(engine.getState().identityCorrelationEstablished).toBe(false); // una sola pieza no basta
    steps[1]!();
    return engine.getState();
  }

  it.each(['cor-primero', 'acc-primero'] as const)('establece la correlación de identidad (%s)', (order) => {
    const s = play(order);
    expect([...s.discoveredEvidence].sort()).toEqual(['ACC-417', 'COR-512']);
    expect(s.identityCorrelationEstablished).toBe(true);
  });
});

describe('Datos: la simultaneidad se descubre por inspección', () => {
  it('vcruz tiene dos sesiones a la vez: su estación habitual y una remota', () => {
    const s = sessionsOf('vcruz');
    expect(s.map((x) => `${x.device}|${x.zone}`)).toEqual(['EST-OPS-12|CENTRO-OPERACIONES', 'TER-REM-91|REMOTO']);
    expect(s[0]!.last > s[1]!.since).toBe(true); // EST-OPS-12 sigue activa después de las 09:16:04
  });
});
