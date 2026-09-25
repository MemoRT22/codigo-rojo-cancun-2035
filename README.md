# Código Rojo: Cancún 2035

Escape room tecnológico inmersivo para el HUB de Inteligencia Artificial y Ciberseguridad de la Universidad Anáhuac Cancún.

## Propósito

El participante no viene a tomar una clase ni a contestar un quiz. Entra a una crisis tecnológica ficticia y debe **observar, investigar, correlacionar pistas, resolver candados y tomar una decisión profesional** antes de que termine el tiempo.

El taller está diseñado para grupos pequeños (ideal 6–8, máximo 10), es reciclable y puede utilizarse en Día OV, visitas de preparatorias, Open House y experiencias posteriores del HUB.

## Premisa

En 2035, Cancún opera servicios urbanos y turísticos mediante una plataforma inteligente conectada. Una anomalía empieza a afectar accesos, infraestructura y sistemas relacionados. El equipo debe descubrir qué ocurrió, reconstruir la secuencia del incidente y contenerlo.

La verdad del caso **no se presenta de forma explícita**. Se descubre mediante evidencias distribuidas entre estaciones.

## Principios no negociables

1. **Escape room, no tutorial.** La interfaz nunca debe decir “haz clic aquí”, “ve a la estación X” o revelar el siguiente paso.
2. **Descubrimiento, no examen.** Las respuestas surgen de observar, comparar y conectar evidencias.
3. **IA como herramienta, no oráculo.** La IA aporta patrones e hipótesis, pero puede ser incompleta o equivocarse.
4. **Ciberseguridad segura y simulada.** Todo ocurre en un entorno ficticio. Los retos deben ser de lógica, evidencia y análisis, no de explotación real.
5. **Experiencia primero.** Narrativa, ambientación, ritmo, visuales y claridad tienen prioridad sobre arquitectura enterprise.
6. **Sin sobreingeniería.** Datos simulados y contenido hardcodeado son aceptables para el piloto.
7. **Pruebas mínimas.** No invertir en suites de unit/integration/smoke tests salvo para flujos que puedan romper la experiencia presencial: candados, transición de estados, sincronización con la pantalla central o arranque básico.
8. **Funciona con 4–10 personas.** El diseño no puede depender de llenar el grupo.
9. **Los detalles venden la ilusión.** Timestamps, nombres, mensajes, estados, microanimaciones y consistencia visual deben sentirse reales.
10. **No sacrificar comprensibilidad por tecnicismo.** Un estudiante de preparatoria debe poder resolver los retos sin conocimiento previo.

## Lectura obligatoria para cualquier IA/agente

1. [`AI_CONTEXT.md`](AI_CONTEXT.md)
2. [`AGENTS.md`](AGENTS.md)
3. [`docs/01-experience-vision.md`](docs/01-experience-vision.md)
4. [`docs/02-story-bible.md`](docs/02-story-bible.md)
5. [`docs/03-game-design.md`](docs/03-game-design.md)
6. [`docs/04-interface-system.md`](docs/04-interface-system.md)
7. [`docs/05-technical-strategy.md`](docs/05-technical-strategy.md)
8. [`docs/06-pilot-plan.md`](docs/06-pilot-plan.md)

## Interfaces previstas

- Pantalla central LED / Command Center
- Accesos y credenciales
- Correo / ingeniería social
- Red e infraestructura
- IA / análisis de anomalías
- Consola de decisión final
- Desenlace

Los prompts de diseño y construcción están en [`prompts/interfaces`](prompts/interfaces).

## Estado

**Fase 0 — diseño de experiencia y documentación.**

Antes de construir la versión completa se debe cerrar el grafo de pistas y producir un piloto jugable de principio a fin.
