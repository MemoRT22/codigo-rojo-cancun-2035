# 03 — Game Design

## Design status

This document defines the **pilot structure**. Specific codes and exact clue values may still change during prototype iteration, but the dependency logic should remain coherent.

## Core mechanic

**Code/lock progression.**

Players collect evidence and derive codes or keywords. Correct codes unlock deeper information or the final response console. The experience should minimize facilitator intervention.

A code must be the *result of reasoning*, not a random number hidden in the UI.

## Puzzle graph — pilot v0

The pilot uses four investigation threads that converge into a final authorization phrase.

### Thread A — Mail
Purpose: establish the likely initial social-engineering event.

Evidence:
- inbox with normal messages,
- one convincing fake support message,
- sender/display-name mismatch,
- subtle domain discrepancy,
- timestamp that becomes important later.

Output:
- keyword or short code derived from the suspicious message.

### Thread B — Access & Identity
Purpose: establish which account exhibited impossible or abnormal behavior.

Evidence:
- successful and failed logins,
- time,
- device,
- location/zone,
- role/normal access pattern.

Reasoning:
Players correlate the mail timestamp with an unusual authentication event and discover the compromised account.

Output:
- user identifier / numeric fragment / code.

### Thread C — Infrastructure
Purpose: establish which internal system was reached and how activity propagated.

Evidence:
- simplified network/service topology,
- traffic changes,
- node activity,
- event timestamps,
- one misleading but plausible noisy node.

Reasoning:
Players identify the node whose behavior changes immediately after the suspicious login and before downstream alerts.

Output:
- node/service identifier.

### Thread D — AI Analysis
Purpose: establish the correlation among events without letting AI solve the case.

Evidence:
- anomaly clusters,
- confidence scores,
- timeline correlations,
- one model hypothesis that is plausible but not fully supported.

Reasoning:
Players compare AI findings with the evidence from the other stations and determine which relationship is actually supported.

Output:
- final clue fragment / ordering instruction.

## Final lock

The outputs from A–D combine into a final authorization code or phrase.

The final console must remain unavailable until the team has solved the investigation. It should not show which fragment is missing in a way that reveals the source station.

Example pattern only (not canonical):

`[MAIL WORD] – [USER ID] – [NODE] – [ORDER]`

Do not hardcode this example as the final puzzle without intentionally designing the evidence around it.

## Final decision

Once authorized, players choose a containment strategy.

Candidate actions can include:
- revoke/lock compromised identity,
- rotate credentials,
- isolate affected service/node,
- preserve unaffected services,
- monitor residual activity,
- shut down all systems,
- do nothing / wait for more data.

The best outcome should require **targeted containment** based on the evidence rather than maximal shutdown.

The interface must not label choices as safe/unsafe or correct/incorrect before submission.

## Failure philosophy

A wrong code should not punish players with a dead end.

Possible response:
- reject code neutrally,
- introduce a short cooldown,
- leave the evidence available.

Do not show “wrong, look at the phishing email.”

A wrong final decision can produce a consequence ending, followed by an explanatory debrief.

## Hint system

Pilot preference: environmental hints before facilitator hints.

Possible levels:
1. Ambient clue becomes slightly more visible after time threshold.
2. Central LED surfaces a new system event that indirectly reinforces the relevant timeline.
3. Facilitator may deliver an in-fiction message only if the team stalls badly.

Do not automatically reveal answers.

## Fairness checklist for every puzzle

A puzzle is acceptable only if:
- all required information exists,
- the inference is logically defensible,
- distractors are plausible but distinguishable,
- no specialized cybersecurity vocabulary is required to solve it,
- the answer is not visually highlighted,
- a first-time high-school participant can understand why the solution was correct after reveal.

## Physical roles

Optional role cards can create identity without limiting movement:
- Analista de Inteligencia
- Investigador Digital
- Analista de Identidad
- Operador de Infraestructura
- Responsable de Continuidad
- Líder de Misión

Roles suggest where to begin, not where a participant must stay.
