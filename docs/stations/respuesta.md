# Estación 05 — Respuesta (v1)

Consola de autorización operativa: primero el equipo **demuestra** que reconstruyó el incidente (candado de correlación) y después **decide** una respuesta entre cuatro planes.
No es un examen: la decisión produce consecuencias operativas, nunca «correcto/incorrecto».

| Candado | Planes | Confirmación (DELTA) | Contención exitosa | Contención incompleta (GAMMA) |
|---|---|---|---|---|
| ![](respuesta-candado.png) | ![](respuesta-planes.png) | ![](respuesta-confirmacion-delta.png) | ![](respuesta-contencion-exitosa.png) | ![](respuesta-contencion-incompleta.png) |

## Ruta y etapas

```text
http://localhost:5173/station/respuesta     (junto a  /  y las otras cuatro estaciones, en el mismo navegador)
```

La etapa se **deriva** de `MissionState` (no hay estado paralelo de decisión):

| Etapa | Condición en el Mission Engine |
|---|---|
| Correlación (candado) | `!finalCorrelationValidated` |
| Autorización | `finalCorrelationValidated && !responseUnlocked` — «Autorización de respuesta pendiente» |
| Planes | `responseUnlocked`, sin `selectedPlan` (o el equipo pidió «Volver a los planes») |
| Confirmación | `selectedPlan` definido |
| Consecuencia | `outcome !== null` |

Late join: la estación abre directamente en la etapa que corresponde (candado, planes o consecuencia); no se repiten pasos ya resueltos.

## Candado y clave

Cuatro campos bajo categorías neutrales: **ORIGEN · IDENTIDAD · PROPAGACIÓN · CORRELACIÓN** (sin nombrar estaciones). **No se autocompleta** aunque el motor ya tenga las cuatro evidencias.
Se normaliza el formato (`cor512`, `COR 512` → `COR-512`). Clave canónica: `COR-512 / ACC-417 / NOD-204 / AGR-27`.
El envío es `FINAL_CORRELATION_SUBMITTED` al Mission Engine (la única validación). Si no coincide: «La correlación propuesta no puede validarse con la evidencia
disponible. Revisa origen, identidad, propagación y correlación antes de volver a enviar.» (sin señalar campo, sin penalización, reintentable).

## Autorización

Al validarse aparece **CORRELACIÓN VERIFICADA**. La estación **no** dispara `RESPONSE_UNLOCKED` ni adelanta el reloj: el host VÉRTICE lo hace por cronología
(`RESPUESTA_AUTORIZADA`, 09:21:05 simulado). Mientras tanto muestra «VÉRTICE está completando la validación operacional. Autorización de respuesta pendiente.»
y, al llegar `responseUnlocked`, «Autorización de respuesta concedida» y los planes.

## Planes y decisión

Los cuatro con el **mismo peso visual** (sin colores, marcas ni recomendaciones). Al abrir uno se compara *qué contiene, qué deja activo, qué interrumpe y qué riesgo residual conserva*:
ALFA — Apagado general · BETA — Contención de identidad · GAMMA — Aislamiento de inteligencia · DELTA — Contención dirigida (`logic.ts`).
Flujo: revisar → **Seleccionar plan** (`PLAN_SELECTED`) → resumen «PLAN SELECCIONADO … Revisa las consecuencias antes de autorizar» → **AUTORIZAR RESPUESTA** (`PLAN_CONFIRMED`).
Un clic accidental no ejecuta nada; se puede volver a los planes antes de autorizar.

## Consecuencias

El Mission Engine calcula `outcome` (`DELTA` → `contained`; el resto → `incomplete`); la estación conserva `selectedPlan` para mostrar la consecuencia **específica**:
DELTA — Identidad REVOCADA · Sesiones INVALIDADAS · SIN-04 AISLANDO→AISLADO · Propagación CRÍTICA→CONTENIDA→ESTABLE · Núcleo ADVERTENCIA→ESTABLE · Servicios no afectados OPERATIVOS, con
«INCIDENTE CONTENIDO · Servicios preservados: 5/6». ALFA — actividad detenida, pero servicios saludables fuera de línea. BETA — identidad contenida, SIN-04 activo y actividad residual.
GAMMA — Núcleo aislado, pero SIN-04 activo y propagación persistente (correlación ≠ causalidad, sin sermón).
**Respuesta explica la decisión; VÉRTICE la dramatiza** (es una pantalla distinta).

## Corrección compartida: VÉRTICE observa `mission.outcome`

Antes, el cambio visual del desenlace vivía en `confirmPlan()` de VÉRTICE, que solo se ejecuta si el plan se confirma **localmente**. Como Respuesta es un cliente separado, el host recibía
`PLAN_CONFIRMED` por el transporte y `outcome` cambiaba, pero el mundo no. Ahora `useMission` reacciona a `mission.outcome` (efecto con la transición anterior, sin bucles):
`contained` → `CONTENCION_EXITOSA`, `incomplete` → `CONTENCION_INCOMPLETA`, sin importar el origen del evento. Si `outcome` vuelve a `null` con el mundo en un desenlace (reset remoto),
el mundo vuelve a operación normal. `confirmPlan()` sigue existiendo y solo despacha el evento. No se tocó el transporte ni el reducer.

## Analysis Assistant

Mismo motor; plan propio (`assistant.ts`) y fila en `assistant/config.ts`. Solo aparece en la etapa de decisión y su temporizador se reinicia al recibir la autorización. Orienta sobre alcance,
continuidad, riesgo residual y servicios saludables; **nunca nombra un plan como la elección** ni entrega identificadores. En el candado no hay asistente: solo el recordatorio fijo
«Revisa los identificadores que cada equipo agregó a la investigación.»

## Reset

`MISSION_RESET` deja `selectedPlan`, `outcome`, `finalCorrelationValidated` y `responseUnlocked` en su estado inicial (reducer), Respuesta vuelve a «Estación preparada» con el candado vacío, y VÉRTICE a operación normal
(tanto si el reset se hace en VÉRTICE como desde una estación con `?dev=true`).

## Limitaciones conocidas

- VÉRTICE tiene un solo desenlace «Contención incompleta» para ALFA, BETA y GAMMA; la consecuencia específica de cada uno solo se ve en la estación Respuesta.
- Las horas de la autorización dependen del reloj simulado de VÉRTICE (sin reloj compartido). Con velocidad normal, la autorización llega ~9 min después de iniciar; en pruebas se usa `?speed=`.
- Tras `PLAN_CONFIRMED` el motor marca la misión como `finished`: las demás estaciones muestran «Sesión finalizada».
- No hay debrief, estadísticas ni puntuación (fuera del alcance). Sin tests automáticos propios (fase piloto); validado manualmente en el navegador.
