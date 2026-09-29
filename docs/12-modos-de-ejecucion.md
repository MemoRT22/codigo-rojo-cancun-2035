# 12 — Modos de ejecución

## Principio

**Código Rojo debe degradar elegantemente hacia la configuración más simple.**

| Configuración | Estado |
|---|---|
| **Mínima:** 1 computadora · 1 navegador · 1 pantalla | **Soportada. Es la configuración del piloto.** |
| **Mejorada:** 1 computadora · varias pantallas | Opcional. Solo reparte las ventanas; no cambia nada más. |
| **Laboratorio:** varias computadoras · misma red local | **Modo B — soportado v1.** Es la configuración del taller en el laboratorio (`docs/lab-setup.md`). |

La narrativa, el Mission Engine y las estaciones **no dependen** de cuál se use. La experiencia completa debe poder
impartirse en el HUB, un salón, una preparatoria, una feria u otro campus con **una computadora** y, opcionalmente, una
pantalla o proyector. No se requieren switches, racks, VLAN, servidor físico, backend externo, internet ni hardware de red.

La pantalla central (VÉRTICE) funciona igual en monitor, televisión, proyector o pantalla LED: es un lienzo 16:9 de
1920×1080 que se escala a cualquier tamaño. La LED del HUB es una excelente forma de presentarlo, no un requisito.

## Modo A — Portátil (soportado)

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
- Si el host arranca (o se recarga), difunde `MISSION_RESET`: las estaciones ya abiertas vuelven a su puesto preparado (rol y «Esperando activación de VÉRTICE»).

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

## Modo B — Laboratorio distribuido (soportado v1)

Varias computadoras en la misma red local: una principal con VÉRTICE (pantalla LED) y una por estación. **Internet no es necesario.**
Para el alumno es invisible: todas las estaciones pertenecen a VÉRTICE y reaccionan juntas. Operación práctica en **`docs/lab-setup.md`**.

```text
PC principal (LED)  →  npm run lab  →  servidor local: sirve la app (dist/) + repetidor WebSocket (/ws)
        ▲                                   ▲        ▲        ▲        ▲
   VÉRTICE = host                         COM       ID      INFRA     IA     (navegadores de las otras PCs = clientes)
```

- `WebSocketTransport` (`src/mission/webSocketTransport.ts`) cumple el mismo contrato `MissionTransport` y el mismo protocolo que el modo portátil
  (`event` · `sync-request` · `sync`). Motor y estaciones no saben qué transporte se usa.
- El servidor (`scripts/lab-server.mjs`) es solo un **repetidor**: reenvía cada mensaje a los demás navegadores (nunca al que lo originó). No tiene reducer,
  reglas ni estado; **la autoridad sigue siendo VÉRTICE (host)**, que conserva el registro de eventos de la sesión.
- **Selección de modo, por entorno (nunca por URL):** `npm run lab` hace que el servidor declare `window.__VERTICE_MODE__ = 'lab'` → WebSocket; `npm run dev` (o un build servido normalmente) no declara nada → BroadcastChannel (portátil). Ningún parámetro de la barra de direcciones cambia el comportamiento del producto: las URLs solo identifican la superficie (`/`, `/station/...`).
  La URL del socket sale del mismo servidor que sirvió la página (`ws://host:puerto/ws`, `wss` si es https).
- **Estación que entra tarde:** conecta → pide sincronización → el host responde con el registro → la estación queda en su estado (ACTIVE, evidencia, etc.).
- **Reconexión automática** (1 s, 2 s, 3 s y luego cada 3 s). El servidor envía un latido cada 5 s; sin latidos durante 15 s el navegador da la conexión por
  muerta (p. ej. Wi‑Fi caído) y reconecta.
  - *Estación:* al reconectar envía primero los eventos que emitió sin conexión y después pide sincronización.
  - *Host:* solo su **primera** conexión difunde `MISSION_RESET`. Una reconexión **no reinicia la sesión**: recoge de las estaciones lo que hicieron mientras estuvo
    caído, lo incorpora y difunde el registro completo. Un reinicio del servidor se recupera igual, porque el registro vive en el navegador del host.
- `MISSION_RESET` (VÉRTICE → «Restablecer») llega a todas las estaciones. Un `PLAN_CONFIRMED` que nace en otra computadora hace que VÉRTICE muestre el desenlace
  (ya lo hace por `mission.outcome`).

**Laboratorio: 4 estaciones físicas + Respuesta integrada en VÉRTICE.** En el laboratorio real hay cuatro puestos de análisis (Comunicaciones, Identidad, Infraestructura,
Inteligencia) y la pantalla LED con VÉRTICE. Cuando las cuatro evidencias están reunidas, VÉRTICE convierte la LED en el punto de reunión de la célula de respuesta
(candado, planes, autorización y consecuencia; `docs/stations/respuesta.md`). **Portátil:** la ruta `/station/respuesta` sigue disponible (una computadora, pruebas, contingencia).

**Limitaciones del modo laboratorio v1:**
- **Recargar el navegador de VÉRTICE reinicia la sesión** (el registro vive en su memoria); no hay persistencia de la misión. Una recarga de una estación, en cambio, se recupera sola.
- Sin reloj de misión compartido: las estaciones usan datos estáticos y el reloj narrativo vive en VÉRTICE.
- Sin autenticación ni TLS: pensado para la red local del taller, nunca para exponerlo a internet.
- El chip «Sincronizado» de las estaciones no refleja el estado real de la conexión (la reconexión es automática pero no se indica en pantalla).
- Cualquier red local sirve (switch, router, Ethernet o Wi‑Fi); solo se necesita conectividad IP entre las PCs. Ver los requisitos en `docs/lab-setup.md`.

## Deuda deliberada

- Reloj de misión compartido.
- Replay con secuencia/confirmaciones (hoy es «registro completo», suficiente para una sesión corta).
- Persistencia de la sesión del host y reconexión tras recarga del host.
- Indicador de conexión en las estaciones, descubrimiento de dispositivos, identidad de estación y control de acceso.
- La consola de Respuesta en la pantalla LED (hoy sigue siendo una estación más; sirve también para pruebas en modo portátil).
