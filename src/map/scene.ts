// ── Escena: lienzo de diseño 1920×1080 y encuadre calculado ──

import { createStage, type CameraSpec, type SafeArea } from './projection';
import { FOCUS_POINTS } from './geo';

export const W = 1920;
export const H = 1080;

/** Zona que ocupan cabecera y base: el territorio se encuadra entre ambas. */
export const HEADER_H = 96;
export const DOCK_H = 132;

export const SAFE: SafeArea = {
  x: 96,
  y: HEADER_H + 20,
  w: W - 192,
  h: H - HEADER_H - DOCK_H - 40,
};

/** Cámara oblicua: la Zona Hotelera cae en diagonal y aprovecha el ancho 16:9 sin perder el norte. */
export const CAMERA: CameraSpec = {
  yaw: -32,
  tilt: 58,
  distance: 62_000,
};

/** Encuadre: escala y desplazamiento salen de los límites reales proyectados de FOCUS_POINTS. */
export const STAGE = createStage(FOCUS_POINTS, SAFE, CAMERA);

export const project = STAGE.project;
