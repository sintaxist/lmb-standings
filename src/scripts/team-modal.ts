/**
 * Controlador del modal "Ver análisis".
 *
 * Lee el detalle de equipos serializado por el servidor (#team-details) y, al
 * pulsar cualquier disparador [data-team-trigger][data-team-id], rellena y abre
 * un <dialog> nativo (foco atrapado y cierre con ESC gratis). El contenido está
 * redactado en lenguaje sencillo para quien no conoce el beisbol.
 */

interface DetailSplit {
  label: string;
  record: string;
  pct: string;
}

interface RecordRef {
  record: string;
  pct: string;
}

interface TeamDetail {
  id: number;
  name: string;
  divisionName: string;
  rank: number;
  leagueRank: number;
  logo: string;
  wins: number;
  losses: number;
  pct: string;
  pctValue: number;
  gamesBack: string;
  gamesPlayed: number;
  runsScored: number;
  runsAllowed: number;
  runDifferential: string;
  runDiffValue: number;
  runsPerGame: number;
  runsAllowedPerGame: number;
  magicNumber: string;
  expected: RecordRef | null;
  divisionRecord: RecordRef | null;
  streakCode: string;
  streakIsWin: boolean;
  streakLength: number;
  lastTen: RecordRef;
  splits: DetailSplit[];
}

function readDetails(): Record<string, TeamDetail> {
  const el = document.getElementById("team-details");
  if (!el?.textContent) return {};
  try {
    return JSON.parse(el.textContent) as Record<string, TeamDetail>;
  } catch {
    return {};
  }
}

function setText(id: string, value: string | number): void {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}

function pctToPercent(pct: string): number {
  return Math.round(parseFloat(pct) * 100);
}

function streakPill(d: TeamDetail): string {
  const tone = d.streakIsWin
    ? "bg-positive-soft text-positive ring-1 ring-positive/25"
    : "bg-negative-soft text-negative ring-1 ring-negative/20";
  const arrow = d.streakIsWin ? "▲" : "▼";
  return `<span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold tabular ${tone}"><span aria-hidden="true">${arrow}</span>${d.streakCode}</span>`;
}

function splitsHtml(d: TeamDetail): string {
  return d.splits
    .map(
      (s) => `
      <div class="flex items-baseline justify-between gap-3">
        <dt class="font-sans text-sm text-muted">${s.label}</dt>
        <dd class="font-sans text-sm font-semibold text-ink tabular">${s.record}
          <span class="ml-1 font-normal text-muted">${pctToPercent(s.pct)}%</span>
        </dd>
      </div>`
    )
    .join("");
}

function seasonCaption(d: TeamDetail): string {
  const lead =
    d.gamesBack === "—" || d.gamesBack === "-"
      ? "Es el líder de su división."
      : `Está a ${d.gamesBack} juegos del líder de su división.`;
  return `Ha ganado ${d.wins} de ${d.gamesPlayed} partidos. ${lead}`;
}

function streakText(d: TeamDetail): string {
  const n = d.streakLength;
  const noun = d.streakIsWin
    ? n === 1 ? "victoria" : "victorias"
    : n === 1 ? "derrota" : "derrotas";
  const adj = n === 1 ? "seguida" : "seguidas";
  return `Lleva ${n} ${noun} ${adj}`;
}

export function initTeamModal(): void {
  const modal = document.getElementById("team-modal") as HTMLDialogElement | null;
  if (!modal || typeof modal.showModal !== "function") return;

  const details = readDetails();
  const logo = document.getElementById("tm-logo");
  const streak = document.getElementById("tm-streak");
  const splits = document.getElementById("tm-splits");
  const bar = document.getElementById("tm-bar");
  const dif = document.getElementById("tm-dif");

  function fill(d: TeamDetail): void {
    if (logo) {
      logo.innerHTML = `<img src="${d.logo}" alt="Logo ${d.name}" class="h-[78%] w-[78%] object-contain" />`;
    }
    setText("tm-sub", `#${d.rank} de la División ${d.divisionName}`);
    setText("tm-name", d.name);

    const pct = pctToPercent(d.pct);
    setText(
      "tm-intro",
      `${d.name} gana el ${pct}% de sus partidos (unos ${(d.pctValue * 10).toFixed(1)} de cada 10).`
    );

    // Récord de la temporada
    setText("tm-wins", d.wins);
    setText("tm-losses", d.losses);
    if (bar) bar.style.width = `${pct}%`;
    setText("tm-season-caption", seasonCaption(d));

    // Posición
    setText("tm-div-rank", `#${d.rank}`);
    setText("tm-league-rank", `#${d.leagueRank}`);
    setText("tm-gb", d.gamesBack);
    setText("tm-div-record", d.divisionRecord ? d.divisionRecord.record : "—");

    // Carreras
    setText("tm-rs", d.runsScored);
    setText("tm-ra", d.runsAllowed);
    if (dif) {
      dif.textContent = d.runDifferential;
      dif.className = `font-sans text-sm font-semibold tabular ${
        d.runDiffValue > 0
          ? "text-positive"
          : d.runDiffValue < 0
            ? "text-negative"
            : "text-ink"
      }`;
    }
    setText("tm-rpg-for", d.runsPerGame.toFixed(1));
    setText("tm-rpg-against", d.runsAllowedPerGame.toFixed(1));

    // Proyección
    setText("tm-expected", d.expected ? d.expected.record : "—");
    setText("tm-magic", d.magicNumber === "-" ? "—" : d.magicNumber);

    // Forma reciente
    setText("tm-lastten", d.lastTen.record);
    if (streak) streak.innerHTML = streakPill(d);
    setText("tm-streak-text", streakText(d));

    // Por situación
    if (splits) splits.innerHTML = splitsHtml(d);
  }

  function open(id: string): void {
    const detail = details[id];
    if (!detail) return;
    fill(detail);
    modal!.showModal();
  }

  function close(): void {
    if (modal!.open) modal!.close();
  }

  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-team-trigger]");
    if (trigger?.dataset.teamId) open(trigger.dataset.teamId);
  });

  document.getElementById("tm-close")?.addEventListener("click", close);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
}
