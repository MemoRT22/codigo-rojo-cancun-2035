import type { NarrativeState } from '../types';

// ── Evidencias canónicas ──

export const EVIDENCE_IDS = ['COR-512', 'ACC-417', 'NOD-204', 'AGR-27'] as const;
export type EvidenceId = (typeof EVIDENCE_IDS)[number];

// ── Planes de respuesta ──

export const RESPONSE_PLANS = ['ALFA', 'BETA', 'GAMMA', 'DELTA'] as const;
export type ResponsePlan = (typeof RESPONSE_PLANS)[number];

// ── Estado de misión ──

export type MissionStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface MissionState {
  status: MissionStatus;
  discoveredEvidence: EvidenceId[];
  identityCorrelationEstablished: boolean;
  finalCorrelationValidated: boolean;
  responseUnlocked: boolean;
  selectedPlan: ResponsePlan | null;
  outcome: 'contained' | 'incomplete' | null;
  failedCorrelationAttempts: number;
  timedOut: boolean;
}

export const INITIAL_MISSION: MissionState = {
  status: 'idle',
  discoveredEvidence: [],
  identityCorrelationEstablished: false,
  finalCorrelationValidated: false,
  responseUnlocked: false,
  selectedPlan: null,
  outcome: null,
  failedCorrelationAttempts: 0,
  timedOut: false,
};

// ── Eventos ──

export type TerminalId = 'comunicaciones' | 'identidad' | 'infraestructura' | 'inteligencia' | 'respuesta' | 'control';

export type MissionEvent =
  | { type: 'MISSION_START' }
  | { type: 'MISSION_PAUSE' }
  | { type: 'MISSION_RESUME' }
  | { type: 'MISSION_RESET' }
  | { type: 'EVIDENCE_DISCOVERED'; evidenceId: EvidenceId; source: TerminalId }
  | { type: 'FINAL_CORRELATION_SUBMITTED'; origin: string; identity: string; propagation: string; correlation: string }
  | { type: 'PLAN_SELECTED'; plan: ResponsePlan }
  | { type: 'PLAN_CONFIRMED' }
  | { type: 'MISSION_TIMEOUT' }
  | { type: 'MANUAL_OVERRIDE'; narrativeState: NarrativeState };
