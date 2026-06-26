import type { Highlights, StandingsSnapshot, TeamStanding } from "./domain";

const HOT_TEAM_MIN_WINS = 7; // 7+ victorias en los últimos 10 juegos

function leaderOf(snapshot: StandingsSnapshot, key: "norte" | "sur") {
  const div = snapshot.divisions.find((d) => d.key === key);
  // Las divisiones ya vienen ordenadas por rank; el líder es el primero.
  return div?.teams[0] ?? null;
}

function maxBy<T>(items: T[], score: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (score(item) > score(best) ? item : best));
}

/**
 * Deriva las métricas de la sección "Lo más destacado" a partir del snapshot.
 * Todo es cómputo puro sobre el modelo de dominio: ningún componente repite
 * esta lógica.
 */
export function computeHighlights(snapshot: StandingsSnapshot): Highlights {
  const { teams } = snapshot;

  const winStreakTeams = teams.filter((t) => t.streak.isWin);

  const hotTeams = teams
    .filter((t) => t.lastTen.wins >= HOT_TEAM_MIN_WINS)
    .sort((a, b) => b.lastTen.wins - a.lastTen.wins)
    .slice(0, 3);

  return {
    leaderNorte: leaderOf(snapshot, "norte"),
    leaderSur: leaderOf(snapshot, "sur"),
    bestStreak: maxBy(winStreakTeams, (t: TeamStanding) => t.streak.length),
    bestDiff: maxBy(teams, (t: TeamStanding) => t.runDifferential),
    hotTeams,
  };
}
