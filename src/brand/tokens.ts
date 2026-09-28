// ── VÉRTICE — tokens de diseño (modo claro) ──
//
// Regla: el color de DOMINIO identifica qué sistema es; el color de ESTADO (advertencia, crítico…)
// nunca reemplaza al de dominio, se superpone (anillo, halo, trazo). Ningún color indica la
// respuesta correcta de un acertijo.

export const INK = {
  primary: '#0E1D33',
  secondary: '#3F5169',
  tertiary: '#6B7C92',
  faint: '#93A2B5',
} as const;

export const SURFACE = {
  page: '#EDF1F5',
  card: '#FFFFFF',
  hairline: '#D8E0E9',
  hairlineSoft: '#E6ECF2',
  shadow: 'rgba(14,29,51,0.10)',
} as const;

export const BRAND = {
  navy: '#0E2A4D',
  blue: '#1B5FE4',
} as const;

/** Mapa base (claro). */
export const MAP = {
  sea: '#D3E4F0',
  seaDeep: '#C2D9EA',
  seaShallow: '#E3EFF7',
  land: '#F3F1EB',
  landEdge: '#B4C0CC',
  slab: '#C9D1DA',
  slabDark: '#A9B5C2',
  fabric: '#E9E6DE',
  fabricCommercial: '#E0DCD0',
  lagoon: '#C9DFEB',
  lagoonEdge: '#9FBFD3',
  roadCasing: '#DAD6CB',
  graticule: '#B7C6D4',
  label: '#5E7086',
  labelWater: '#6F91AB',
} as const;

// ── Dominios ──

export type DomainId = 'identidad' | 'infraestructura' | 'movilidad' | 'turismo' | 'sensores' | 'inteligencia';

export interface DomainToken {
  id: DomainId;
  label: string;
  short: string;
  color: string;
  /** Versión legible sobre fondo blanco (texto pequeño). */
  ink: string;
}

export const DOMAINS: DomainToken[] = [
  { id: 'identidad', label: 'Identidad y Accesos', short: 'Identidad', color: '#7A4FE0', ink: '#6234CC' },
  { id: 'infraestructura', label: 'Infraestructura', short: 'Infraestructura', color: '#4B5F82', ink: '#3A4D6E' },
  { id: 'movilidad', label: 'Movilidad', short: 'Movilidad', color: '#1F7AE0', ink: '#1462BE' },
  { id: 'turismo', label: 'Servicios Turísticos', short: 'Turismo', color: '#0FA39A', ink: '#0A7F78' },
  { id: 'sensores', label: 'Sensores y Monitoreo', short: 'Sensores', color: '#69A82C', ink: '#4D8420' },
  { id: 'inteligencia', label: 'Núcleo de Inteligencia', short: 'Inteligencia', color: '#C2409B', ink: '#A12C7F' },
];

export const DOMAIN_MAP = new Map<DomainId, DomainToken>(DOMAINS.map((d) => [d.id, d]));
export const domainColor = (id: DomainId) => DOMAIN_MAP.get(id)!.color;

// ── Estado (se superpone al color de dominio) ──

export const STATUS = {
  ok: '#1FA971',
  warn: '#F0A100',
  crit: '#E23B3B',
  isolated: '#8F9DAE',
  recover: '#14B8A6',
  info: '#1B5FE4',
} as const;
