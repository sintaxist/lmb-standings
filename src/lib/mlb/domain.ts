/**
 * Modelo de dominio que consume la UI. Es independiente de la MLB Stats API:
 * los componentes solo conocen estas formas, nunca el JSON crudo.
 */

export type DivisionKey = "norte" | "sur";

/** Un récord parcial ya formateado para mostrar, ej. "25-8" (.758). */
export interface SplitLine {
  wins: number;
  losses: number;
  label: string; // "25-8"
  pct: string; // ".758"
}

export interface Streak {
  code: string; // "W2" | "L1"
  isWin: boolean;
  length: number;
}

/** Posición de un equipo, lista para render y para ordenar/filtrar en cliente. */
export interface TeamStanding {
  id: number;
  name: string;
  division: DivisionKey;
  rank: number; // posición en la división
  leagueRank: number; // posición en la liga
  logo: string; // URL del logo (CDN MLB)

  wins: number;
  losses: number;
  pct: string; // ".690"
  pctValue: number; // 0.69 (para ordenar)

  gamesBack: string; // "—" | "7.5"
  gamesBackValue: number; // 0 | 7.5 (para ordenar)
  gamesPlayed: number;

  streak: Streak;

  runsScored: number; // CA — carreras anotadas
  runsAllowed: number; // CP — carreras permitidas
  runDifferential: number; // DIF
  runsPerGame: number; // carreras anotadas por juego
  runsAllowedPerGame: number; // carreras permitidas por juego

  magicNumber: string; // número mágico ("-" si no aplica)
  expected: SplitLine | null; // récord esperado (pitagórico, xWinLoss)
  divisionRecord: SplitLine | null; // récord dentro de su división

  home: SplitLine;
  away: SplitLine;
  lastTen: SplitLine;

  /** Todos los récords parciales por tipo (home, away, day, night, …). */
  splits: Record<string, SplitLine>;
}

export interface DivisionStandings {
  key: DivisionKey;
  name: string; // "Norte"
  teams: TeamStanding[]; // ordenados por rank
}

export interface StandingsSnapshot {
  divisions: DivisionStandings[];
  teams: TeamStanding[]; // plano: todos los equipos
  lastUpdated: string | null; // ISO de la API
  stale: boolean; // true si se sirvió desde caché de respaldo tras un fallo upstream
}

/** Métricas derivadas para la sección "Lo más destacado". */
export interface Highlights {
  leaderNorte: TeamStanding | null;
  leaderSur: TeamStanding | null;
  bestStreak: TeamStanding | null;
  bestDiff: TeamStanding | null;
  hotTeams: TeamStanding[]; // 7+ victorias en los últimos 10
}
