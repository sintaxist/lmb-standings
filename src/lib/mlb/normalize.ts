import type {
  ApiStandingsResponse,
  ApiTeamRecord,
  ApiSplitRecord,
} from "./types";
import type {
  DivisionKey,
  DivisionStandings,
  SplitLine,
  StandingsSnapshot,
  TeamStanding,
} from "./domain";
import { DIVISION_IDS, DIVISION_NAMES, divisionKeyFromId, logoPath } from "./teams";
import {
  formatGamesBack,
  gamesBackValue,
  pctValue,
  recordLabel,
} from "./format";

const EMPTY_SPLIT: SplitLine = { wins: 0, losses: 0, label: "0-0", pct: ".000" };

function toSplitLine(raw: ApiSplitRecord): SplitLine {
  return {
    wins: raw.wins,
    losses: raw.losses,
    label: recordLabel(raw.wins, raw.losses),
    pct: raw.pct,
  };
}

function splitsByType(splits: ApiSplitRecord[]): Record<string, SplitLine> {
  const map: Record<string, SplitLine> = {};
  for (const s of splits) map[s.type] = toSplitLine(s);
  return map;
}

function perGame(total: number, games: number): number {
  return games > 0 ? Math.round((total / games) * 10) / 10 : 0;
}

function expectedLine(raw: ApiTeamRecord): SplitLine | null {
  const x = raw.records.expectedRecords?.find((r) => r.type === "xWinLoss");
  return x ? toSplitLine(x) : null;
}

function divisionLine(
  raw: ApiTeamRecord,
  division: DivisionKey
): SplitLine | null {
  const own = raw.records.divisionRecords?.find(
    (d) => d.division.id === DIVISION_IDS[division]
  );
  if (!own) return null;
  return {
    wins: own.wins,
    losses: own.losses,
    label: recordLabel(own.wins, own.losses),
    pct: own.pct,
  };
}

function toTeamStanding(
  raw: ApiTeamRecord,
  division: DivisionKey
): TeamStanding {
  const splits = splitsByType(raw.records.splitRecords);
  const at = (type: string) => splits[type] ?? EMPTY_SPLIT;
  return {
    id: raw.team.id,
    name: raw.team.name,
    division,
    rank: parseInt(raw.divisionRank, 10) || 0,
    leagueRank: parseInt(raw.leagueRank, 10) || 0,
    logo: logoPath(raw.team.id),

    wins: raw.leagueRecord.wins,
    losses: raw.leagueRecord.losses,
    pct: raw.leagueRecord.pct,
    pctValue: pctValue(raw.leagueRecord.pct),

    gamesBack: formatGamesBack(raw.gamesBack),
    gamesBackValue: gamesBackValue(raw.gamesBack),
    gamesPlayed: raw.gamesPlayed,

    streak: {
      code: raw.streak.streakCode,
      isWin: raw.streak.streakType === "wins",
      length: raw.streak.streakNumber,
    },

    runsScored: raw.runsScored ?? 0,
    runsAllowed: raw.runsAllowed ?? 0,
    runDifferential: raw.runDifferential ?? 0,
    runsPerGame: perGame(raw.runsScored ?? 0, raw.gamesPlayed),
    runsAllowedPerGame: perGame(raw.runsAllowed ?? 0, raw.gamesPlayed),

    magicNumber: raw.magicNumber ?? "-",
    expected: expectedLine(raw),
    divisionRecord: divisionLine(raw, division),

    home: at("home"),
    away: at("away"),
    lastTen: at("lastTen"),
    splits,
  };
}

/**
 * Convierte la respuesta cruda de la API en un snapshot de dominio:
 * divisiones ordenadas por rank, lista plana de equipos y timestamp.
 */
export function normalizeStandings(
  data: ApiStandingsResponse
): StandingsSnapshot {
  const divisions: DivisionStandings[] = [];
  let lastUpdated: string | null = null;

  // Orden estable de divisiones: Norte primero, luego Sur.
  const order: DivisionKey[] = ["norte", "sur"];
  const byKey = new Map<DivisionKey, DivisionStandings>();

  for (const record of data.records) {
    const key = divisionKeyFromId(record.division.id);
    if (!key) continue;

    const teams = record.teamRecords
      .map((t) => toTeamStanding(t, key))
      .sort((a, b) => a.rank - b.rank);

    byKey.set(key, { key, name: DIVISION_NAMES[key], teams });

    if (record.lastUpdated && (!lastUpdated || record.lastUpdated > lastUpdated)) {
      lastUpdated = record.lastUpdated;
    }
  }

  for (const key of order) {
    const div = byKey.get(key);
    if (div) divisions.push(div);
  }

  const teams = divisions.flatMap((d) => d.teams);

  return { divisions, teams, lastUpdated, stale: false };
}
