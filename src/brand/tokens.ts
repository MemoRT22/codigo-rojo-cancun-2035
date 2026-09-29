// ── VÉRTICE — tokens de diseño ──
//
// Este archivo re-exporta los tipos de dominio y los valores DAY como constantes de módulo.
// Los componentes de UI deben usar useTheme() para obtener tokens sensibles al tema.
// Los archivos de lógica (derive.ts, model.ts) importan tipos y DOMAINS de aquí.

export { DAY as DAY_THEME, MIDNIGHT as MIDNIGHT_THEME } from './themes';
export type { DomainId, DomainToken, Theme, ThemeMode } from './themes';
export { DAY } from './themes';

import { DAY } from './themes';

export const INK = DAY.INK;
export const SURFACE = DAY.SURFACE;
export const BRAND = DAY.BRAND;
export const MAP = DAY.MAP;
export const DOMAINS = DAY.DOMAINS;
export const DOMAIN_MAP = DAY.DOMAIN_MAP;
export const STATUS = DAY.STATUS;
export const domainColor = (id: import('./themes').DomainId) => DAY.DOMAIN_MAP.get(id)!.color;
