// ── VÉRTICE v4 — Light-mode enterprise design tokens ──

// ── Corporate palette ──
export const CORP = {
  // Backgrounds — light mode
  bgBase:       '#F5F8FB',
  bgSurface:    '#FFFFFF',
  bgElevated:   '#FFFFFF',
  bgPanel:      '#F0F4F8',

  // Map surfaces
  mapLand:      '#E8EEF5',
  mapSea:       '#D0DFF0',
  mapLagoon:    '#C2D8E8',
  mapHotelZone: '#DDE6F0',
  mapGrid:      '#CBD5E1',

  // Text hierarchy
  textPrimary:   '#132238',
  textSecondary: '#557086',
  textTertiary:  '#8DA0AF',

  // Borders & structure
  border:        '#D2DCE6',
  borderSubtle:  '#E4EBF2',
  shadow:        'rgba(19, 34, 56, 0.08)',
  shadowStrong:  'rgba(19, 34, 56, 0.14)',

  // Corporate accent
  verticeBlue:   '#1268E8',
  caribeCyan:    '#00AFC4',
  white:         '#FFFFFF',
} as const;

// ── Domain identity colors ──
// Tuned for legibility on light backgrounds.
export interface DomainToken {
  id: string;
  label: string;
  color: string;
  colorDim: string;
  colorBright: string;
}

export const DOMAINS: DomainToken[] = [
  { id: 'identidad',       label: 'Identidad y Accesos',     color: '#7657D5', colorDim: '#7657D520', colorBright: '#5B3DBF' },
  { id: 'infraestructura', label: 'Infraestructura',          color: '#E98836', colorDim: '#E9883620', colorBright: '#D07020' },
  { id: 'movilidad',       label: 'Movilidad',                color: '#2878E8', colorDim: '#2878E820', colorBright: '#1460D0' },
  { id: 'turismo',         label: 'Servicios Turísticos',     color: '#00A89D', colorDim: '#00A89D20', colorBright: '#008C83' },
  { id: 'sensores',        label: 'Sensores y Monitoreo',     color: '#70A943', colorDim: '#70A94320', colorBright: '#5A8F30' },
  { id: 'inteligencia',    label: 'Núcleo de Inteligencia',   color: '#B24BC8', colorDim: '#B24BC820', colorBright: '#9830AE' },
];

export const DOMAIN_MAP = new Map(DOMAINS.map((d) => [d.id, d]));

export function domainColor(id: string): string {
  return DOMAIN_MAP.get(id)?.color ?? CORP.textTertiary;
}

// ── State severity overlay colors ──
// These layer ON TOP of domain colors — never replacing them.
export const SEVERITY = {
  normal:   'transparent',
  warning:  '#E8A020',
  critical: '#DC3545',
  offline:  '#8DA0AF',
} as const;
