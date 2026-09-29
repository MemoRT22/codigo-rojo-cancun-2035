# Estación 01 — Comunicaciones (v1)

Cliente corporativo de correo + análisis de comunicaciones dentro de VÉRTICE. Es el **patrón** para las demás estaciones
(marco común, cliente de misión, lógica de descubrimiento separada de datos y presentación).

| Activa | Evidencia registrada |
|---|---|
| ![](comunicaciones-activo.png) | ![](comunicaciones-evidencia-registrada.png) |

## Cómo abrirla

```bash
npm run dev
```

- `http://localhost:5173/` → LED central · `http://localhost:5173/station/comunicaciones` → Comunicaciones (otra pestaña).
- Con `?dev=true` aparece un botón `dev` (abajo a la izquierda): iniciar misión sin LED, marcar `COR-512`, volver a ACTIVE,
  reiniciar, forzar ayudas y alternar tema. `?theme=midnight` abre en MIDNIGHT. Sin `?dev=true` no hay controles ocultos.
- La LED (`D` → «Abrir estación Comunicaciones») abre la ruta. La sección «Forzar evidencia» de la LED es un atajo de pruebas.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Contenido canónico (10 correos, incluido `COR-512`) | `src/stations/communications/data.ts` |
| Lógica de descubrimiento, fases, filtros, ayudas | `src/stations/communications/logic.ts` |
| Presentación | `CommunicationsStation.tsx`, `MessageList/Reader.tsx`, `InvestigationRail.tsx` |
| Marco reutilizable (cabecera, estado, sincronía) | `src/stations/shell/` |
| Cliente de misión de una estación | `src/mission/useMissionClient.ts` |
| Transporte de desarrollo entre pestañas | `src/mission/devTransport.ts` |
| Rutas | `src/entry.tsx` (por `pathname`, sin React Router) |

Canon usado (`docs/03-game-design.md`, Hilo A): 09:11:08 · `COR-512` · «Validación requerida — actualización de identidad» ·
dominio oficial `@vertice-sistemas.example` · dominio falso `@vertice-sistema.example` · correos normales mezclados y un
distractor urgente legítimo (`COR-513`). Los `COR-506…515` restantes son identificadores ordinarios de mensaje.

## Cómo se registra COR-512

1. El alumno abre el correo, revisa remitente/dominio/horario y abre **Detalles del mensaje** (aquí está el identificador).
2. Pulsa **Agregar a la investigación** (acción explícita; abrir el mensaje no basta).
3. `submitToInvestigation()` (`logic.ts`) emite **un** evento, con la API real del motor:

   ```ts
   { type: 'EVIDENCE_DISCOVERED', evidenceId: 'COR-512', source: 'comunicaciones' }
   ```
4. Cualquier otra comunicación → «Sin coincidencia suficiente con el incidente actual.» (sin bloqueo, sin decir cuál es).
   Reenviar `COR-512` no emite nada. La fase se **deriva** de la misión (`WAITING → ACTIVE → EVIDENCE_FOUND → MISSION_FINISHED`);
   no hay estado global paralelo.

Ayudas (solo sistema, sin facilitador): a los 3 min sin evidencia (o 3 intentos fallidos) aparece una nota general; a los 5 min,
«compara remitente, dominio y horario» (tomado de la tarjeta de rol del Analista de Comunicaciones). No se señala ningún mensaje.

## Reset

`MISSION_RESET` (LED: «Restablecer»; estación con `?dev=true`) devuelve la estación a «Estación preparada» y limpia su UI local.

## Multi-PC: qué falta

La estación solo depende de `MissionTransport`. Hoy `devTransport.ts` (BroadcastChannel; la LED es *host*, guarda el registro de
la sesión y lo reenvía a estaciones que se abren tarde) simula el servidor entre pestañas del mismo navegador. Para multi-PC:

1. Implementar `WebSocketTransport` (mismo contrato `MissionTransport`) y devolverlo en `getMissionTransport()`.
2. Mission Server local que sea el host: reenvía eventos y entrega el registro al conectarse una estación.
3. (Futuro) autoridad del servidor sobre `MISSION_START/RESET` y reloj de misión compartido.

Limitaciones v1: `devTransport` no cruza navegadores/PC; si la LED se recarga, las estaciones vuelven a inicio; la estación no
muestra hora de misión (no hay reloj compartido todavía).
