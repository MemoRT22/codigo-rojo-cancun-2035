# Consola de facilitación

**VÉRTICE · Consola de facilitación** es el panel del facilitador. No hay que recordar ninguna URL ni parámetro: las direcciones solo identifican la pantalla (`/` y `/station/...`); todo lo demás se controla desde aquí.

## Cómo abrirla

En la ventana de **VÉRTICE** (la de la LED) pulsa **`D`**:
- Se abre en una **ventana aparte** (nunca sobre lo que ven los alumnos). Arrástrala al monitor del facilitador.
- Si ya está abierta, `D` le da foco; si la cerraste, la vuelve a abrir. `D` funciona también durante la consola de respuesta.
- Si el navegador bloquea la ventana, VÉRTICE muestra un aviso pequeño («No se pudo abrir la consola. Permite ventanas emergentes para este sitio.»): permite las ventanas emergentes para el sitio y pulsa `D` otra vez.
- Vive en la misma instancia del host: sus acciones llegan a las estaciones por el mismo canal de la misión (BroadcastChannel o laboratorio). No hay login ni otro servidor. Si recargas VÉRTICE, la consola se cierra y la sesión se reinicia.

Atajos que quedan en VÉRTICE: **D** consola · **M** tema · **F** pantalla completa. (Ya no existen `1–7`, `R` ni espacio: una tecla accidental no puede cambiar la narrativa ni reiniciar la sesión.)

## Preparación

1. `npm run lab` (laboratorio) o `npm run dev` (portátil, una computadora). Abre VÉRTICE en la LED y las cuatro estaciones con las direcciones limpias que imprime el servidor.
2. En VÉRTICE pulsa `D` y coloca la consola en tu monitor. Comprueba que muestra «Esperando».
3. Cada estación debería mostrar su puesto (rol y «Esperando activación de VÉRTICE»).

## Secciones

- **Sesión** — estado (Esperando / En curso / Pausada / Finalizada), hora simulada y tiempo restante. **INICIAR EXPERIENCIA**, **PAUSAR**, **REANUDAR** y **RESTABLECER SESIÓN** (pide confirmación en la misma consola).
- **Estado de la investigación** — cuál de las cuatro evidencias está encontrada, correlación final, respuesta, plan seleccionado y desenlace. Es solo para ti, no para los alumnos.
- **Control de escenario** — solo para inspección visual de VÉRTICE: Operación normal · Anomalía detectada · Incidente en escalamiento · Correlación establecida (no cambia la misión). Las fases finales (respuesta autorizada, contención exitosa/incompleta) se alcanzan con eventos reales desde «Ensayo / contingencia».
- **Alertas VÉRTICE** — lanza un aviso visual en la LED: nivel (Información, Advertencia, Crítica, Recuperación), duración (4 s, 8 s, persistente) y un mensaje de la lista o uno personalizado (texto plano, máx. 120 caracteres). Aparece abajo al centro de VÉRTICE, se anota también en «Actividad reciente» y no cambia el estado de la misión. «Ocultar alerta» retira una persistente. Los mensajes predefinidos no revelan evidencia.
- **Cierre de misión** — controla el debrief de la LED (`docs/pilot/debrief.md`). **MOSTRAR CIERRE** solo se habilita con la misión finalizada; **← ANTERIOR / SIGUIENTE →** recorren los 3 pasos (Reconstruir, Entender, Conectar); **CERRAR CIERRE** muestra «Misión finalizada» ~2 s y vuelve al mapa final. Estado: No iniciado · Paso n / 3 · Finalizado. Nunca aparece solo.
- **Velocidad del reloj simulado** — ×1 (sesión real), ×4, ×8, ×16 (ensayo).
- **Cuenta regresiva** — tiempo y estado. Antes de la anomalía muestra «20:00 · Esperando activación» sin controles; con la misión en curso y la anomalía visible, PAUSAR / REANUDAR; con la misión en pausa (o sin iniciar/finalizada) los controles quedan deshabilitados: la pausa de la misión manda. Arranca sola con la anomalía.
- **Tema y presentación** — DAY / MIDNIGHT y pantalla completa (si el navegador no la permite desde esta ventana, usa `F` en VÉRTICE). El tema cambia en VÉRTICE y en **todas** las estaciones (también en el laboratorio) y una estación que se abre después entra con el tema actual.
- **Ensayo / contingencia** (plegada) — atajos que se saltan el flujo real: registrar evidencia de prueba, validar la correlación canónica, autorizar la respuesta y ejecutar un plan.

## Inicio

Da el briefing (`docs/pilot/briefing.md`) y pulsa **INICIAR EXPERIENCIA**. Las cuatro estaciones muestran «Sesión operativa activada» y, en unos 8 segundos, VÉRTICE anuncia la anomalía y arranca el tiempo de respuesta (20:00).

## Pausa

**PAUSAR** detiene misión, reloj y cuenta regresiva; las estaciones muestran «Sesión en pausa». **REANUDAR** continúa.

## Reset entre grupos

**RESTABLECER SESIÓN** → confirmar. Deja: misión en espera, VÉRTICE en operación normal («Célula de respuesta en espera»), cuenta regresiva en 20:00 detenida, alertas limpias y **velocidad en ×1** (un ensayo acelerado no contamina al siguiente grupo). Las estaciones vuelven a su puesto preparado y el siguiente inicio vuelve a mostrar la activación.

## Notas

- Sin estado de conexión de las estaciones (todavía no existe esa telemetría).
- Los asistentes de cada estación (orientación) no se controlan desde aquí; se prueban con interacción real.
- Nada de esto se muestra en las computadoras de los alumnos: las estaciones no tienen controles administrativos.
