import type { ApiStandingsResponse } from "./types";
import type { StandingsSnapshot } from "./domain";
import { normalizeStandings } from "./normalize";

/**
 * Cliente de la MLB Stats API con caché en memoria pensado para SSR de alto
 * tráfico (≈25k visitas/hora en horas pico):
 *
 *  - TTL corto: las visitas dentro de la ventana se sirven desde memoria, así
 *    la API externa recibe ~1 request por intervalo en lugar de una por visita.
 *  - Deduplicación: si varias requests coinciden con la caché vencida, una sola
 *    refresca y las demás esperan esa misma promesa (evita estampida).
 *  - Fallback "stale": si el upstream falla pero hay un snapshot previo, se
 *    sirve marcado como `stale` en vez de romper la página (tolerancia a fallos).
 */

const ENDPOINT =
  "https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026";

const TTL_MS = 60_000; // 1 min de frescura
const TIMEOUT_MS = 8_000;

interface CacheEntry {
  snapshot: StandingsSnapshot;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<StandingsSnapshot> | null = null;

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < TTL_MS;
}

async function fetchSnapshot(): Promise<StandingsSnapshot> {
  const res = await fetch(ENDPOINT, {
    headers: {
      "User-Agent": "LMB-Standings/1.0 (+landing)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`MLB API respondió ${res.status}`);
  const data = (await res.json()) as ApiStandingsResponse;
  return normalizeStandings(data);
}

const EMPTY_SNAPSHOT: StandingsSnapshot = {
  divisions: [],
  teams: [],
  lastUpdated: null,
  stale: true,
};

/**
 * Devuelve el snapshot de posiciones, idealmente desde caché.
 * Nunca lanza: si todo falla, regresa un snapshot vacío marcado como `stale`
 * para que la página renderice un estado de error controlado.
 */
export async function getStandings(): Promise<StandingsSnapshot> {
  if (cache && isFresh(cache)) return cache.snapshot;

  // Coalesce: una sola refresco para todas las requests concurrentes.
  if (!inFlight) {
    inFlight = fetchSnapshot()
      .then((snapshot) => {
        cache = { snapshot, fetchedAt: Date.now() };
        return snapshot;
      })
      .finally(() => {
        inFlight = null;
      });
  }

  try {
    return await inFlight;
  } catch {
    // Degradar con elegancia: datos viejos si existen, si no estado vacío.
    if (cache) return { ...cache.snapshot, stale: true };
    return EMPTY_SNAPSHOT;
  }
}
