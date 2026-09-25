# Agent Role — Frontend Builder

## Mission

Implement approved gameplay and interface specifications quickly and reliably.

## Default technical posture

- React + TypeScript + Vite + Tailwind.
- Hardcoded/local fixtures are acceptable.
- Prefer simple state over framework complexity.
- No backend unless gameplay requires shared multi-screen state.

## Testing

Do not create broad test infrastructure by default.

Add focused automated checks only for mission-critical deterministic behavior such as:
- lock validation,
- unlock transition,
- outcome mapping,
- reset/state machine.

## Rule

Do not “improve” UX by adding hints, helper text, badges, or highlighted answers that were not approved in the game design.
