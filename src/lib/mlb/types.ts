/**
 * Tipos crudos de la MLB Stats API (endpoint `standings`).
 * Solo modelamos los campos que consumimos; la API expone muchos más.
 * Estos tipos NO se usan en la vista: se transforman a modelos de dominio
 * (ver `normalize.ts`) para que la UI nunca dependa de la forma del upstream.
 */

export interface ApiSplitRecord {
  wins: number;
  losses: number;
  type: string; // "home" | "away" | "lastTen" | ...
  pct: string;
}

export interface ApiDivisionRecord {
  wins: number;
  losses: number;
  pct: string;
  division: { id: number; name: string };
}

export interface ApiTeamRecord {
  team: { id: number; name: string; link: string };
  season: string;
  streak: { streakCode: string; streakType: string; streakNumber: number };
  divisionRank: string;
  leagueRank: string;
  gamesPlayed: number;
  gamesBack: string;
  leagueRecord: { wins: number; losses: number; ties: number; pct: string };
  records: {
    splitRecords: ApiSplitRecord[];
    divisionRecords?: ApiDivisionRecord[];
    expectedRecords?: ApiSplitRecord[]; // incluye type "xWinLoss"
  };
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  divisionLeader: boolean;
  magicNumber?: string;
  wins: number;
  losses: number;
  winningPercentage: string;
}

export interface ApiStandingsRecord {
  standingsType: string;
  division: { id: number; link: string };
  lastUpdated: string;
  teamRecords: ApiTeamRecord[];
}

export interface ApiStandingsResponse {
  records: ApiStandingsRecord[];
}
