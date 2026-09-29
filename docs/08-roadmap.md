# 08 — Roadmap

> Modo principal de ejecución del piloto: **modo portátil** (1 computadora · 1 navegador · sin red).
> Ver [`12-modos-de-ejecucion.md`](12-modos-de-ejecucion.md).

## Fase actual — cerrada ✅

- [x] VÉRTICE central
- [x] World Model
- [x] DAY / MIDNIGHT
- [x] Mission Engine
- [x] `MissionTransport` (abstracción de transporte)
- [x] Modo portátil: `BroadcastChannel` (VÉRTICE = host, estaciones = clientes, late join con replay)
- [x] Station Shell + Mission Client
- [x] Estación 01 — Comunicaciones v1 (`docs/stations/comunicaciones.md`)
- [x] Estación 02 — Identidad y Accesos v1 (`docs/stations/identidad.md`); primera convergencia COR-512 + ACC-417

## Siguiente — hacia el piloto

- [x] Estación 03 — Infraestructura v1 (`docs/stations/infraestructura.md`); NOD-204
- [x] Estación 04 — Inteligencia v1 (`docs/stations/inteligencia.md`); AGR-27
- [x] Estación 05 — Respuesta v1 (`docs/stations/respuesta.md`): candado final, planes, confirmación y desenlaces
- [ ] Integración completa portátil
- [ ] Prueba con alumnos (piloto con 4–8 participantes nuevos)

## Después del piloto

- [ ] Modo distribuido multi-PC
- [ ] `WebSocketTransport` (mismo contrato `MissionTransport`)
- [ ] Mission Server
- [ ] Hardware adicional opcional
- [ ] Instalación permanente en el HUB

---

## Detalle por fase

### Fase 0 — Diseño canónico
- [x] Definir visión.
- [x] Definir incidente.
- [x] Definir empresa/plataforma ficticia: Vértice Sistemas Urbanos / VÉRTICE.
- [x] Definir idioma visible exclusivamente en español.
- [x] Definir roles y flujo completo de sesión.
- [x] Congelar solución base del piloto y cuatro identificadores.
- [ ] Completar datos simulados exactos de cada estación (Comunicaciones hecha).

### Fase 1 — Lenguaje visual
- [x] Tokens visuales (DAY / MIDNIGHT).
- [x] Prototipo de la pantalla central 1080p/full screen.
- [ ] Revisión en pantalla real (LED del HUB, si está disponible; no es requisito).

### Fase 2 — Cadena causal
- [x] Estación Comunicaciones.
- [x] Estación Identidad y accesos.
- [ ] Validar correlación sin facilitador (con alumnos; el motor ya la resuelve).

### Fase 3 — Análisis
- [x] Estación Infraestructura.
- [x] Estación Inteligencia.
- [ ] Validar razonamiento entre estaciones.

### Fase 4 — Resolución
- [ ] Candado final.
- [ ] Consola de respuesta.
- [ ] Desenlaces.
- [ ] Restablecimiento de una acción.

### Fase 5 — Estado compartido (modo portátil)
- [x] Mission Engine y transporte portátil (`BroadcastChannel`).
- [x] Conectar Comunicaciones a VÉRTICE.
- [ ] Conectar el resto de estaciones al añadirlas (solo agregar rutas; el sistema de misión no cambia).
- [x] Sin dependencia de red, internet ni infraestructura especial.

### Fase 6 — Piloto
- [ ] Ejecutar con 4–8 participantes nuevos.
- [ ] Registrar comportamiento e intervenciones.
- [ ] Ajustar dificultad.
- [ ] Repetir piloto.

---

## Opcional, después del piloto — modo distribuido e instalación permanente

Nada de esto es requisito del piloto ni del taller itinerante; son opciones para una **instalación permanente** en el HUB.

- [ ] Varias computadoras en red local con `WebSocketTransport` y Mission Server.
- [ ] Interacción con un switch/router de laboratorio aislado (acción física opcional).
- [ ] Acción física simple: conectar una laptop por Ethernet para activar/restaurar un enlace.
- [ ] Detectar estado físico sin exigir configuración de redes.
- [ ] Mantener todo separado de infraestructura real de la universidad.
- [ ] Evaluar VLAN/equipo dedicado únicamente cuando la experiencia digital ya esté estable.

La interacción física debe ampliar la inmersión, no convertir el taller en una práctica técnica de redes, y nunca debe volverse
un requisito para impartir la experiencia.
