import type { StandingsSnapshot, TeamStanding } from "./domain";
import { DIVISION_NAMES } from "./teams";
import { differentialLabel } from "./format";

/**
 * Modelo plano y serializable para el modal "Ver análisis". Se inyecta como
 * JSON en la página y el controlador del modal lo consume en el cliente.
 */

export interface DetailSplit {
  label: string;
  record: string; // "25-8"
  pct: string; // ".758"
}

export interface TeamDetail {
  id: number;
  name: string;
  divisionName: string;
  rank: number;
  leagueRank: number;
  logo: string;
  wins: number;
  losses: number;
  pct: string;
  pctValue: number; // 0.678 (para barras y "X de cada 10")
  gamesBack: string;
  gamesPlayed: number;
  runsScored: number;
  runsAllowed: number;
  runDifferential: string; // ya con signo: "+89"
  runDiffValue: number;
  runsPerGame: number;
  runsAllowedPerGame: number;
  magicNumber: string;
  expected: { record: string; pct: string } | null;
  divisionRecord: { record: string; pct: string } | null;
  streakCode: string;
  streakIsWin: boolean;
  streakLength: number;
  lastTen: { record: string; pct: string };
  splits: DetailSplit[];
}

export type TeamDetailMap = Record<number, TeamDetail>;

// Splits a mostrar, en orden, con su etiqueta en español (lenguaje sencillo).
const SPLIT_LABELS: Array<{ type: string; label: string }> = [
  { type: "home", label: "De local" },
  { type: "away", label: "De visitante" },
  { type: "day", label: "De día" },
  { type: "night", label: "De noche" },
  { type: "oneRun", label: "Juegos cerrados" },
  { type: "extraInning", label: "Entradas extra" },
  { type: "left", label: "vs Lanzador zurdo" },
  { type: "right", label: "vs Lanzador derecho" },
];

function detailSplits(team: TeamStanding): DetailSplit[] {
  return SPLIT_LABELS.flatMap(({ type, label }) => {
    const split = team.splits[type];
    return split ? [{ label, record: split.label, pct: split.pct }] : [];
  });
}

function toDetail(team: TeamStanding): TeamDetail {
  return {
    id: team.id,
    name: team.name,
    divisionName: DIVISION_NAMES[team.division],
    rank: team.rank,
    leagueRank: team.leagueRank,
    logo: team.logo,
    wins: team.wins,
    losses: team.losses,
    pct: team.pct,
    pctValue: team.pctValue,
    gamesBack: team.gamesBack,
    gamesPlayed: team.gamesPlayed,
    runsScored: team.runsScored,
    runsAllowed: team.runsAllowed,
    runDifferential: differentialLabel(team.runDifferential),
    runDiffValue: team.runDifferential,
    runsPerGame: team.runsPerGame,
    runsAllowedPerGame: team.runsAllowedPerGame,
    magicNumber: team.magicNumber,
    expected: team.expected
      ? { record: team.expected.label, pct: team.expected.pct }
      : null,
    divisionRecord: team.divisionRecord
      ? { record: team.divisionRecord.label, pct: team.divisionRecord.pct }
      : null,
    streakCode: team.streak.code,
    streakIsWin: team.streak.isWin,
    streakLength: team.streak.length,
    lastTen: { record: team.lastTen.label, pct: team.lastTen.pct },
    splits: detailSplits(team),
  };
}

export function buildTeamDetails(snapshot: StandingsSnapshot): TeamDetailMap {
  const map: TeamDetailMap = {};
  for (const team of snapshot.teams) map[team.id] = toDetail(team);
  return map;
}
