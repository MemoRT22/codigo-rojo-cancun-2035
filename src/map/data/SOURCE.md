# Geographic Data Sources

## Origin
All geographic polygons in `cancun-geo.json` were retrieved from **OpenStreetMap** via the Nominatim geocoding API on 2026-09-25.

## License
Data (c) OpenStreetMap contributors, licensed under the Open Data Commons Open Database License (ODbL 1.0).
http://osm.org/copyright

## Features
- **Cancun boundary**: Administrative boundary of Cancun (relation 17611454), simplified from 1,494 to ~55 points using Douglas-Peucker (epsilon 0.0008).
- **Laguna Nichupte**: Water body polygon (relation 13637435), simplified from 2,162 to ~152 points (epsilon 0.0005).
- **Zona Hotelera**: Two polygons (north section + main strip) from the Zona Hotelera administrative boundary, simplified from 2,499 to ~149 points (epsilon 0.0004).
- **Roads**: Simplified polylines for Boulevard Kukulcan, Avenida Tulum, Avenida Bonampak, Ruta Aeropuerto, and Puente Nichupte, traced from known geographic positions.

## Usage
These files are bundled locally and do not require internet access at runtime.
