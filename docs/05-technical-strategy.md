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

No backend is required: the pilot runs entirely in one browser on one machine.

## Execution modes

Full detail: [`12-modos-de-ejecucion.md`](12-modos-de-ejecucion.md).

**Principle: degrade gracefully toward the simplest configuration.**

- Minimum: 1 computer, 1 browser, 1 screen.
- Improved: 1 computer, several screens.
- Future: several computers on a local network.

Narrative and logic must not depend on which of these is used.

### Mode A — Portable (current, supported, default for the pilot)
- One computer, no mandatory internet, no external network, no special hardware.
- VÉRTICE (`/`) and each station (`/station/<name>`) run as tabs/windows of the same browser.
- State is shared through `BroadcastChannel` behind the `MissionTransport` abstraction.
- VÉRTICE central is the **host** (keeps the session event log); stations are **clients** (request a replay whenever they subscribe).

### Mode B — Distributed (future, NOT implemented, not in the pilot roadmap)
- Several computers, `WebSocketTransport`, a local Mission Server.
- Swapping the transport is a single point (`getMissionTransport()` in `src/mission/createTransport.ts`); engine and stations do not change.
- No dedicated switch, VLAN or rack is required by design; dedicated hardware is only an optional permanent-installation idea.

### After the pilot
Only with pilot feedback, consider: configurable scenarios, scenario packs, facilitator controls, remote deployment,
analytics, school-specific variants.

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
- no runtime network dependency at all (no CDN, fonts or APIs; everything is bundled),
- assets available locally,
- predictable full-screen behavior.
