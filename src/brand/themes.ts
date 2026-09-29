import type { NodeStatus } from '../types';

// ── Types ──

export type ThemeMode = 'day' | 'midnight';
export type DomainId = 'identidad' | 'infraestructura' | 'movilidad' | 'turismo' | 'sensores' | 'inteligencia';

export interface DomainToken {
  id: DomainId;
  label: string;
  short: string;
  color: string;
  ink: string;
  tint: string;
}

export interface Theme {
  mode: ThemeMode;
  INK: { primary: string; secondary: string; tertiary: string; faint: string };
  SURFACE: { page: string; card: string; hairline: string; hairlineSoft: string; shadow: string; shadowLg: string };
  BRAND: { navy: string; blue: string };
  MAP: {
    sea: string; seaDeep: string; seaShallow: string; seaBright: string;
    land: string; landEdge: string; slab: string; slabDark: string;
    fabric: string; fabricCommercial: string;
    lagoon: string; lagoonDeep: string; lagoonEdge: string;
    roadCasing: string; graticule: string; label: string; labelWater: string;
  };
  DOMAINS: DomainToken[];
  DOMAIN_MAP: Map<DomainId, DomainToken>;
  STATUS: { ok: string; warn: string; crit: string; isolated: string; recover: string; info: string };
  STATUS_TEXT: Record<NodeStatus, string>;
  STATUS_FILL: Record<NodeStatus, string | null>;
  ui: {
    cardBg: string;
    dockBg: string;
    headerGrad: string;
    fogBanner: string;
    fogFeed: string;
    roadFill: string;
    nodeWhite: string;
    nodeShadow: string;
    particleHalo: string;
    sevBadgeBg: string;
    sevBadgeBorder: string;
  };
}

// ── Helpers ──

function makeDomainMap(domains: DomainToken[]) {
  return new Map<DomainId, DomainToken>(domains.map((d) => [d.id, d]));
}

// ── DAY ──

const DAY_DOMAINS: DomainToken[] = [
  { id: 'identidad', label: 'Identidad y Accesos', short: 'Identidad', color: '#6E5CCC', ink: '#5A44B8', tint: '#F0EDFA' },
  { id: 'infraestructura', label: 'Infraestructura', short: 'Infraestructura', color: '#546B8C', ink: '#42587A', tint: '#EDF0F5' },
  { id: 'movilidad', label: 'Movilidad', short: 'Movilidad', color: '#2B7DE6', ink: '#1A66C8', tint: '#EBF2FC' },
  { id: 'turismo', label: 'Servicios Turísticos', short: 'Turismo', color: '#16A89C', ink: '#0E8C82', tint: '#E8F6F5' },
  { id: 'sensores', label: 'Sensores y Monitoreo', short: 'Sensores', color: '#5CA626', ink: '#488420', tint: '#F0F5E8' },
  { id: 'inteligencia', label: 'Núcleo de Inteligencia', short: 'Inteligencia', color: '#B84898', ink: '#9C3680', tint: '#F8EDF5' },
];

const DAY_STATUS = { ok: '#2AAE6E', warn: '#E8A020', crit: '#D94040', isolated: '#94A4B4', recover: '#18B4A4', info: '#2E6FE6' };
const DAY_INK = { primary: '#1A2B42', secondary: '#4A6180', tertiary: '#7B8FA6', faint: '#9CADC0' };

export const DAY: Theme = {
  mode: 'day',
  INK: DAY_INK,
  SURFACE: { page: '#F2F4F7', card: '#FFFFFF', hairline: '#E0E6EE', hairlineSoft: '#EBF0F5', shadow: 'rgba(26,43,66,0.08)', shadowLg: 'rgba(26,43,66,0.06)' },
  BRAND: { navy: '#15334F', blue: '#2E6FE6' },
  MAP: {
    sea: '#A8D4F0', seaDeep: '#8AC2E6', seaShallow: '#C8E6F8', seaBright: '#D8EEF9',
    land: '#F6F3EC', landEdge: '#BCCCDB', slab: '#C8D0DC', slabDark: '#A8B4C4',
    fabric: '#EDEAD8', fabricCommercial: '#E4DFCC',
    lagoon: '#9AD4D8', lagoonDeep: '#82C8CE', lagoonEdge: '#72B4BC',
    roadCasing: '#D4D0C6', graticule: '#B4C4D4', label: '#5A6E84', labelWater: '#4878A0',
  },
  DOMAINS: DAY_DOMAINS,
  DOMAIN_MAP: makeDomainMap(DAY_DOMAINS),
  STATUS: DAY_STATUS,
  STATUS_TEXT: {
    ok: DAY_INK.secondary, watch: '#4B6088', warn: '#B48A00', crit: '#C43030',
    off: '#6A7888', isolated: '#6A7888', recovering: '#0E9488',
  },
  STATUS_FILL: {
    ok: null, watch: '#8AA0BE', warn: DAY_STATUS.warn, crit: DAY_STATUS.crit,
    off: DAY_STATUS.isolated, isolated: DAY_STATUS.isolated, recovering: DAY_STATUS.recover,
  },
  ui: {
    cardBg: 'rgba(255,255,255,0.94)',
    dockBg: 'rgba(255,255,255,0.93)',
    headerGrad: 'linear-gradient(180deg, rgba(244,246,249,0.97) 0%, rgba(244,246,249,0.9) 55%, rgba(244,246,249,0) 100%)',
    fogBanner: 'radial-gradient(ellipse at 20% 40%, rgba(244,246,249,0.94) 0%, rgba(244,246,249,0.78) 42%, rgba(244,246,249,0) 72%)',
    fogFeed: 'radial-gradient(ellipse at 30% 45%, rgba(244,243,238,0.94) 0%, rgba(244,243,238,0.82) 48%, rgba(244,243,238,0) 76%)',
    roadFill: '#FAFAFA',
    nodeWhite: '#FFFFFF',
    nodeShadow: 'rgba(26,43,66,0.08)',
    particleHalo: 'rgba(255,255,255,0.75)',
    sevBadgeBg: '#FFFFFF',
    sevBadgeBorder: '#E0E6EE',
  },
};

