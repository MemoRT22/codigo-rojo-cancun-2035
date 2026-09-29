import { memo } from 'react';
import { useTheme } from '../brand/ThemeContext';
import { linePath, ringPath, type LonLat } from './projection';
import {
  LAND, WATER, LAGOON_NICHUPTE, FABRIC, AIRPORT, roadsByClass,
} from './geo';
import { STAGE, W, H } from './scene';

const SLAB_STEPS = [-40, -90, -140, -190, -240, -290];
const LAGOON_DEPTH = 95;

const pathOf = (pts: LonLat[], z = 0) => ringPath(STAGE, pts, z);

const landAt = (z: number) => LAND.map((l) => pathOf(l.pts, z)).join('');

const lagoonRings = (z: number) => LAGOON_NICHUPTE.rings.map((r) => pathOf(r.pts, z)).join('');

const MINOR_WATERS = WATER.filter((w) => w.name !== 'Laguna Nichupté');

const GRID_LON = [-86.95, -86.9, -86.85, -86.8, -86.75, -86.7];
const GRID_LAT = [21.0, 21.05, 21.1, 21.15, 21.2];

export const Basemap = memo(function Basemap() {
  const { theme: T } = useTheme();
  const MAP = T.MAP;
  const dark = T.mode === 'midnight';
  const secondary = roadsByClass('secondary');
  const primary = roadsByClass('primary');
  const trunk = roadsByClass('trunk');

  const shadowColor = dark ? '#000810' : '#1A3454';
  const shadowOpacity = dark ? 0.3 : 0.1;
  const shallowBands = dark ? [
    { w: 72, o: 0.35, c: MAP.seaShallow },
    { w: 42, o: 0.45, c: MAP.seaShallow },
    { w: 18, o: 0.55, c: MAP.seaBright },
  ] : [
    { w: 72, o: 0.5, c: MAP.seaShallow },
    { w: 42, o: 0.65, c: MAP.seaShallow },
    { w: 18, o: 0.8, c: MAP.seaBright },
  ];

  return (
    <svg className="absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <linearGradient id="sea-fill" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor={MAP.seaBright} />
          <stop offset="0.3" stopColor={MAP.sea} />
          <stop offset="0.7" stopColor={MAP.seaDeep} />
          <stop offset="1" stopColor={dark ? '#04101E' : '#74B8DE'} />
        </linearGradient>
        <linearGradient id="lagoon-fill" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={MAP.lagoon} />
          <stop offset="1" stopColor={MAP.lagoonDeep} />
        </linearGradient>
        <linearGradient id="slab-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={MAP.slab} />
          <stop offset="1" stopColor={MAP.slabDark} />
        </linearGradient>
        <clipPath id="lagoon-clip">
          <path d={lagoonRings(0)} clipRule="evenodd" />
        </clipPath>
        <filter id="land-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width={W} height={H} fill="url(#sea-fill)" />

      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        {shallowBands.map((b, i) => (
          <path key={i} d={landAt(0)} stroke={b.c} strokeWidth={b.w} strokeOpacity={b.o} />
        ))}
      </g>

      <path d={landAt(-300)} fill={shadowColor} opacity={shadowOpacity} filter="url(#land-shadow)" transform="translate(6 14)" />

      {SLAB_STEPS.map((z, i) => (
        <path key={z} d={landAt(z)} fill={i < 2 ? MAP.slab : MAP.slabDark} />
      ))}

      <path d={landAt(0)} fill={MAP.land} stroke={MAP.landEdge} strokeWidth="1" strokeLinejoin="round" />

      <g>
        {FABRIC.map((f, i) => (
          <path key={i} d={pathOf(f.pts)} fill={f.use === 'r' ? MAP.fabric : MAP.fabricCommercial} />
        ))}
      </g>

      {MINOR_WATERS.map((w) =>
        w.rings.filter((r) => r.role === 'outer').map((r, i) => (
          <path key={`${w.name}-${i}`} d={pathOf(r.pts)} fill={MAP.lagoon} stroke={MAP.lagoonEdge} strokeWidth="0.7" />
        )),
      )}

      <g>
        <path d={lagoonRings(0)} fillRule="evenodd" fill="url(#slab-wall)" />
        <g clipPath="url(#lagoon-clip)">
          <path d={lagoonRings(-LAGOON_DEPTH)} fillRule="evenodd" fill="url(#lagoon-fill)" />
        </g>
        <path d={lagoonRings(0)} fillRule="evenodd" fill="none" stroke={MAP.lagoonEdge} strokeWidth="0.8" />
      </g>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke={MAP.roadCasing} strokeWidth="2.2">
          {secondary.map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke={T.ui.roadFill} strokeWidth="1.1">
          {secondary.map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke={MAP.roadCasing} strokeWidth="4.6">
          {[...primary, ...trunk].map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
        <g stroke={T.ui.roadFill} strokeWidth="3.2">
          {[...primary, ...trunk].map((l, i) => <path key={i} d={linePath(STAGE, l)} />)}
        </g>
      </g>

      <g>
        {AIRPORT.aprons.map((r, i) => <path key={`a${i}`} d={pathOf(r)} fill={dark ? '#1A3040' : '#E8E4DA'} />)}
        {AIRPORT.terminals.map((r, i) => <path key={`t${i}`} d={pathOf(r)} fill={dark ? '#203848' : '#CCD4DE'} />)}
        {AIRPORT.runways.map((l, i) => (
          <path key={`r${i}`} d={linePath(STAGE, l)} stroke={dark ? '#2A4458' : '#C0C8D2'} strokeWidth="5" strokeLinecap="butt" fill="none" />
        ))}
      </g>

      <g stroke={MAP.graticule} strokeWidth="0.6" strokeOpacity={dark ? 0.25 : 0.4} fill="none" strokeDasharray="2 6">
        {GRID_LON.map((lo) => <path key={`lo${lo}`} d={linePath(STAGE, [[lo, 20.96], [lo, 21.27]])} />)}
        {GRID_LAT.map((la) => <path key={`la${la}`} d={linePath(STAGE, [[-86.96, la], [-86.68, la]])} />)}
      </g>

      <g fontFamily="'Inter Variable', Inter, system-ui, sans-serif" fontWeight="500" fill={MAP.labelWater} letterSpacing="0.36em" textAnchor="middle">
        <text {...at(-86.712, 21.055)} fontSize="18" opacity={dark ? 0.5 : 0.7}>MAR CARIBE</text>
        <text {...at(-86.7655, 21.198)} fontSize="14" letterSpacing="0.3em" opacity={dark ? 0.4 : 0.6}>BAHÍA DE MUJERES</text>
      </g>
    </svg>
  );
});

function at(lon: number, lat: number) {
  const [x, y] = STAGE.project(lon, lat);
  return { x: x.toFixed(1), y: y.toFixed(1) };
}
