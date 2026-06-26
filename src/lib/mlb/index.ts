// API pública del módulo MLB. Los consumidores importan desde "@/lib/mlb".
export * from "./domain";
export { getStandings } from "./client";
export { computeHighlights } from "./highlights";
export { buildTeamDetails, type TeamDetail, type TeamDetailMap } from "./details";
export {
  formatUpdated,
  differentialLabel,
  recordLabel,
} from "./format";
