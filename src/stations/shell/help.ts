// Ayudas progresivas comunes a las estaciones: suenan a sistema, nunca a profesor.

/** Segundos de sesión activa sin evidencia a partir de los cuales aparece cada nivel. */
export const HELP_AT = [180, 300] as const;

export type HelpLevel = 0 | 1 | 2;

export function helpLevel(activeSeconds: number, misses: number): HelpLevel {
  if (activeSeconds >= HELP_AT[1] || misses >= 3) return 2;
  if (activeSeconds >= HELP_AT[0]) return 1;
  return 0;
}
