import { describe, expect, it } from 'vitest';
import { MissionEngine } from '../../../mission/engine';
import { COMMUNICATIONS_ASSISTANT } from '../../communications/assistant';
import { IDENTITY_ASSISTANT } from '../../identity/assistant';
import { assistantReducer, initialAssistant, levelsOf } from '../assistantState';
import { ASSISTANT_TIMING } from '../config';
import type { AssistantAct, AssistantState } from '../types';

const T = ASSISTANT_TIMING.identidad; // manual: aviso + solicitud
const run = (acts: AssistantAct[], from: AssistantState = initialAssistant(), timing: typeof T = T) =>
  acts.reduce((s, a) => assistantReducer(s, a, timing), from);
const tick = (seconds: number): AssistantAct => ({ type: 'TICK', seconds });

describe('Analysis Assistant — escalera de orientación', () => {
  it('empieza en la orientación inicial: nada mostrado, nada disponible, contadores a cero', () => {
    expect(initialAssistant()).toEqual({
      shownLevel: 0, availableLevel: 0, requestedCount: 0, inactiveSeconds: 0, elapsedSeconds: 0, failedAttempts: 0, seenSignals: [],
    });
    // Un minuto de quietud todavía no hace disponible nada.
    expect(run([tick(T.stepSeconds[0] - 1)]).availableLevel).toBe(0);
  });

  it('la inactividad hace disponible una recomendación, sin mostrarla sola', () => {
    const s = run([tick(T.stepSeconds[0])]);
    expect(s.availableLevel).toBe(1);
    expect(s.shownLevel).toBe(0);
    // Mientras haya una sin pedir, el tiempo no desbloquea la siguiente.
    expect(run([tick(600)], s).availableLevel).toBe(1);
  });

  it('solicitar revela solo el siguiente nivel, sin saltos', () => {
    // 6 fallos dejan disponibles los 4 niveles; aun así se piden de uno en uno.
    let s = run(Array.from({ length: 6 }, () => ({ type: 'FAILED_ATTEMPT' }) as AssistantAct));
    expect(s.availableLevel).toBe(4);
    expect(s.shownLevel).toBe(0);
    for (let expected = 1; expected <= 4; expected++) {
      s = run([{ type: 'REQUEST' }], s);
      expect(s.shownLevel).toBe(expected);
      expect(s.requestedCount).toBe(expected);
    }
    // Sin nada disponible, solicitar no hace nada.
    const idle = run([tick(T.stepSeconds[0]), { type: 'REQUEST' }]);
    expect(run([{ type: 'REQUEST' }], idle)).toEqual(idle);
  });

  it('no se puede superar el último nivel', () => {
    const levels = levelsOf(T);
    let s = initialAssistant();
    for (let i = 0; i < 20; i++) s = run([tick(1000), { type: 'FAILED_ATTEMPT' }, { type: 'REQUEST' }, { type: 'FORCE_NEXT' }], s);
    expect(s.shownLevel).toBe(levels);
    expect(s.availableLevel).toBe(levels);
    expect(s.requestedCount).toBeLessThanOrEqual(levels);
  });

  it('la actividad significativa retrasa la ayuda, pero solo si es nueva y sin poder bloquearla para siempre', () => {
    const step = T.stepSeconds[0]!;
    // Una acción nueva reinicia la inactividad…
    let s = run([tick(step - 10), { type: 'PROGRESS', key: 'event:ACC-404' }]);
    expect(s.inactiveSeconds).toBe(0);
    expect(run([tick(step - 10)], s).availableLevel).toBe(0);
    // …repetir la misma no cuenta como avanzar.
    s = run([tick(step - 10), { type: 'PROGRESS', key: 'event:ACC-404' }], s);
    expect(s.inactiveSeconds).toBe(step - 10);
    // Explorar sin parar tiene un tope: la recomendación acaba estando disponible.
    s = initialAssistant();
    for (let i = 0; i < 100 && s.availableLevel === 0; i++) s = run([tick(20), { type: 'PROGRESS', key: `event:${i}` }], s);
    expect(s.availableLevel).toBe(1);
    expect(s.elapsedSeconds).toBeLessThanOrEqual(step * T.maxDeferFactor + 20);
    // Un clic trivial (sin señal) nunca reinicia nada.
    expect(run([tick(30), { type: 'PROGRESS', key: '' }]).inactiveSeconds).toBe(30);
  });

  it('varios intentos fallidos hacen disponible orientación adicional', () => {
    const attempts = (n: number) => Array.from({ length: n }, (_, i) => ({ type: 'FAILED_ATTEMPT', key: `attempt:${i}` }) as AssistantAct);
    expect(run(attempts(T.failedAttemptsAt[0]! - 1)).availableLevel).toBe(0);
    const s = run(attempts(T.failedAttemptsAt[0]!));
    expect(s.availableLevel).toBe(1);
    expect(s.shownLevel).toBe(0); // aviso, no recomendación automática
    // Repetir el mismo intento cuenta como fallo, pero no como progreso.
    const same = run([tick(50), { type: 'FAILED_ATTEMPT', key: 'attempt:x' }, tick(10), { type: 'FAILED_ATTEMPT', key: 'attempt:x' }]);
    expect(same.failedAttempts).toBe(2);
    expect(same.inactiveSeconds).toBe(10);
  });

  it('el reset limpia el asistente por completo', () => {
    const dirty = run([
      tick(500), { type: 'PROGRESS', key: 'a' }, { type: 'FAILED_ATTEMPT', key: 'b' },
      { type: 'FAILED_ATTEMPT', key: 'c' }, { type: 'FAILED_ATTEMPT', key: 'd' }, { type: 'REQUEST' },
    ]);
    expect(dirty).not.toEqual(initialAssistant());
    expect(run([{ type: 'RESET' }], dirty)).toEqual(initialAssistant());
  });

  it('solicitar ayuda no modifica MissionState ni evidencia', () => {
    const engine = new MissionEngine();
    engine.dispatch({ type: 'MISSION_START' });
    engine.dispatch({ type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' });
    const before = JSON.stringify(engine.getState());
    run([tick(1000), { type: 'FAILED_ATTEMPT', key: 'x' }, { type: 'REQUEST' }, { type: 'REQUEST' }, { type: 'FORCE_NEXT' }, { type: 'RESET' }]);
    expect(JSON.stringify(engine.getState())).toBe(before);
    expect(engine.getState().discoveredEvidence).toEqual(['COR-512']);
    // Frontera de arquitectura: el asistente no importa nada del Mission Engine.
    const sources = import.meta.glob<string>(['../*.ts', '../*.tsx'], { query: '?raw', import: 'default', eager: true });
    expect(Object.keys(sources).length).toBeGreaterThanOrEqual(5);
    for (const src of Object.values(sources)) {
      const imports = src.split('\n').filter((l: string) => /^\s*(import|export)\b.*\bfrom\b/.test(l));
      expect(imports.filter((l: string) => /mission/i.test(l))).toEqual([]);
    }
  });
});

describe('Analysis Assistant — planes de las estaciones', () => {
  it('cada plan tiene un nivel de calibración por recomendación', () => {
    for (const plan of [IDENTITY_ASSISTANT, COMMUNICATIONS_ASSISTANT]) {
      expect(plan.hints.length).toBe(plan.timing.stepSeconds.length);
      expect(plan.hints.length).toBe(plan.timing.failedAttemptsAt.length);
    }
  });

  it('las recomendaciones de Identidad orientan sin revelar la respuesta', () => {
    const all = IDENTITY_ASSISTANT.hints.map((h) => `${h.text} ${(h.actions ?? []).map((a) => `${a.label} ${a.payload ?? ''}`).join(' ')}`).join(' ');
    for (const secret of ['ACC-417', 'TER-REM-91', 'COR-512', 'NOD-204', 'AGR-27']) expect(all).not.toContain(secret);
    // Hasta el patrón no se nombra ni al usuario ni a su equipo habitual.
    const beforeUnlock = IDENTITY_ASSISTANT.hints.slice(0, -1).map((h) => h.text).join(' ');
    for (const hint of ['vcruz', 'Valeria', 'EST-OPS-12', '09:16']) expect(beforeUnlock).not.toContain(hint);
    // Las acciones solo enfocan o filtran: ninguna abre, selecciona o vincula un evento.
    const ids = IDENTITY_ASSISTANT.hints.flatMap((h) => (h.actions ?? []).map((a) => a.id));
    expect(ids.every((id) => ['focus-profile', 'focus-sessions', 'focus-zones', 'show-user-activity'].includes(id))).toBe(true);
  });

  it('Comunicaciones conserva su ritmo original (180 s / 300 s / 3 fallos) sobre el motor común', () => {
    const c = ASSISTANT_TIMING.comunicaciones;
    let s = run([tick(179)], initialAssistant(), c as never);
    expect(s.shownLevel).toBe(0);
    s = run([tick(1)], s, c as never);
    expect(s.shownLevel).toBe(1);
    s = run([tick(119)], s, c as never);
    expect(s.shownLevel).toBe(1);
    s = run([tick(1)], s, c as never);
    expect(s.shownLevel).toBe(2);
    const misses = run([1, 2, 3].map((i) => ({ type: 'FAILED_ATTEMPT', key: `m${i}` }) as AssistantAct), initialAssistant(), c as never);
    expect(misses.shownLevel).toBe(2);
    expect(misses.requestedCount).toBe(0);
  });
});
