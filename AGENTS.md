# AGENTS.md

Reglas obligatorias para cualquier agente de diseño o desarrollo que trabaje en este repositorio.

## Misión

Construir **Código Rojo: Cancún 2035** como una experiencia inmersiva, repetible y físicamente creíble que acerque a aspirantes al trabajo profesional relacionado con Inteligencia Artificial y Ciberseguridad.

## Lectura obligatoria

Antes de modificar código o mecánicas:

1. `AI_CONTEXT.md`
2. `docs/01-experience-vision.md`
3. `docs/02-story-bible.md`
4. `docs/03-game-design.md`
5. `docs/04-interface-system.md`
6. `docs/05-technical-strategy.md`
7. `docs/10-session-flow.md`

Si trabajas en una estación, lee también su prompt en `prompts/interfaces/`.

## Jerarquía de verdad

1. `docs/03-game-design.md` — mecánicas, pistas y solución.
2. `docs/02-story-bible.md` — verdad narrativa.
3. `docs/10-session-flow.md` — experiencia de inicio a fin.
4. `docs/04-interface-system.md` — interfaz y lenguaje visual.
5. `docs/05-technical-strategy.md` — implementación.
6. Prompts de interfaz — briefs subordinados a los documentos anteriores.

No reescribas silenciosamente la historia para facilitar la implementación.

## Reglas de producto

- Escape room, no tutorial.
- Ningún elemento puede decir “haz clic aquí”, “ve a la estación X” o equivalente.
- Toda pista debe ser deducible.
- Ningún reto debe exigir experiencia previa en ciberseguridad.
- Solo evidencia simulada y ficticia.
- La IA puede ayudar y también equivocarse.
- La LED comunica estado y presión; no es una lista de misiones.
- Las decisiones incorrectas pueden tener consecuencias, pero siempre deben ser explicables.
- El sistema debe funcionar con grupos pequeños.
- Los roles orientan; no encarcelan al jugador en una estación.

## Idioma visible — regla estricta

**Todo lo que vea un participante debe estar en español.**

Esto incluye:
- nombres de estaciones,
- botones,
- estados,
- alertas,
- registros,
- encabezados,
- campos,
- hipótesis de IA,
- resultados de autenticación,
- mensajes de error,
- desenlaces.

No usar mezclas como “LOGIN EXITOSO”, “AI CORE”, “NODE”, “EVENT ID”, “Command Center” o “System Status” en pantalla.

Los nombres de variables, componentes y archivos internos sí pueden usar inglés si ayuda al desarrollo.

## Ingeniería

Stack inicial preferido:
- Vite
- React
- TypeScript
- Tailwind CSS
- datos locales/estáticos
- estado compartido ligero cuando sea necesario

No agregar backend, base de datos, autenticación real, infraestructura cloud o frameworks complejos sin una necesidad concreta de experiencia.

## Política de pruebas

Las pruebas automatizadas **no son un entregable por defecto**.

Agregar pruebas solamente cuando un fallo pueda arruinar una sesión presencial y sea barato comprobarlo automáticamente, especialmente:
- validación de candados,
- transiciones de estado,
- sincronización con LED central,
- desenlace,
- restablecimiento de sesión.

No invertir en cobertura amplia, suites de integración, smoke tests, regresión visual o CI compleja durante el piloto salvo necesidad demostrada.

## UX

- Full screen primero.
- Diseñar para 1080p y LED grande.
- Tipografía legible.
- Densidad informativa alta pero ordenada.
- Oscuro, premium, operativo.
- Futurismo sobrio.
- Movimiento con propósito.
- No resaltar visualmente la pista correcta.

## Disciplina de cambios

Para cualquier cambio no trivial:
1. Explica el propósito narrativo.
2. Identifica la pista o mecánica afectada.
3. Implementa la versión mínima coherente.
4. Revísala contra las reglas anti-guiado.
5. Actualiza documentación si cambió una verdad del juego.
