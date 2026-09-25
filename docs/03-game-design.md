# 03 — Diseño del juego

## Estado

**Piloto v1 — base congelada para implementación.**

La dificultad se calibrará después de pruebas con participantes reales. La solución y la cadena causal sí se consideran canónicas para esta primera implementación.

## Mecánica principal

Progresión por **evidencia + identificadores + candado final**.

No existe un teclado de “código secreto” al final de cada estación. Los jugadores descubren identificadores que parecen formar parte natural del sistema y que, al correlacionarse, autorizan la consola final.

Los cuatro identificadores canónicos del piloto son:

- Correo: `COR-512`
- Acceso: `ACC-417`
- Infraestructura: `NOD-204`
- Inteligencia: `AGR-27`

Clave de correlación final:

`COR-512 / ACC-417 / NOD-204 / AGR-27`

## Regla de colaboración

Ninguna estación debe resolver por sí sola toda la historia.

La experiencia debe provocar conversaciones como:
- “¿Qué hora te aparece a ti?”
- “¿Cuál era el usuario?”
- “Pásame ese identificador.”
- “Eso ocurrió antes o después de la alerta de inteligencia?”

## Hilo A — Comunicaciones

### Propósito
Detectar el probable punto de entrada.

### Correo relevante
Hora: **09:11:08**  
Identificador: **COR-512**  
Asunto: **Validación requerida — actualización de identidad**

Dominio oficial:
`@vertice-sistemas.example`

Dominio falso:
`@vertice-sistema.example`

El correo falso debe ser convincente y mezclarse con 7–9 mensajes normales.

### Distractor
Debe existir al menos un mensaje que parezca alarmante o urgente pero sea legítimo. Su dominio, firma y contexto deben ser consistentes.

### Inferencia
El equipo no debe “adivinar phishing”; debe observar discrepancias de remitente/dominio, contexto y horario.

## Hilo B — Identidad y accesos

### Propósito
Determinar qué identidad presenta comportamiento incompatible con su patrón normal.

### Evento relevante
Hora: **09:16:04**  
Usuario: **vcruz**  
Dispositivo: **TER-REM-91**  
Zona: **REMOTO**  
Resultado: **ACCESO CONCEDIDO**  
Identificador: **ACC-417**

Valeria mantiene actividad en su estación habitual `EST-OPS-12`, lo que vuelve relevante la nueva sesión.

### Distractor
Un usuario distinto puede mostrar fallo seguido de acceso concedido o una sesión remota legítima respaldada por una ventana de soporte programada.

### Inferencia
La relación con el correo de las 09:11 vuelve especialmente importante el evento de las 09:16.

## Hilo C — Infraestructura

### Propósito
Descubrir qué servicio cambia de comportamiento después del acceso anómalo y antes de las alertas posteriores.

### Nodo relevante
Nodo: **SIN-04**  
Inicio de anomalía: **09:17:22**  
Actividad aproximada: de **14 solicitudes/s** a **163 solicitudes/s**  
Referencia de sesión: **ACC-417**  
Identificador de evidencia: **NOD-204**

### Distractor
`BUS-SEN-02` presenta un pico a las **09:12:40**, pero corresponde a una sincronización programada y documentada.

### Inferencia
La secuencia temporal y la referencia de sesión relacionan el acceso con `SIN-04`.

## Hilo D — Inteligencia

### Propósito
Usar IA como herramienta analítica sin convertirla en oráculo.

### Agrupaciones

**AGR-18 — Desviación de identidad**  
Confianza aproximada: 79%

**AGR-27 — Propagación entre servicios**  
Confianza aproximada: 92%  
Relaciona `ACC-417` → `NOD-204` → actividad posterior.

**AGR-31 — Inestabilidad del Núcleo de Inteligencia**  
Confianza aproximada: 84%  
Hipótesis: el Núcleo de Inteligencia podría estar originando la inestabilidad.

### Trampa conceptual

La hipótesis de `AGR-31` es plausible pero temporalmente inconsistente:

- `NOD-204`: 09:17:22
- anomalía del Núcleo de Inteligencia: 09:19:44

La evidencia permite concluir que el Núcleo puede ser consecuencia y no causa.

El identificador correcto para la correlación final es **AGR-27**.

## Candado final

La consola solicita cuatro identificadores bajo categorías neutrales:

- ORIGEN
- IDENTIDAD
- PROPAGACIÓN
- CORRELACIÓN

No debe decir de qué estación proviene cada respuesta.

Clave correcta:

`COR-512 / ACC-417 / NOD-204 / AGR-27`

Al validarse:

> CORRELACIÓN VERIFICADA  
> AUTORIZACIÓN DE RESPUESTA CONCEDIDA

## Planes de respuesta

### PLAN ALFA — Apagado general
Desconecta VÉRTICE, termina sesiones y suspende servicios conectados.

Consecuencia: detiene gran parte de la actividad, pero provoca pérdida innecesaria de continuidad.

### PLAN BETA — Contención de identidad
Bloquea `vcruz` y rota sus credenciales, pero mantiene `SIN-04` operativo.

Consecuencia: contención incompleta; la actividad ya establecida puede continuar.

### PLAN GAMMA — Aislamiento de inteligencia
Desconecta el Núcleo de Inteligencia y reinicia sus procesos.

Consecuencia: la actividad de `SIN-04` continúa. Demuestra por qué la hipótesis de IA no debía aceptarse sin contraste.

### PLAN DELTA — Contención dirigida
- revocar identidad comprometida,
- invalidar sesiones asociadas,
- aislar `SIN-04`,
- rotar credenciales del servicio,
- preservar servicios no afectados,
- monitorear actividad residual.

Es el desenlace de mayor preservación operativa y mejor correspondencia con la evidencia.

La interfaz nunca lo marca como “correcto” antes de ejecutarlo.

## Desenlace DELTA

La LED debe mostrar una secuencia similar:

- Identidad: REVOCADA
- SIN-04: AISLANDO → AISLADO
- Propagación: CRÍTICA → CONTENIDA → ESTABLE
- Núcleo de Inteligencia: ADVERTENCIA → ESTABLE
- servicios no afectados: OPERATIVOS

Cierre:

> INCIDENTE CONTENIDO  
> Servicios preservados: 5/6

## Fallos

Un identificador incorrecto:
- se rechaza de forma neutral,
- no revela qué campo está mal,
- no bloquea permanentemente.

Una decisión final equivocada:
- produce una consecuencia observable,
- nunca muestra simplemente “INCORRECTO”,
- termina con debrief que explica la causalidad.

## Calibración

No asumir que esta versión ya tiene la dificultad correcta. La prueba piloto debe medir:
- tiempo hasta primera evidencia relevante,
- tiempo de correlación entre estaciones,
- intervenciones del facilitador,
- pistas demasiado obvias,
- pistas injustas,
- comprensión del desenlace.
