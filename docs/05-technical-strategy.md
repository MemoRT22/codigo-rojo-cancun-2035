# 05 — Technical Strategy

## Goal

Ship a convincing local pilot quickly, then harden only what live use proves necessary.

## Recommended pilot stack

- Vite
- React
- TypeScript
- Tailwind CSS
- static/local fixtures
- lightweight shared state

No backend is required for the first single-machine/single-browser mockups.

## Deployment evolution

### Stage 1 — independent mockups
Each interface can run independently for visual/gameplay validation.

### Stage 2 — local multi-screen experience
Introduce a tiny shared state layer only when needed to make:
- central LED react to station solves,
- final console unlock,
- reset all stations.

Possible implementation later:
- small local Node/WebSocket service,
- lightweight realtime mechanism on the LAN.

Do not build this until individual station interactions are validated.

### Stage 3 — portable workshop
Only after pilot feedback, consider:
- configurable scenarios,
- scenario packs,
- facilitator controls,
- remote deployment,
- analytics,
- school-specific variants.

## State model concept

Suggested narrative states:
- `NORMAL`
- `ANOMALY_DETECTED`
- `INCIDENT_ESCALATING`
- `EVIDENCE_CORRELATED`
- `RESPONSE_AUTHORIZED`
- `CONTAINED`
- `PARTIAL_FAILURE`

Station-level state can remain simple:
- locked/unlocked,
- clue solved/not solved,
- local selection state.

## Reset is important

A reusable workshop must have a reliable one-action reset before the next group. This is more important than broad automated test coverage.

## Data strategy

Use fictional fixtures checked into the repository.

Keep datasets readable and editable by designers. Prefer JSON/TS fixtures over hidden generation logic during the pilot.

## Safety

All cyber evidence is simulated. Do not connect the workshop to live university infrastructure, real credentials, real email, real endpoints, or real internal network telemetry.

## Testing policy

Do not create a comprehensive test suite by default.

Tests are justified for deterministic mechanics where a silent regression could break a session:
- code validation,
- unlock dependencies,
- final response mapping,
- reset/state machine.

For visuals and narrative content, prioritize direct manual review in the actual display environment.

## Performance priorities

- smooth rendering on lab hardware,
- no noticeable input delay,
- no unnecessary network dependency,
- assets available locally,
- predictable full-screen behavior.
