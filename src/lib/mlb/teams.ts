import type { DivisionKey } from "./domain";

/**
 * Metadata estática de la LMB que no vive en el endpoint de standings:
 * a qué división pertenece cada ID de división y cómo nombrarla.
 */

export const DIVISION_IDS: Record<DivisionKey, number> = {
  norte: 222,
  sur: 223,
};

export const DIVISION_NAMES: Record<DivisionKey, string> = {
  norte: "Norte",
  sur: "Sur",
};

/** 222 -> "norte", 223 -> "sur" */
export function divisionKeyFromId(id: number): DivisionKey | null {
  if (id === DIVISION_IDS.norte) return "norte";
  if (id === DIVISION_IDS.sur) return "sur";
  return null;
}

/**
 * Logos oficiales de los equipos servidos desde el CDN de la MLB
 * (no almacenamos las imágenes; se cargan desde su URL original).
 */
export function logoPath(teamId: number): string {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}
