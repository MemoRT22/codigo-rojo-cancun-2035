import { describe, it, expect } from 'vitest';
import { missionReducer } from '../reducer';
import { INITIAL_MISSION, type MissionState } from '../types';

function apply(events: Parameters<typeof missionReducer>[1][]): MissionState {
  return events.reduce<MissionState>((s, e) => missionReducer(s, e), { ...INITIAL_MISSION });
}

describe('Mission reducer', () => {
  it('COR-512 + ACC-417 establece correlación de identidad', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' },
      { type: 'EVIDENCE_DISCOVERED', evidenceId: 'ACC-417', source: 'identidad' },
    ]);
    expect(state.identityCorrelationEstablished).toBe(true);
    expect(state.discoveredEvidence).toEqual(['COR-512', 'ACC-417']);
  });

  it('correlación final incorrecta no desbloquea respuesta', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'FINAL_CORRELATION_SUBMITTED', origin: 'COR-512', identity: 'ACC-417', propagation: 'NOD-204', correlation: 'AGR-31' },
    ]);
    expect(state.finalCorrelationValidated).toBe(false);
    expect(state.responseUnlocked).toBe(false);
    expect(state.failedCorrelationAttempts).toBe(1);
  });

  it('correlación final correcta desbloquea respuesta', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'FINAL_CORRELATION_SUBMITTED', origin: 'COR-512', identity: 'ACC-417', propagation: 'NOD-204', correlation: 'AGR-27' },
    ]);
    expect(state.finalCorrelationValidated).toBe(true);
    expect(state.responseUnlocked).toBe(true);
  });

  it('DELTA confirmado produce contención exitosa', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'FINAL_CORRELATION_SUBMITTED', origin: 'COR-512', identity: 'ACC-417', propagation: 'NOD-204', correlation: 'AGR-27' },
      { type: 'PLAN_SELECTED', plan: 'DELTA' },
      { type: 'PLAN_CONFIRMED' },
    ]);
    expect(state.outcome).toBe('contained');
    expect(state.status).toBe('finished');
  });

  it('plan distinto a DELTA produce contención incompleta', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'FINAL_CORRELATION_SUBMITTED', origin: 'COR-512', identity: 'ACC-417', propagation: 'NOD-204', correlation: 'AGR-27' },
      { type: 'PLAN_SELECTED', plan: 'GAMMA' },
      { type: 'PLAN_CONFIRMED' },
    ]);
    expect(state.outcome).toBe('incomplete');
    expect(state.status).toBe('finished');
  });

  it('reset devuelve estado inicial limpio', () => {
    const state = apply([
      { type: 'MISSION_START' },
      { type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' },
      { type: 'EVIDENCE_DISCOVERED', evidenceId: 'ACC-417', source: 'identidad' },
      { type: 'FINAL_CORRELATION_SUBMITTED', origin: 'COR-512', identity: 'ACC-417', propagation: 'NOD-204', correlation: 'AGR-27' },
      { type: 'PLAN_SELECTED', plan: 'DELTA' },
      { type: 'MISSION_RESET' },
    ]);
    expect(state).toEqual(INITIAL_MISSION);
  });
});
