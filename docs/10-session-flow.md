# 10 — Flujo completo de sesión

## Objetivo

Definir la experiencia desde que los participantes cruzan la puerta hasta el debrief final.

La sesión debe poder ejecutarse con mínima intervención humana después de la activación.

Duración objetivo: **20–25 minutos**.

## 0. Estado previo

Antes de entrar el grupo:
- todas las estaciones en su **puesto preparado**: rol, responsabilidad, qué observa, pregunta de inicio y «Esperando activación de VÉRTICE» (sin ninguna respuesta),
- LED en operación normal con «Centro de operaciones VÉRTICE · Célula de respuesta en espera» (el reloj central espera en 09:15:58),
- cuenta regresiva detenida,
- consola final bloqueada,
- tarjetas de rol preparadas,
- sonido/ambiente restablecido.

El facilitador solo comprueba que el sistema esté listo.

## 1. Entrada — 0:00 a 1:00

Los participantes entran y ven la LED con:

> VÉRTICE  
> CENTRO DE OPERACIONES  
> Operación normal  
> Célula de respuesta en espera

Reciben una tarjeta de rol y se sientan en su puesto, donde ya leen quiénes son y qué observan.

No se explica todavía el incidente.

## 2. Asignación de identidad — 1:00 a 2:00

El facilitador dice únicamente:

> A partir de este momento forman parte de la Célula de Respuesta de Vértice. Cada tarjeta les da una responsabilidad inicial, pero pueden moverse, compartir información y apoyar cualquier estación.

No explicar qué pista existe en cada estación.

## 3. Briefing y activación — 2:00 a 3:00

El facilitador da el briefing de 45–60 s (`docs/pilot/briefing.md`; editable) y termina con «Activamos VÉRTICE».

Entonces pulsa `D` → **INICIAR EXPERIENCIA** y ocurre, sin más intervención:

1. **Las cuatro estaciones** muestran «Sesión operativa activada» + el título de su puesto (~2 s) y pasan casi a la vez a su interfaz.
2. **La LED** (reloj central desde 09:15:58): «Operación normal» → «Monitoreo activo» → «Variación detectada · Verificando identidad» → en unos **8 s**:

> ANOMALÍA DE IDENTIDAD DETECTADA  
> Correlación incompleta · Validación humana requerida

3. Con la anomalía **empieza la cuenta regresiva**:

> Tiempo de respuesta  
> 20:00

Las instrucciones de juego del briefing (comparar nombres, horarios, dispositivos e identificadores; no todo forma parte del incidente; el equipo puede moverse) no son pistas de solución. Una estación que se abra con la misión ya en curso entra directamente activa, sin la «ceremonia» de inicio.

## 4. Exploración libre — 3:00 a 9:00 aprox.

Los roles indican dónde puede comenzar cada persona, pero nadie queda restringido.

Resultados esperados:
- Comunicaciones descubre `COR-512`.
- Identidad encuentra varios eventos interesantes, incluyendo `ACC-417`.
- Infraestructura observa anomalías pero todavía puede carecer de contexto.
- Inteligencia encuentra agrupaciones y una hipótesis tentadora.

La LED escala gradualmente sin señalar estaciones.

## 5. Primera convergencia

El juego debe provocar la comparación de:
- hora del correo,
- usuario afectado,
- hora del acceso.

Cuando el equipo relaciona `COR-512` con `ACC-417`, comprende que no está investigando eventos separados.

La LED puede reaccionar de forma ambiental:

> CORRELACIÓN DE IDENTIDAD ESTABLECIDA

No mostrar “acertijo resuelto”.

## 6. Segunda convergencia

El equipo encuentra que `ACC-417` aparece relacionado con `SIN-04` y `NOD-204`.

La pregunta central pasa de:

> “¿Quién entró?”

a:

> “¿Qué alcanzó esa sesión?”

La LED escala actividad entre servicios.

## 7. Contradicción de inteligencia

La estación de Inteligencia presenta:
- `AGR-27` como propagación sustentada,
- `AGR-31` como hipótesis de posible origen en el Núcleo de Inteligencia con 84% de confianza.

La cronología permite rechazar la segunda como causa raíz porque la anomalía del Núcleo ocurre después de `NOD-204`.

Este es el momento conceptual más importante de IA.

## 8. Correlación final

> **En el laboratorio (4 estaciones físicas):** no hay estación de Respuesta. Al reunirse la cuarta evidencia, VÉRTICE (LED) muestra «Célula de respuesta requerida — Reúnan al equipo frente a VÉRTICE» y **la correlación final, los planes, la autorización y la consecuencia ocurren en la LED**. Ver `docs/stations/respuesta.md`.

El equipo llega a la consola final e introduce:

- ORIGEN → `COR-512`
- IDENTIDAD → `ACC-417`
- PROPAGACIÓN → `NOD-204`
- CORRELACIÓN → `AGR-27`

La consola responde:

> CORRELACIÓN VERIFICADA  
> AUTORIZACIÓN DE RESPUESTA CONCEDIDA

## 9. Decisión

La consola muestra cuatro planes sin clasificarlos.

El equipo debe debatir consecuencias y elegir.

La decisión debe ser grupal; el Líder/Coordinador confirma la ejecución.

## 10. Consecuencia

La LED reacciona a la decisión.

Si eligen DELTA:
- identidad revocada,
- sesiones invalidadas,
- SIN-04 aislado,
- actividad residual cae,
- Núcleo de Inteligencia vuelve a estable,
- servicios no afectados permanecen operativos.

Si eligen otra opción:
- mostrar consecuencia específica,
- nunca un simple “incorrecto”.

## 11. Revelación y debrief — 2–3 minutos

Mostrar cadena:

> CORREO FRAUDULENTO  
> ↓  
> IDENTIDAD COMPROMETIDA  
> ↓  
> ACCESO NO AUTORIZADO  
> ↓  
> PROPAGACIÓN DE SERVICIO  
> ↓  
> ANOMALÍA DETECTADA

Cerrar con:

> La inteligencia detectó patrones.  
> El equipo encontró la causa.

El coordinador académico puede añadir una explicación muy breve:

- Ciberseguridad: identidad, evidencia, infraestructura y respuesta.
- IA: detección de patrones, correlación, incertidumbre y criterio humano.

No convertir el cierre en una clase larga.

## 12. Restablecimiento

Una sola acción debe devolver:
- LED a operación normal,
- estaciones a datos iniciales,
- candado final a bloqueado,
- cronómetro a 20:00,
- desenlace a estado inicial.

Objetivo futuro: menos de 30 segundos entre grupos.
