# Contexto de IA — leer primero

Estás trabajando en **Código Rojo: Cancún 2035**, una experiencia inmersiva tipo escape room tecnológico para aspirantes de preparatoria que visitan el HUB de Inteligencia Artificial y Ciberseguridad de la Universidad Anáhuac Cancún.

Este repositorio está optimizado para **diseño de experiencia y prototipado rápido**, no para producción empresarial.

## Regla de idioma

Todo contenido visible para participantes debe estar en **español**: títulos, botones, estados, alertas, registros, mensajes, hipótesis, nombres de estaciones y textos de sistema.

Los nombres internos del código pueden estar en inglés si conviene al desarrollo, pero nunca deben filtrarse a la experiencia visible.

## Universo ficticio

La empresa ficticia es **Vértice Sistemas Urbanos**.

La plataforma operativa se llama **VÉRTICE**.

Evitar nombres que mezclen siglas geográficas como "CUN" con términos en inglés. Cancún es el escenario narrativo; VÉRTICE es la plataforma.

## Estrella guía

El participante debería salir diciendo:

> “Sentí que estaba dentro de un centro de operaciones resolviendo una crisis real.”

No:

> “Me dieron una presentación de IA y ciberseguridad.”

## Formato

- 20–25 minutos.
- 4–10 participantes; óptimo 6–8.
- Un solo equipo de respuesta.
- Una LED central funciona como estado vivo del incidente.
- Varias estaciones contienen evidencia parcial.
- El equipo debe correlacionar información entre estaciones.
- El avance principal se basa en identificadores/candados derivados de evidencia.
- El sistema no guía explícitamente el siguiente paso.
- La resolución termina en una decisión profesional con consecuencias.

## Incidente canónico

Una colaboradora recibe un correo falso de soporte, entrega sus credenciales en una página fraudulenta y su identidad se utiliza posteriormente desde un dispositivo desconocido. Esa sesión alcanza un servicio interno de sincronización y genera actividad anómala hacia otros sistemas. La capa de inteligencia detecta patrones, pero formula una hipótesis plausible que no representa correctamente la causa raíz. Los jugadores deben reconstruir la secuencia completa antes de autorizar una contención.

Todo el incidente, personas, dominios, equipos y datos son ficticios.

## Prioridades

1. Coherencia narrativa.
2. Calidad y justicia de los acertijos.
3. Inmersión y calidad visual.
4. Experiencia física de sala.
5. Fiabilidad del flujo presencial.
6. Elegancia del código.
7. Cobertura automatizada de pruebas.

Hardcodear contenido es aceptable en el piloto.

## Comportamiento obligatorio de agentes

Antes de implementar algo, identifica qué momento narrativo y qué dependencia de pista sirve. Si no sirve a ninguno, no lo agregues solamente porque se vea impresionante.

Nunca reveles soluciones mediante colores obvios, etiquetas, tutoriales, flechas, respuestas resaltadas ni textos como “selecciona al usuario sospechoso”.

Consulta `AGENTS.md` y los documentos canónicos en `docs/`.
