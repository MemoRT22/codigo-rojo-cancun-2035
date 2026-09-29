# 12 — Modos de ejecución

## Principio

**Código Rojo debe degradar elegantemente hacia la configuración más simple.**

| Configuración | Estado |
|---|---|
| **Mínima:** 1 computadora · 1 navegador · 1 pantalla | **Soportada. Es la configuración del piloto.** |
| **Mejorada:** 1 computadora · varias pantallas | Opcional. Solo reparte las ventanas; no cambia nada más. |
| **Futura:** varias computadoras · red local | Modo B. No implementado. |

La narrativa, el Mission Engine y las estaciones **no dependen** de cuál se use. La experiencia completa debe poder
impartirse en el HUB, un salón, una preparatoria, una feria u otro campus con **una computadora** y, opcionalmente, una
pantalla o proyector. No se requieren switches, racks, VLAN, servidor físico, backend externo, internet ni hardware de red.

La pantalla central (VÉRTICE) funciona igual en monitor, televisión, proyector o pantalla LED: es un lienzo 16:9 de
1920×1080 que se escala a cualquier tamaño. La LED del HUB es una excelente forma de presentarlo, no un requisito.

## Modo A — Portátil (actual y soportado)

- Una computadora, un navegador. Sin internet obligatorio, sin red externa.
- Cada superficie es una pestaña o ventana del **mismo navegador**:

  | Pestaña / ventana | Ruta | Estado |
  |---|---|---|
  | VÉRTICE (pantalla central) | `/` | implementada |
  | Comunicaciones | `/station/comunicaciones` | implementada (v1) |
  | Identidad y Accesos | `/station/identidad` | implementada (v1) |
  | Infraestructura | `/station/infraestructura` | implementada (v1) |
  | Inteligencia | `/station/inteligencia` | implementada (v1) |
  | Respuesta | `/station/respuesta` | implementada (v1) |

- Todas comparten el estado de misión mediante **BroadcastChannel** (`src/mission/broadcastTransport.ts`), detrás de la
  abstracción `MissionTransport`. Añadir una estación nueva es añadir una ruta en `src/entry.tsx`; el sistema de misión no cambia.
- Con una sola pantalla se alterna entre pestañas; con varias, se arrastran ventanas. Es indistinto para la experiencia.

### Modelo de autoridad

```text
VÉRTICE central = HOST      (mantiene el registro de eventos de la sesión)
Estaciones      = CLIENTES  (piden sincronización; emiten eventos de sus acciones)
```

- Cada pestaña tiene su propio `MissionEngine`; se mantienen iguales porque reducen la **misma secuencia de eventos**.
- Un evento local se reduce y se difunde; uno remoto se reduce sin re-difundir (no hay bucles).
- El host guarda la sesión en curso: `MISSION_START` abre el registro, `MISSION_RESET` lo vacía. Tanto los eventos que emite la
  LED como los que recibe de las estaciones entran al registro.
- **Late join / re-suscripción.** Cada vez que una estación se suscribe (montaje, StrictMode, HMR, recarga, apertura tardía) envía
  una petición de sincronización; el host responde con el registro completo (empieza en `MISSION_START`). El replay es
  *idempotente*: aplicarlo varias veces, o sobre un motor con estado, converge al mismo estado. Nada depende de que un único
  mensaje llegue en un momento concreto.
- Si el host arranca (o se recarga), difunde `MISSION_RESET`: las estaciones ya abiertas vuelven a «Estación preparada».

### Qué ocurre al recargar

| Acción | Resultado |
|---|---|
| Recargar una **estación** | Recupera la sesión en curso desde el host (misión, evidencia registrada, estado). Se pierde solo su UI local: mensaje seleccionado, leídos/no leídos, búsqueda/filtro, historial de análisis y el contador de ayudas (vuelve a 0). |
| Cerrar y volver a abrir una estación | Igual que recargarla. |
| Recargar **VÉRTICE (host)** | **Reinicia la sesión**: la misión vuelve a «sin iniciar», el reloj simulado y la cuenta regresiva se reinician y las estaciones abiertas vuelven a «Estación preparada». |
| Cerrar VÉRTICE con estaciones abiertas | Las estaciones conservan su último estado hasta que VÉRTICE vuelva a abrirse (entonces se reinician). |

No hay persistencia (ni `localStorage` ni base de datos) en esta fase; es una decisión deliberada.

### Ejecución

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173/` y `http://localhost:5173/station/comunicaciones`. Sin dependencias externas en tiempo de ejecución:
las fuentes están empaquetadas (`@fontsource-variable/inter`) y la geografía está versionada en el repositorio.

## Tema DAY / MIDNIGHT

Es una característica normal del producto, no de desarrollo: un **interruptor sol/luna arriba a la derecha**, idéntico en VÉRTICE
y en todas las estaciones (`StationShell`). Basta pulsarlo; no hace falta ningún parámetro de URL ni el panel de desarrollo.

- **Persistencia:** se guarda en `localStorage` (`vertice-theme`); al recargar o abrir otra vista se mantiene la elección.
- **Sincronización:** al cambiarlo en cualquier módulo, todas las pestañas VÉRTICE del mismo navegador cambian solas (canal
  `BroadcastChannel` propio del tema, con el evento `storage` como respaldo). Es independiente del Mission Engine.
- **Solo presentación:** no reinicia ni altera misión, estación, selección, evidencia, temporizador ni mundo simulado.
- **Transición:** fundido de iluminación de toda la pantalla (View Transitions; respaldo con transiciones CSS; inmediato si el
  sistema pide reducir movimiento). El atajo `M` en VÉRTICE hace lo mismo.
- **Accesibilidad:** `role="switch"`, `aria-checked`, etiqueta «Modo nocturno», tooltip «Cambiar a modo nocturno / claro», área de 64×44 px.

## Modo B — Distribuido (futuro, NO implementado, fuera del roadmap inmediato)

- Varias computadoras en red local.
- `WebSocketTransport` (mismo contrato `MissionTransport`) y un Mission Server que sea el host.
- Se activa cambiando **un solo punto**: `getMissionTransport()` en `src/mission/createTransport.ts`. Motor y estaciones no cambian.
- No exige switch, VLAN ni rack: cualquier red local sirve. El hardware dedicado solo se contempla como opción de **instalación
  permanente** (ver `docs/08-roadmap.md`).

## Deuda deliberada para el modo distribuido

- Autoridad del servidor sobre `MISSION_START`/`MISSION_RESET` y reloj de misión compartido.
- Replay con secuencia/confirmaciones (hoy es «registro completo», suficiente para una sesión corta y un solo navegador).
- Persistencia de sesión y reconexión tras caída del host.
- Descubrimiento de dispositivos, identidad de estación y control de acceso.
