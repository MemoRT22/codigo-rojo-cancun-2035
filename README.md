# Código Rojo: Cancún 2035

Experiencia inmersiva de respuesta tecnológica para el HUB de Inteligencia Artificial y Ciberseguridad de la Universidad Anáhuac Cancún.

## Concepto

Los participantes forman una **Célula de Respuesta** dentro del Centro de Operaciones VÉRTICE y deben investigar un incidente, conectar evidencia y decidir cómo responder. Cada persona ocupa un puesto (Comunicaciones, Identidad, Infraestructura, Inteligencia) y, al reconstruir el incidente, el equipo se reúne frente a la pantalla central para autorizar una respuesta antes de que termine el tiempo.

No es una clase, un quiz ni una demostración guiada.

## Universo ficticio

- Empresa: **Vértice Sistemas Urbanos**
- Plataforma: **VÉRTICE**
- Escenario: Cancún, 2035
- Idioma visible: **español**
- Participantes: 4–10; óptimo 6–8
- Duración: 20–25 minutos

## Mecánica

Cuatro líneas de investigación convergen:

1. Comunicaciones
2. Identidad y accesos
3. Infraestructura
4. Inteligencia

Identificadores canónicos del piloto:

`COR-512 / ACC-417 / NOD-204 / AGR-27`

Estos identificadores autorizan la consola final. Después, el equipo debe elegir un plan de respuesta con consecuencias visibles.

## Ejecución portátil

El piloto se ejecuta en **una computadora**, sin internet ni infraestructura de red (`docs/12-modos-de-ejecucion.md`).

```bash
npm install
npm run dev
```

Abrir en el mismo navegador:

```text
http://localhost:5173/                        VÉRTICE (pantalla central, host)
http://localhost:5173/station/comunicaciones  Estación 01 — Comunicaciones
http://localhost:5173/station/identidad       Estación 02 — Identidad y Accesos
http://localhost:5173/station/infraestructura Estación 03 — Infraestructura
http://localhost:5173/station/inteligencia    Estación 04 — Inteligencia
http://localhost:5173/station/respuesta       Estación 05 — Respuesta
```

Se pueden mostrar en una sola pantalla (cambiando de pestaña) o repartir en varias. La pantalla central sirve en monitor, TV,
proyector o LED. Configuración mínima: 1 computadora, 1 navegador, 1 pantalla.

El interruptor de **modo claro / nocturno** (sol/luna, arriba a la derecha) está en VÉRTICE y en cada estación: se recuerda y
cambia todas las pestañas a la vez.


## Modo laboratorio (varias computadoras)

Para el taller real: una computadora con la LED (VÉRTICE) y una por estación, en la misma red local, sin internet. En la principal:

```bash
npm install
npm run lab
```

Imprime las direcciones de VÉRTICE y de cada estación para abrirlas en las otras computadoras. Guía breve: `docs/lab-setup.md`. El modo portátil sigue igual.

## Principios no negociables

1. Misión operativa, no tutorial.
2. Todo contenido visible para participantes está en español.
3. La solución no se resalta mediante interfaz.
4. No se requiere conocimiento técnico previo.
5. La IA ayuda, pero no es infalible.
6. Toda evidencia de ciberseguridad es ficticia y simulada.
7. Experiencia y narrativa tienen prioridad sobre arquitectura enterprise.
8. Pruebas automatizadas solo cuando protejan flujos críticos de una sesión presencial.
9. Los roles orientan el inicio, pero todos pueden moverse y colaborar.
10. La dificultad se calibra con pilotos reales, no por intuición.

## Lectura obligatoria para agentes

1. [`AI_CONTEXT.md`](AI_CONTEXT.md)
2. [`AGENTS.md`](AGENTS.md)
3. [`docs/02-story-bible.md`](docs/02-story-bible.md)
4. [`docs/03-game-design.md`](docs/03-game-design.md)
5. [`docs/04-interface-system.md`](docs/04-interface-system.md)
6. [`docs/10-session-flow.md`](docs/10-session-flow.md)
7. [`docs/11-role-cards.md`](docs/11-role-cards.md)

## Estado

**Piloto v1: canon base congelado para implementación.**

Implementado: VÉRTICE central, Mission Engine, modo portátil (BroadcastChannel) y las estaciones 01 — Comunicaciones, 02 — Identidad y Accesos, 03 — Infraestructura, 04 — Inteligencia y 05 — Respuesta (flujo completo de resolución) (ver `docs/08-roadmap.md`).
