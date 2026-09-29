# Estación 02 — Identidad y Accesos (v1)

Consola de identidad de VÉRTICE: actividad de accesos y sesiones, perfil de la identidad y cronología de sesiones por usuario.
Reutiliza el patrón técnico de Comunicaciones (marco, cliente de misión, fase derivada, acción explícita) con composición propia.

| Activa | Evento abierto | Evidencia registrada |
|---|---|---|
| ![](identidad-activo.png) | ![](identidad-evento-abierto.png) | ![](identidad-evidencia-registrada.png) |

Variante MIDNIGHT (el selector sol/luna está en la cabecera, sin parámetros): ![](identidad-evento-abierto-midnight.png)

## Propósito y ruta

Determinar **qué identidad presenta un comportamiento incompatible con su patrón habitual** (`docs/03-game-design.md`, Hilo B).

```text
http://localhost:5173/station/identidad     (junto a  /  y  /station/comunicaciones, en el mismo navegador)
```

Modo portátil: una computadora, sin red. Usa `useMissionClient()` y el transporte existente; no añade transporte, servidor ni WebSocket.

## Evidencia y flujo de descubrimiento

Evidencia: **`ACC-417`** · fuente: **`identidad`** · evento canónico: `09:16:04 · vcruz · TER-REM-91 · REMOTO · ACCESO CONCEDIDO`.

1. El alumno explora la actividad (16 eventos; búsqueda por usuario/dispositivo, filtro por resultado y por zona).
2. Al abrir un evento ve sus datos, el **perfil** de la identidad (equipo y zona habituales, dispositivos registrados, sesiones activas)
   y la **cronología de sesiones** del usuario. El identificador está en **Detalles del evento**.
3. La incompatibilidad se descubre por comparación: `vcruz` mantiene actividad continua en `EST-OPS-12` / `CENTRO-OPERACIONES`
   mientras aparece una sesión concedida desde `TER-REM-91` / `REMOTO`. Nada se marca como «sospechoso»; `ACC-417` se ve como
   cualquier otro acceso concedido.
4. Con **Agregar a la investigación** (acción explícita; abrir el evento no basta) se emite **una vez**:

   ```ts
   { type: 'EVIDENCE_DISCOVERED', evidenceId: 'ACC-417', source: 'identidad' }
   ```
5. Otro evento → «La actividad seleccionada no presenta suficiente incompatibilidad con el perfil conocido. Revisa usuario, dispositivo,
   zona y contexto.» (sin bloquear ni decir qué campo). Reenviar `ACC-417` no emite nada.
6. Tras registrar: «EVIDENCIA REGISTRADA · ACC-417», «Evidencia registrada y enviada» y «En espera de correlación». La estación sigue
   activa. Identidad **no** muestra `COR-512`, `NOD-204` ni `AGR-27`, ni relaciona el acceso con el correo: eso es razonamiento del equipo.

Distractores canónicos incluidos (sin subtramas): `pnunez` con acceso denegado seguido de concedido, y `ftorres` con una sesión remota
legítima respaldada por una ventana de soporte programada (regla del rol: un acceso fallido no necesariamente es un ataque).

## Interacción con el Mission Engine (primera convergencia)

La estación **no** decide la correlación. Cuando el motor tiene `COR-512` y `ACC-417` (en cualquier orden), su reducer establece
`identityCorrelationEstablished = true`; la cronología existente hace que VÉRTICE pase a «Correlación de identidad establecida»
al llegar a `09:20:11`. No se adelanta el reloj ni se cambia la historia.

Si `COR-512` ya estaba registrada al abrir la estación, esta recupera la sesión por el replay del host (queda **ACTIVE**, no
`WAITING`): el descubrimiento de `ACC-417` completa la correlación igual.

## Archivos

| Qué | Dónde |
|---|---|
| Datos canónicos (16 eventos ACC-404…419, 6 usuarios) | `src/stations/identity/data.ts` |
| Lógica pura (descubrimiento, filtros, sesiones derivadas, reducer de UI) | `src/stations/identity/logic.ts` |
| Tipos | `src/stations/identity/types.ts` |
| Presentación | `IdentityStation.tsx`, `IdentityEventList.tsx`, `IdentityEventReader.tsx`, `IdentityProfile.tsx`, `ActivityTimeline.tsx` |
| Tests | `src/stations/identity/__tests__/logic.test.ts` |
| Compartido con Comunicaciones | `src/stations/shell/` (`discovery.ts`, `useStationSession.ts`, `help.ts`, `InvestigationRail.tsx`, `WaitingScreen.tsx`, `StationDevPanel.tsx`, `icons.tsx`, `StationShell.tsx`) |
| Ruta | `src/entry.tsx` |

Las sesiones y la cronología se **derivan de los eventos** (una sola fuente): no hay una lista de sesiones aparte que pueda contradecirlos.

## Ayudas, reset y desarrollo

- Ayudas de sistema (mismos tiempos que Comunicaciones: 3 y 5 min sin evidencia, o 3 intentos fallidos): «Hay identidades con actividad
  simultánea desde contextos distintos.» y después «Sugerencia de análisis: compara usuario, dispositivo, zona y comportamiento
  habitual.» No nombran usuario, dispositivo ni evento.
- Reset: `MISSION_RESET` (VÉRTICE → «Restablecer») devuelve la estación a «Estación preparada» y limpia su UI local.
- `?dev=true` (solo desarrollo): botón `dev` para iniciar la misión sin VÉRTICE, marcar `ACC-417`, volver a ACTIVE, reiniciar y forzar
  ayudas. El tema DAY / MIDNIGHT **no** es de desarrollo: es el selector normal de la cabecera.

## Límites conocidos

- Las estaciones no comparten reloj de misión: el registro es estático y termina hacia las 09:17, mientras VÉRTICE arranca su
  cronología en 09:12; quien compare el reloj de VÉRTICE con las horas del registro al inicio verá eventos «futuros» (ocurre igual en
  Comunicaciones). Se resuelve con el reloj de misión compartido del modo distribuido.
- No se probó aún la dificultad (objetivo 3–6 min) con alumnos reales.
