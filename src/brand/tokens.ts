// ── VÉRTICE — tokens de diseño (modo claro) ──
//
// Regla: el color de DOMINIO identifica qué sistema es; el color de ESTADO (advertencia, crítico…)
// nunca reemplaza al de dominio, se superpone (anillo, halo, trazo). Ningún color indica la
// respuesta correcta de un acertijo.

export const INK = {
  primary: '#1A2B42',
  secondary: '#4A6180',
  tertiary: '#7B8FA6',
  faint: '#9CADC0',
} as const;

export const SURFACE = {
  page: '#F2F4F7',
  card: '#FFFFFF',
  cardHover: '#F9FAFB',
  hairline: '#E0E6EE',
  hairlineSoft: '#EBF0F5',
  shadow: 'rgba(26,43,66,0.08)',
  shadowLg: 'rgba(26,43,66,0.06)',
} as const;

export const BRAND = {
  navy: '#15334F',
  blue: '#2E6FE6',
} as const;

/** Mapa base (claro, Caribe). */
export const MAP = {
  sea: '#A8D4F0',
  seaDeep: '#8AC2E6',
  seaShallow: '#C8E6F8',
  seaBright: '#D8EEF9',
  land: '#F6F3EC',
  landEdge: '#BCCCDB',
  slab: '#C8D0DC',
  slabDark: '#A8B4C4',
  fabric: '#EDEAD8',
  fabricCommercial: '#E4DFCC',
  lagoon: '#9AD4D8',
  lagoonDeep: '#82C8CE',
  lagoonEdge: '#72B4BC',
  roadCasing: '#D4D0C6',
  graticule: '#B4C4D4',
  label: '#5A6E84',
  labelWater: '#4878A0',
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
  /** Tinte suave para fondos. */
  tint: string;
}

export const DOMAINS: DomainToken[] = [
  { id: 'identidad', label: 'Identidad y Accesos', short: 'Identidad', color: '#6E5CCC', ink: '#5A44B8', tint: '#F0EDFA' },
  { id: 'infraestructura', label: 'Infraestructura', short: 'Infraestructura', color: '#546B8C', ink: '#42587A', tint: '#EDF0F5' },
  { id: 'movilidad', label: 'Movilidad', short: 'Movilidad', color: '#2B7DE6', ink: '#1A66C8', tint: '#EBF2FC' },
  { id: 'turismo', label: 'Servicios Turísticos', short: 'Turismo', color: '#16A89C', ink: '#0E8C82', tint: '#E8F6F5' },
  { id: 'sensores', label: 'Sensores y Monitoreo', short: 'Sensores', color: '#5CA626', ink: '#488420', tint: '#F0F5E8' },
  { id: 'inteligencia', label: 'Núcleo de Inteligencia', short: 'Inteligencia', color: '#B84898', ink: '#9C3680', tint: '#F8EDF5' },
];

export const DOMAIN_MAP = new Map<DomainId, DomainToken>(DOMAINS.map((d) => [d.id, d]));
export const domainColor = (id: DomainId) => DOMAIN_MAP.get(id)!.color;

// ── Estado (se superpone al color de dominio) ──

export const STATUS = {
  ok: '#2AAE6E',
  warn: '#E8A020',
  crit: '#D94040',
  isolated: '#94A4B4',
  recover: '#18B4A4',
  info: '#2E6FE6',
} as const;
