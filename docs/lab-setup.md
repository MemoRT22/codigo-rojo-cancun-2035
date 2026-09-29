# Laboratorio — puesta en marcha (Modo B)

Una computadora principal con la pantalla LED (VÉRTICE) y cuatro computadoras de análisis, en la **misma red local**. No hace falta internet.

```text
               LED
             VÉRTICE  (host · corre `npm run lab`)
                │
         red local / switch / router / Wi‑Fi
      ┌─────────┼──────────┬──────────────┐
COMUNICACIONES IDENTIDAD INFRAESTRUCTURA INTELIGENCIA
```
`/station/respuesta` sigue disponible en cualquier computadora (pruebas y modo portátil).

## 1. Preparación (solo en la computadora principal)

```bash
npm install
npm run lab
```

`npm run lab` compila la aplicación y levanta el servidor (puerto 8080; otro puerto con `PORT=8090 npm run lab`). Si ya está compilada: `npm run lab:serve`.
Al arrancar imprime las direcciones, por ejemplo:

```text
Red (192.168.50.10):
  VÉRTICE:  http://192.168.50.10:8080/?mode=lab
  Estaciones:
    http://192.168.50.10:8080/station/comunicaciones?mode=lab
    http://192.168.50.10:8080/station/identidad?mode=lab
    http://192.168.50.10:8080/station/infraestructura?mode=lab
    http://192.168.50.10:8080/station/inteligencia?mode=lab
    http://192.168.50.10:8080/station/respuesta?mode=lab
```
Cada vez que una computadora se conecta o se desconecta, el servidor lo anota en su terminal (`+ conectado … total: N`).

## 2. Abrir VÉRTICE

En la computadora de la LED: la dirección **VÉRTICE** (`/?mode=lab`) en pantalla completa. Esa ventana es el host: **no la recargues durante la sesión**.

## 3. Abrir cada estación

En cada computadora de análisis, en un navegador, la dirección de su estación (arriba). Si se escribe sin `?mode=lab`, el servidor ya la conecta al laboratorio.
Nadie configura IPs ni instala nada.

## Requisitos

- Todas las computadoras en la misma red local y **con alcance entre sí** (misma subred; sin «aislamiento de clientes» en el Wi‑Fi).
- El firewall de la computadora principal permite el puerto (8080 por defecto).
- No se necesita internet. No se necesita un switch concreto: solo conectividad IP local (Ethernet preferible; Wi‑Fi posible).

## Prueba de red rápida

Desde **otra** computadora abre `http://IP_HOST:8080/`. Si carga VÉRTICE, la conectividad básica funciona. Si no carga: revisa que estén en la misma red, el firewall,
y que la red no aísle a los equipos entre sí (redes de invitados o públicas suelen hacerlo; un router propio del taller lo evita).

## Firewall

La primera vez, macOS/Windows puede pedir permiso para aceptar conexiones entrantes de Node. Permítelo en la **red privada** del laboratorio.

## Si algo se corta

- **Una estación pierde la red o se recarga:** vuelve sola a la misión en curso (reconexión automática); solo pierde su selección local.
- **Se cae el servidor o se reinicia `npm run lab`:** todas se reconectan solas y la misión continúa (VÉRTICE conserva el registro).
- **Se recarga VÉRTICE:** la sesión se reinicia (limitación conocida de esta versión): hay que iniciar de nuevo.

## Alcance y seguridad

Diseñado para una **red local confiable y presencial**. Sin autenticación ni TLS: no lo expongas a internet.

## Modo portátil (una sola computadora)

Sigue disponible sin cambios: `npm run dev` (o un build servido con `npm run preview`) y todas las pestañas en el mismo navegador; usa `BroadcastChannel`. `?mode=portable` lo fuerza aunque la página venga del servidor del laboratorio.
Ver `docs/12-modos-de-ejecucion.md`.
