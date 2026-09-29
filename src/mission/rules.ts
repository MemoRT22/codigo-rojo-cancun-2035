import type { NarrativeState } from '../types';
import { hms } from '../world/scenario';
import type { EvidenceId, MissionState, TerminalId } from './types';

// ── Correlación canónica ──

const CORRECT_CORRELATION = {
  origin: 'COR-512',
  identity: 'ACC-417',
  propagation: 'NOD-204',
  correlation: 'AGR-27',
} as const;

export function validateCorrelation(
  origin: string,
  identity: string,
  propagation: string,
  correlation: string,
): boolean {
  return (
    origin === CORRECT_CORRELATION.origin &&
    identity === CORRECT_CORRELATION.identity &&
    propagation === CORRECT_CORRELATION.propagation &&
    correlation === CORRECT_CORRELATION.correlation
  );
}

export function checkIdentityCorrelation(evidence: readonly EvidenceId[]): boolean {
  return evidence.includes('COR-512') && evidence.includes('ACC-417');
}

// ── Validación fuente/evidencia ──

const CANONICAL_SOURCE: Record<EvidenceId, TerminalId> = {
  'COR-512': 'comunicaciones',
  'ACC-417': 'identidad',
  'NOD-204': 'infraestructura',
  'AGR-27': 'inteligencia',
};

/** `true` si la fuente corresponde a la estación canónica o es el panel de control. */
export function isValidSource(evidenceId: EvidenceId, source: TerminalId): boolean {
  return source === 'control' || source === CANONICAL_SOURCE[evidenceId];
}

// ── Reglas de línea de tiempo ──

interface TimelineRule {
  from: NarrativeState;
  to: NarrativeState;
  atClock: number;
  condition?: (m: MissionState) => boolean;
}

const TIMELINE_RULES: TimelineRule[] = [
  {
    from: 'OPERACION_NORMAL',
    to: 'ANOMALIA_DETECTADA',
    atClock: hms('09:16:06'),
  },
  {
    from: 'ANOMALIA_DETECTADA',
    to: 'INCIDENTE_ESCALANDO',
    atClock: hms('09:16:51'),
  },
  {
    from: 'INCIDENTE_ESCALANDO',
    to: 'CORRELACION_ESTABLECIDA',
    atClock: hms('09:20:11'),
    condition: (m) => m.identityCorrelationEstablished,
  },
  {
    from: 'CORRELACION_ESTABLECIDA',
    to: 'RESPUESTA_AUTORIZADA',
    atClock: hms('09:21:05'),
    condition: (m) => m.finalCorrelationValidated,
  },
];

/**
 * Evalúa las reglas de línea de tiempo y devuelve la siguiente transición narrativa,
 * o `null` si ninguna regla aplica en este tick.
 */
export function evaluateTimeline(
  mission: MissionState,
  narrativeState: NarrativeState,
  clock: number,
): NarrativeState | null {
  if (mission.status !== 'running') return null;
  for (const rule of TIMELINE_RULES) {
    if (narrativeState === rule.from && clock >= rule.atClock) {
      if (!rule.condition || rule.condition(mission)) {
        return rule.to;
      }
    }
  }
  return null;
}
