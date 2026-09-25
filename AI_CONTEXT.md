# AI Context — read this first

You are working on **Código Rojo: Cancún 2035**, an immersive technological escape-room experience for prospective high-school students visiting the AI & Cybersecurity HUB at Universidad Anáhuac Cancún.

This repository is deliberately optimized for **experience design and rapid prototyping**, not enterprise production.

## North star

A participant should leave saying:

> “Sentí que estaba dentro de un centro de operaciones resolviendo una crisis real.”

Not:

> “Me dieron una presentación de IA y ciberseguridad.”

## What the experience is

- 20–25 minute immersive mission.
- 4–10 participants; optimal 6–8.
- One shared crisis, not teams competing against one another.
- A large central LED acts as the living status board for Cancún 2035.
- Around the room are investigation stations.
- Players discover clues and unlock progress with codes/ciphers.
- The system does not explicitly guide the next action.
- The final action is a professional incident-response decision.

## What the experience is not

- A quiz.
- A cybersecurity hacking challenge.
- A guided product tour.
- A generic chatbot demo.
- A childish video game.
- A production SaaS product.

## Current canonical incident

A staff member receives a convincing fake support email and enters credentials into a fraudulent page. The compromised account is used to access an internal service. Activity propagates into connected systems. The AI layer recognizes anomalous patterns but cannot independently determine the full cause. Players must correlate evidence across email, authentication, infrastructure, and AI analysis before choosing a containment response.

The incident is fictional and all data is simulated.

## Development philosophy

Prioritize, in this order:

1. Narrative coherence.
2. Puzzle quality and discoverability.
3. Immersion and visual quality.
4. Physical-room experience.
5. Reliable demo flow.
6. Code elegance.
7. Automated test coverage.

Hardcoding is acceptable during the pilot. Refactor only when it materially improves iteration or reliability.

## Mandatory agent behavior

Before implementing a feature, identify which narrative beat and clue dependency it serves. If neither exists, do not add it merely because it looks impressive.

Never reveal the solution through labels, obvious warning colors, tutorial copy, highlighted correct options, or instructions such as “select the suspicious user.”

See `AGENTS.md` for workflow and role rules.
