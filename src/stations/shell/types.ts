/**
 * Fases comunes de una estación. Se DERIVAN del estado de misión (no hay estado global paralelo).
 *
 *   WAITING          misión sin iniciar: estación preparada.
 *   ACTIVE           misión en curso, la evidencia de esta estación aún no se ha registrado.
 *   EVIDENCE_FOUND   la evidencia de esta estación está registrada; la estación sigue activa.
 *   MISSION_FINISHED la misión terminó.
 */
export type StationPhase = 'WAITING' | 'ACTIVE' | 'EVIDENCE_FOUND' | 'MISSION_FINISHED';
