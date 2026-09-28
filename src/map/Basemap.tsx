import { memo } from 'react';
import { MAP } from '../brand/tokens';
import { linePath, ringPath, type LonLat } from './projection';
import {
  LAND, WATER, LAGOON_NICHUPTE, FABRIC, AIRPORT, roadsByClass,
} from './geo';
import { STAGE, W, H } from './scene';

// Profundidades (metros) — la altura se proyecta con la misma cámara que el resto de la escena.
const SLAB_STEPS = [-40, -90, -140, -190, -240, -290];
const LAGOON_DEPTH = 95;

const pathOf = (pts: LonLat[], z = 0) => ringPath(STAGE, pts, z);

const landAt = (z: number) => LAND.map((l) => pathOf(l.pts, z)).join('');

const lagoonRings = (z: number) => LAGOON_NICHUPTE.rings.map((r) => pathOf(r.pts, z)).join('');

const MINOR_WATERS = WATER.filter((w) => w.name !== 'Laguna Nichupté');

// Retícula de coordenadas (cada 0.05°) proyectada sobre el terreno.
const GRID_LON = [-86.95, -86.9, -86.85, -86.8, -86.75, -86.7];
const GRID_LAT = [21.0, 21.05, 21.1, 21.15, 21.2];

export const Basemap = memo(function Basemap() {
  const secondary = roadsByClass('secondary');
  const primary = roadsByClass('primary');
  const trunk = roadsByClass('trunk');

  return (
    <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id="sea-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E1EDF5" />
          <stop offset="0.45" stopColor={MAP.sea} />
          <stop offset="1" stopColor={MAP.seaDeep} />
        </linearGradient>
        <linearGradient id="slab-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAP.slab} />
          <stop offset="1" stopColor={MAP.slabDark} />
        </linearGradient>
        <clipPath id="lagoon-clip">
          <path d={lagoonRings(0)} clipRule="evenodd" />
        </clipPath>
        <filter id="land-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* Mar */}
      <rect width={W} height={H} fill="url(#sea-fill)" />

      {/* Aguas someras: bandas concéntricas a la costa */}
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d={landAt(0)} stroke={MAP.seaShallow} strokeWidth="64" strokeOpacity="0.55" />
        <path d={landAt(0)} stroke={MAP.seaShallow} strokeWidth="38" strokeOpacity="0.8" />
        <path d={landAt(0)} stroke="#EEF6FB" strokeWidth="16" strokeOpacity="0.9" />
      </g>

      {/* Sombra proyectada de la tierra sobre el mar */}
      <path d={landAt(-300)} fill="#16324F" opacity="0.16" filter="url(#land-shadow)" transform="translate(8 16)" />

      {/* Losa: espesor del terreno */}
      {SLAB_STEPS.map((z, i) => (
        <path key={z} d={landAt(z)} fill={i < 2 ? MAP.slab : MAP.slabDark} />
      ))}

      {/* Superficie de la tierra */}
      <path d={landAt(0)} fill={MAP.land} stroke={MAP.landEdge} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Trama urbana real (uso de suelo) */}
      <g>
        {FABRIC.map((f, i) => (
          <path key={i} d={pathOf(f.pts)} fill={f.use === 'r' ? MAP.fabric : MAP.fabricCommercial} />
        ))}
      </g>

      {/* Dársenas y lagunas menores */}
      {MINOR_WATERS.map((w) =>
        w.rings.filter((r) => r.role === 'outer').map((r, i) => (
          <path key={`${w.name}-${i}`} d={pathOf(r.pts)} fill={MAP.lagoon} stroke={MAP.lagoonEdge} strokeWidth="0.8" />
        )),
      )}

      {/* Laguna Nichupté: el agua queda por debajo de la superficie; el muro norte se ve */}
      <g>
        <path d={lagoonRings(0)} fillRule="evenodd" fill="url(#slab-wall)" />
        <g clipPath="url(#lagoon-clip)">
          <path d={lagoonRings(-LAGOON_DEPTH)} fillRule="evenodd" fill={MAP.lagoon} />
        </g>
        <path d={lagoonRings(0)} fillRule="evenodd" fill="none" stroke={MAP.lagoonEdge} strokeWidth="1" />
      </g>

      {/* Vialidad real */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke={MAP.roadCasing} strokeWidth="2.2">
          {secondary.map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke="#FFFFFF" strokeWidth="1.1">
          {secondary.map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke={MAP.roadCasing} strokeWidth="4.6">
          {[...primary, ...trunk].map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke="#FFFFFF" strokeWidth="3.2">
          {[...primary, ...trunk].map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
      </g>

      {/* Aeropuerto */}
      <g>
        {AIRPORT.aprons.map((r, i) => <path key={`a${i}`} d={pathOf(r)} fill="#E6E2D8" />)}
        {AIRPORT.terminals.map((r, i) => <path key={`t${i}`} d={pathOf(r)} fill="#CBD2DA" />)}
        {AIRPORT.runways.map((l, i) => (
          <path key={`r${i}`} d={linePath(STAGE, l)} stroke="#BFC7D0" strokeWidth="5" strokeLinecap="butt" fill="none" />
        ))}
      </g>

      {/* Retícula de coordenadas */}
      <g stroke={MAP.graticule} strokeWidth="0.8" strokeOpacity="0.55" fill="none" strokeDasharray="2 5">
        {GRID_LON.map((lo) => <path key={`lo${lo}`} d={linePath(STAGE, [[lo, 20.96], [lo, 21.27]])} />)}
        {GRID_LAT.map((la) => <path key={`la${la}`} d={linePath(STAGE, [[-86.96, la], [-86.68, la]])} />)}
      </g>

      {/* Nombres geográficos */}
      <g fontFamily="'Inter Variable', Inter, system-ui, sans-serif" fontWeight="600" fill={MAP.labelWater} letterSpacing="0.32em" textAnchor="middle">
        <text {...at(-86.712, 21.055)} fontSize="19">MAR CARIBE</text>
        <text {...at(-86.7655, 21.198)} fontSize="15" letterSpacing="0.28em">BAHÍA DE MUJERES</text>
      </g>
    </svg>
  );
});

function at(lon: number, lat: number) {
  const [x, y] = STAGE.project(lon, lat);
  return { x: x.toFixed(1), y: y.toFixed(1) };
}
