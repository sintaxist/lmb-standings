/** Helpers de formato puros (sin estado, fáciles de testear). */

/** "—" para sin desventaja, si no el valor tal cual ("7.5"). */
export function formatGamesBack(gamesBack: string): string {
  return gamesBack === "-" ? "—" : gamesBack;
}

/** gamesBack a número para ordenar ("-" => 0). */
export function gamesBackValue(gamesBack: string): number {
  if (gamesBack === "-") return 0;
  const n = parseFloat(gamesBack);
  return Number.isFinite(n) ? n : 0;
}

/** ".690" => 0.69 para ordenar. */
export function pctValue(pct: string): number {
  const n = parseFloat(pct);
  return Number.isFinite(n) ? n : 0;
}

/** Récord como "25-8". */
export function recordLabel(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

/** Diferencial con signo: 89 => "+89", -9 => "-9", 0 => "0". */
export function differentialLabel(diff: number): string {
  return diff > 0 ? `+${diff}` : `${diff}`;
}

/** Fecha de actualización legible en español (zona Ciudad de México). */
export function formatUpdated(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(date);
}