// ── MIDNIGHT ──

const MID_DOMAINS: DomainToken[] = [
  { id: 'identidad', label: 'Identidad y Accesos', short: 'Identidad', color: '#9B82F0', ink: '#B8A0FF', tint: '#16122A' },
  { id: 'infraestructura', label: 'Infraestructura', short: 'Infraestructura', color: '#D4A050', ink: '#E8B868', tint: '#1C180E' },
  { id: 'movilidad', label: 'Movilidad', short: 'Movilidad', color: '#4A9EF8', ink: '#6CB4FF', tint: '#0E162C' },
  { id: 'turismo', label: 'Servicios Turísticos', short: 'Turismo', color: '#2CC8BC', ink: '#48E0D4', tint: '#0C1E22' },
  { id: 'sensores', label: 'Sensores y Monitoreo', short: 'Sensores', color: '#78C43E', ink: '#90D858', tint: '#121C0E' },
  { id: 'inteligencia', label: 'Núcleo de Inteligencia', short: 'Inteligencia', color: '#E068B8', ink: '#F088CC', tint: '#1E0E1C' },
];

const MID_STATUS = { ok: '#38D888', warn: '#F0B840', crit: '#F06060', isolated: '#506878', recover: '#30D8C4', info: '#4A90F0' };
const MID_INK = { primary: '#EDF2F7', secondary: '#A0B4C8', tertiary: '#6E8498', faint: '#4A6478' };

export const MIDNIGHT: Theme = {
  mode: 'midnight',
  INK: MID_INK,
  SURFACE: { page: '#0B1826', card: '#122234', hairline: '#1E3348', hairlineSoft: '#182C40', shadow: 'rgba(0,0,0,0.28)', shadowLg: 'rgba(0,0,0,0.18)' },
  BRAND: { navy: '#EDF2F7', blue: '#4A90F0' },
  MAP: {
    sea: '#0A1E34', seaDeep: '#071828', seaShallow: '#0E2640', seaBright: '#123050',
    land: '#162840', landEdge: '#1E3852', slab: '#122238', slabDark: '#0C1A2C',
    fabric: '#1A3048', fabricCommercial: '#1E344C',
    lagoon: '#0C3038', lagoonDeep: '#0A2830', lagoonEdge: '#186058',
    roadCasing: '#243C54', graticule: '#1A3048', label: '#5A7A94', labelWater: '#3A6888',
  },
  DOMAINS: MID_DOMAINS,
  DOMAIN_MAP: makeDomainMap(MID_DOMAINS),
  STATUS: MID_STATUS,
  STATUS_TEXT: {
    ok: MID_INK.secondary, watch: '#7090B8', warn: '#E8B040', crit: '#F06868',
    off: '#506878', isolated: '#506878', recovering: '#30C8B8',
  },
  STATUS_FILL: {
    ok: null, watch: '#5A80A8', warn: MID_STATUS.warn, crit: MID_STATUS.crit,
    off: MID_STATUS.isolated, isolated: MID_STATUS.isolated, recovering: MID_STATUS.recover,
  },
  ui: {
    cardBg: 'rgba(18,34,52,0.92)',
    dockBg: 'rgba(18,34,52,0.94)',
    headerGrad: 'linear-gradient(180deg, rgba(11,24,38,0.97) 0%, rgba(11,24,38,0.9) 55%, rgba(11,24,38,0) 100%)',
    fogBanner: 'radial-gradient(ellipse at 20% 40%, rgba(11,24,38,0.94) 0%, rgba(11,24,38,0.78) 42%, rgba(11,24,38,0) 72%)',
    fogFeed: 'radial-gradient(ellipse at 30% 45%, rgba(14,26,40,0.94) 0%, rgba(14,26,40,0.82) 48%, rgba(14,26,40,0) 76%)',
    roadFill: 'rgba(255,255,255,0.1)',
    nodeWhite: '#E4ECF2',
    nodeShadow: 'rgba(0,0,0,0.2)',
    particleHalo: 'rgba(0,0,0,0.35)',
    sevBadgeBg: '#162840',
    sevBadgeBorder: '#1E3348',
  },
};
