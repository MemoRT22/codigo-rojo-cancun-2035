# 07 — Agent Workflow

## Purpose

Make the repository portable across Codex, Claude, Copilot, ChatGPT-based coding agents, or future agent meshes.

## Standard task flow

### 1. Orchestrator frames task
State:
- intended player experience,
- affected story beat,
- affected station,
- constraints.

### 2. Puzzle/Narrative validation
Before UI implementation, confirm the evidence and answer are coherent.

### 3. UI brief
Translate only approved clues into interface behavior.

### 4. Build
Implement smallest coherent slice.

### 5. Experience review
Review against immersion, fairness, anti-hand-holding, and live-demo reliability.

### 6. Update canonical docs
If actual gameplay truth changed, update source-of-truth docs in the same change.

## Suggested branch naming

- `feat/central-command`
- `feat/station-mail`
- `feat/station-access`
- `feat/station-infrastructure`
- `feat/station-ai`
- `feat/final-response`
- `feat/shared-state`
- `game/puzzle-v1`
- `fix/pilot-*`

## Suggested commit style

- `docs(game): define pilot puzzle graph`
- `feat(command): build incident escalation states`
- `feat(mail): add simulated inbox investigation`
- `feat(access): correlate login evidence`
- `fix(pilot): reduce clue ambiguity in access station`
