# Prompt de interfaz — Infraestructura

Diseña una interfaz de observabilidad de servicios para VÉRTICE.

## Propósito

Permitir deducir qué servicio cambia después del acceso anómalo y antes de las alertas posteriores.

## Evidencia canónica

Nodo relevante:
- SIN-04
- anomalía: 09:17:22
- actividad: 14 → 163 solicitudes/s
- referencia: ACC-417
- identificador de evidencia: NOD-204

Distractor:
- BUS-SEN-02
- pico: 09:12:40
- causa legítima: sincronización programada

## UX

Debe entenderse sin conocimientos de redes.

Mostrar en español:
- Nodos
- Servicios
- Conexiones
- Actividad
- Solicitudes por segundo
- Hora
- Referencia de sesión
- Estado
- Detalle

No usar una estética de “herramienta hacker” ni requerir comandos de red.
