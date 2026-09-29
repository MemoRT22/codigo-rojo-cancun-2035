# 11 — Tarjetas de rol

Los roles generan identidad y reparten el arranque, pero **no limitan movimiento**. Son seis roles base:

1. Coordinador/a de Incidente
2. Analista de Comunicaciones
3. Analista de Identidad
4. Analista de Infraestructura
5. Analista de Inteligencia
6. Estratega de Respuesta

Los cuatro puestos de análisis coinciden con las cuatro computadoras del laboratorio (cada una muestra su rol antes de iniciar, con el mismo texto que su tarjeta). El Coordinador y el Estratega **no tienen computadora fija**.

## Configuración base — 6 participantes

```text
1 Coordinador/a de Incidente      (sin computadora fija)
1 Analista de Comunicaciones      (PC Comunicaciones)
1 Analista de Identidad           (PC Identidad)
1 Analista de Infraestructura     (PC Infraestructura)
1 Analista de Inteligencia        (PC Inteligencia)
1 Estratega de Respuesta          (sin computadora fija)
```

---

### 1. Coordinador/a de Incidente

**Tu responsabilidad:** mantener la visión global y hacer que la información circule.

**Preguntas sugeridas:**
- ¿Qué encontraron?
- ¿A qué hora ocurrió?
- ¿Qué identificador tiene?
- ¿A quién más le aparece?
- ¿Qué ocurrió primero?

**Regla:** no necesitas resolver cada estación personalmente. Haz que la información circule.

---

### 2. Analista de Comunicaciones

**Tu responsabilidad:** revisar las comunicaciones relacionadas con el incidente.

**Observa:** remitentes, direcciones, horarios, contexto e identificadores.

**Pregunta de inicio:** ¿qué comunicación podría estar relacionada con el origen?

**Regla:** un mensaje urgente no necesariamente es malicioso.

---

### 3. Analista de Identidad

**Tu responsabilidad:** analizar quién accede, desde dónde y en qué momento.

**Observa:** usuarios, dispositivos, zonas, horarios y sesiones.

**Pregunta de inicio:** ¿qué acceso no encaja con el comportamiento habitual?

**Regla:** un acceso fallido no necesariamente forma parte de un ataque.

---

### 4. Analista de Infraestructura

**Tu responsabilidad:** observar cómo cambia el comportamiento de los servicios de VÉRTICE.

**Observa:** actividad, horarios, servicios y referencias de sesión.

**Pregunta de inicio:** ¿qué cambió después de que comenzó el incidente?

**Regla:** el servicio con más actividad no necesariamente es el origen.

---

### 5. Analista de Inteligencia

**Tu responsabilidad:** evaluar los patrones e hipótesis generados por VÉRTICE.

**Observa:** confianza, cronología, relaciones, evidencia e hipótesis.

**Pregunta de inicio:** ¿la hipótesis realmente puede explicar lo que ocurrió primero?

**Regla:** una confianza alta no significa certeza.

---

### 6. Estratega de Respuesta

**Tu responsabilidad:** escuchar los hallazgos, pensar en la cadena completa y preparar al equipo para la decisión final.

**Durante la investigación** puedes circular entre puestos. **Piensa en:** qué servicios siguen sanos, cuáles están afectados y qué se perdería al apagar o aislar sistemas.

**Cuando VÉRTICE diga «Célula de respuesta requerida»,** junto con el Coordinador guías la discusión frente a la LED.

**Regla:** detener todo puede ser seguro técnicamente y malo operativamente.

---

## Otros tamaños de grupo

**4 participantes:** Coordinación + Estrategia (una persona) · Comunicaciones · Identidad · Infraestructura + Inteligencia.

**5 participantes:** Coordinación + Estrategia (una persona) · Comunicaciones · Identidad · Infraestructura · Inteligencia.

**7 participantes:** los seis roles base y **un adjunto** en Infraestructura (preferencia) o en Identidad, según el espacio.

**8 participantes:**

```text
Identidad: 2
Infraestructura: 2
Comunicaciones: 1
Inteligencia: 1
Coordinador/a: 1
Estratega: 1
```

Los adjuntos pueden moverse libremente y sirven para evitar espectadores pasivos. No hay lógica de software para el número de alumnos.

## Texto común al reverso de todas las tarjetas

> Puedes moverte y colaborar con cualquier estación.  
> No necesitas conocimientos técnicos previos.  
> No toda anomalía pertenece al incidente.  
> Compara datos antes de concluir.  
> Conserva los identificadores que consideres evidencia.  
> La decisión final pertenece al equipo.
