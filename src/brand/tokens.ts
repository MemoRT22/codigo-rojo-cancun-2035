// ── Corporate palette ──
export const CORP = {
  bgDeep:    '#050B12',
  bgSurface: '#0A1624',
  bgPanel:   '#0E1D30',
  border:    '#162840',
  textPrimary:   '#EAF2F8',
  textSecondary: '#8FA4BD',
  textTertiary:  '#4A6480',
  verticeBlue:   '#2878FF',
  caribeCyan:    '#00C2D8',
  white:         '#EAF2F8',
} as const;

// ── Domain identity colors ──
// Each domain has its own chromatic identity independent of operational state.
export interface DomainToken {
  id: string;
  label: string;
  color: string;       // Primary domain hue
  colorDim: string;    // Reduced intensity for backgrounds/subtle elements
  colorBright: string; // For emphasis/alerts within this domain
}

export const DOMAINS: DomainToken[] = [
  { id: 'identidad',       label: 'Identidad y Accesos',     color: '#9b7aff', colorDim: '#9b7aff40', colorBright: '#b899ff' },
  { id: 'infraestructura', label: 'Infraestructura',          color: '#e8923a', colorDim: '#e8923a40', colorBright: '#ffa94d' },
  { id: 'movilidad',       label: 'Movilidad',                color: '#4d9fff', colorDim: '#4d9fff40', colorBright: '#6cb4ff' },
  { id: 'turismo',         label: 'Servicios Turísticos',     color: '#22c5c5', colorDim: '#22c5c540', colorBright: '#3de0e0' },
  { id: 'sensores',        label: 'Sensores y Monitoreo',     color: '#7acc29', colorDim: '#7acc2940', colorBright: '#96e847' },
  { id: 'inteligencia',    label: 'Núcleo de Inteligencia',   color: '#b065f0', colorDim: '#b065f040', colorBright: '#c98aff' },
];

export const DOMAIN_MAP = new Map(DOMAINS.map((d) => [d.id, d]));

export function domainColor(id: string): string {
  return DOMAIN_MAP.get(id)?.color ?? CORP.textTertiary;
}

// ── State severity overlay colors ──
// These layer ON TOP of domain colors to indicate operational state.
export const SEVERITY = {
  normal:  'transparent',
  warning: '#F0A848',
  critical:'#E74C3C',
  offline: '#4A6480',
} as const;

// ── Typography scale (in Tailwind-style references) ──
// Level 1 (visible from 5m+): brand 32px, headline 26px, countdown 60px
// Level 2 (visible from 3m): domains 15px, status 14px, zones 12px
// Level 3 (close reading): timestamps 11px, micro-labels 10px
