# Master Project Prompt

Use this prompt when onboarding a new AI coding/design agent that cannot automatically read the repository context.

---

Quiero que diseñes y programes una experiencia inmersiva tipo escape room tecnológico llamada **“Código Rojo: Cancún 2035”**. No es un producto enterprise ni una plataforma de producción; es una experiencia interactiva presencial para talleres y demostraciones dentro de un laboratorio universitario de Inteligencia Artificial y Ciberseguridad.

## Objetivo

Crear interfaces visualmente impactantes, realistas y coherentes entre sí, para que los participantes sientan que están dentro de un centro de operaciones que responde a una crisis tecnológica en una ciudad inteligente.

## Contexto de experiencia

- Los participantes son aspirantes de preparatoria o visitantes.
- Deben resolver un incidente mediante observación, lógica, análisis y trabajo en equipo.
- La dinámica es tipo escape room: no se les debe indicar explícitamente “haz clic aquí”.
- Deben descubrir pistas, resolver acertijos y obtener códigos o claves.
- El avance será por candados/códigos.
- Las pantallas deben apoyar la inmersión, no dar instrucciones escolares.
- La interfaz debe sentirse profesional, futurista y creíble.
- Debe existir storytelling ambiental, tensión y urgencia.

## Historia base

Cancún 2035 cuenta con una plataforma inteligente que coordina diversos sistemas urbanos y turísticos. Se detecta una anomalía que afecta accesos, infraestructura y servicios conectados. Más adelante se descubre que el origen fue una credencial comprometida a través de un correo falso, lo que permitió actividad indebida dentro del sistema. La IA detecta patrones anómalos, pero el equipo humano debe conectar las evidencias y tomar la decisión final.

## Lineamientos visuales

- Modo oscuro.
- Apariencia premium y cinematográfica.
- Inspiración en SOC / NOC / Smart City command centers.
- Nada caricaturesco.
- Nada infantil.
- Nada que parezca una landing page comercial.
- Tipografía clara, moderna y tecnológica.
- Uso de paneles, mapas, gráficas, logs, indicadores de estado, tarjetas, overlays y visualizaciones elegantes.
- Sensación de alta tecnología realista.
- Microanimaciones sutiles con propósito.
- Debe ser atractivo en pantallas grandes.

## UX

- Full screen.
- Cada interfaz debe ser entendible visualmente.
- No debe sobreexplicar.
- Debe esconder la solución.
- Puede incluir pistas visuales sutiles.
- Los elementos interactivos deben sentirse naturales dentro del sistema.
- El objetivo no es capacitar técnicamente, sino generar una experiencia inmersiva de descubrimiento.

## Desarrollo

- Construir prototipo funcional y visualmente sólido.
- No invertir tiempo en suites de unit tests, integration tests, smoke tests o arquitectura compleja salvo que protejan un flujo indispensable para la sesión presencial.
- Priorizar experiencia, estética, fluidez y claridad.
- Se vale usar datos simulados.
- Se vale hardcodear contenido y pistas si acelera el prototipo.
- Lo más importante es que funcione de forma convincente en demo local.

Antes de implementar, lee `AI_CONTEXT.md`, `AGENTS.md` y los documentos en `docs/`.
