# Fuentes geográficas

`cancun-osm.json` se genera con `npm run geo` (`scripts/build-cancun-geo.mjs`) a partir de **OpenStreetMap** vía Overpass API.

## Licencia
Datos © colaboradores de OpenStreetMap, licencia ODbL 1.0 — https://osm.org/copyright

## Contenido
- **Tierra:** línea de costa (`natural=coastline`) ensamblada en polígonos; el continente se cierra por el oeste fuera del encuadre. Isla Mujeres como isla.
- **Agua:** Laguna Nichupté (multipolígono con sus islas), Laguna Bojórquez, Río Inglés, Puerto Cancún, Caletilla, La Ciega.
- **Vialidad:** `highway=trunk|primary|secondary`, unificadas por nombre y simplificadas (Douglas–Peucker, 4–6 m).
- **Aeropuerto:** pistas, plataformas y terminales de `aeroway=*`.
- **Trama urbana:** `landuse=residential|commercial|retail|industrial` (polígonos > 1.2 ha, simplificados a 12 m).
- **Lugares:** `place=*` (informativo).

El archivo se versiona: la LED no necesita red. Las consultas se guardan en caché en `scripts/.geo-cache/` (ignorada por git).
