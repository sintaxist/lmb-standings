import {
  buildTeamDetails,
  computeHighlights,
  formatUpdated,
  getStandings,
  type Highlights,
  type StandingsSnapshot,
  type TeamDetailMap,
} from "@/lib/mlb";

/** Todo lo que la página necesita, resuelto en un solo lugar. */
export interface StandingsPageData {
  snapshot: StandingsSnapshot;
  highlights: Highlights;
  /** Detalle por equipo para el modal "Ver análisis" (id -> detalle). */
  details: TeamDetailMap;
  updatedLabel: string | null;
  /** No hay datos para mostrar (upstream caído y sin caché previa). */
  hasError: boolean;
}

/**
 * Compositor de datos de la página: orquesta fetch+caché, derivados y formato.
 * index.astro solo llama esto y reparte el resultado a las secciones.
 */
export async function loadStandingsPage(): Promise<StandingsPageData> {
  const snapshot = await getStandings();
  return {
    snapshot,
    highlights: computeHighlights(snapshot),
    details: buildTeamDetails(snapshot),
    updatedLabel: formatUpdated(snapshot.lastUpdated),
    hasError: snapshot.teams.length === 0,
  };
}
