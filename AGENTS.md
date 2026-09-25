# AGENTS.md

This file defines the operating rules for any coding or design agent working in this repository.

## Mission

Build **Código Rojo: Cancún 2035** as an immersive, replayable escape-room workshop that introduces prospective students to the professional worlds of AI and Cybersecurity through investigation and decision-making.

## Required reading order

Before changing code or game content, read:

1. `AI_CONTEXT.md`
2. `docs/01-experience-vision.md`
3. `docs/02-story-bible.md`
4. `docs/03-game-design.md`
5. `docs/04-interface-system.md`
6. `docs/05-technical-strategy.md`

If changing a specific station, also read its prompt in `prompts/interfaces/`.

## Source-of-truth hierarchy

When documents conflict, use this priority:

1. `docs/03-game-design.md` — puzzle and progression truth.
2. `docs/02-story-bible.md` — narrative truth.
3. `docs/04-interface-system.md` — visual/interaction truth.
4. `docs/05-technical-strategy.md` — implementation guidance.
5. Interface prompts — implementation briefs, subordinate to the above.

Do not silently rewrite the story to make implementation easier.

## Product rules

- No tutorial arrows, pulsing “click me” controls, explicit next-step instructions, or gamified hand-holding.
- A clue may be subtle; it must not be arbitrary.
- Every puzzle must have a logical path from evidence to inference.
- Avoid expert-only cybersecurity knowledge.
- Use simulated evidence only.
- AI outputs must be helpful but not infallible.
- Incorrect player decisions may have consequences, but the game must remain explainable and fair.
- The central screen communicates state and pressure; it is not a quest log.
- Visual language must feel like a credible 2035 command center, not a movie parody.

## Engineering rules

### Optimize for pilot speed

Preferred initial stack:
- Vite
- React
- TypeScript
- Tailwind CSS
- local/static JSON or TypeScript fixtures
- lightweight shared state

Do not add a backend, database, authentication, cloud queue, observability platform, or elaborate state-management framework without a concrete gameplay need.

### Testing policy

Automated tests are **not a default deliverable** for this prototype.

Add a test only when failure would likely destroy a live session and the behavior is cheap to verify automatically, especially:
- code/cipher validation,
- state transitions that unlock another station,
- central-screen state synchronization,
- deterministic puzzle rules.

Do not spend time on broad unit coverage, integration suites, smoke suites, visual regression infrastructure, or CI complexity during the pilot unless specifically requested.

### Demo reliability

Even without broad testing, manually verify the happy path after meaningful changes:
- app starts,
- each station renders,
- valid code unlocks,
- invalid code does not,
- central state can reach final outcome,
- reset works.

## UX rules

- Full-screen first.
- Designed for 1080p displays and a large central LED.
- Large readable typography.
- Information density may be high, but hierarchy must be immediate.
- Dark, premium, operational aesthetic.
- Avoid generic neon-cyberpunk overload.
- Use motion to indicate system activity, not decoration.
- Do not make the suspicious clue visually scream “answer.”

## Content rules

Use Spanish as the participant-facing default unless otherwise specified.
Technical labels can use familiar English conventions when realistic (e.g. LOGIN, NODE, EVENT ID), but narrative copy should remain understandable.

## Change discipline

For any non-trivial feature:
1. State the narrative purpose.
2. State the clue or mechanic affected.
3. Implement the smallest coherent version.
4. Check it against the anti-hand-holding rules.
5. Update documentation when gameplay truth changes.

## Role boundaries

Specialized role prompts live in `agents/`. An orchestrating agent may delegate work using those role definitions. No specialized agent may redefine the canonical story or puzzle graph without updating the source-of-truth docs.
