/**
 * Controlador de la sección de posiciones (cliente).
 *
 * Opera sobre el DOM ya renderizado por el servidor (progressive enhancement):
 * filtra por división, busca por nombre, ordena y alterna entre tarjetas/tabla.
 * No vuelve a pedir datos ni reconstruye markup; solo muestra/oculta y reordena
 * los elementos existentes, así que la página funciona aun sin que este script
 * llegue a ejecutarse.
 */

type SortField = "rank" | "pct" | "wins" | "losses" | "gb" | "streak" | "rundiff";
type SortDir = "asc" | "desc";
type ViewMode = "cards" | "table";
type DivisionFilter = "all" | "norte" | "sur";

// Dirección "natural" de cada criterio (mejor primero).
const DEFAULT_DIR: Record<SortField, SortDir> = {
  rank: "asc",
  pct: "desc",
  wins: "desc",
  losses: "asc",
  gb: "asc",
  streak: "desc",
  rundiff: "desc",
};

const ITEM_SELECTOR = ".team-card, .standings-row";

function num(el: HTMLElement, key: string, fallback = 0): number {
  const v = Number(el.dataset[key]);
  return Number.isFinite(v) ? v : fallback;
}

export function initStandingsController(): void {
  const root = document.querySelector<HTMLElement>("[data-standings-controls]");
  const cardView = document.getElementById("card-view");
  const tableView = document.getElementById("table-view");
  if (!root || !cardView || !tableView) return;

  const state = {
    division: "all" as DivisionFilter,
    query: "",
    sort: "rank" as SortField,
    dir: "asc" as SortDir,
    view: "cards" as ViewMode,
  };

  const els = {
    tabs: Array.from(document.querySelectorAll<HTMLButtonElement>(".division-tab")),
    toggles: Array.from(document.querySelectorAll<HTMLButtonElement>(".view-toggle")),
    search: document.getElementById("team-search") as HTMLInputElement | null,
    sortField: document.getElementById("sort-field") as HTMLSelectElement | null,
    sortDir: document.getElementById("sort-dir") as HTMLButtonElement | null,
    sortDirIcon: document.getElementById("sort-dir-icon"),
    summary: document.getElementById("filter-summary"),
    count: document.getElementById("filter-count"),
  };

  function sortValue(el: HTMLElement): number {
    switch (state.sort) {
      case "pct": return num(el, "pct");
      case "wins": return num(el, "wins");
      case "losses": return num(el, "losses");
      case "gb": return num(el, "gb");
      case "streak": return num(el, "streak");
      case "rundiff": return num(el, "rundiff");
      default: return num(el, "rank", 999);
    }
  }

  function matchesQuery(el: HTMLElement): boolean {
    if (!state.query) return true;
    return (el.dataset.name ?? "").includes(state.query);
  }

  function activeContainer(): HTMLElement {
    return state.view === "cards" ? cardView! : tableView!;
  }

  function apply(): void {
    cardView!.classList.toggle("hidden", state.view !== "cards");
    tableView!.classList.toggle("hidden", state.view !== "table");

    const container = activeContainer();
    const blocks = Array.from(
      container.querySelectorAll<HTMLElement>("[data-division-block]")
    );

    let total = 0;
    for (const block of blocks) {
      const division = block.dataset.division ?? "";
      const visibleDivision = state.division === "all" || state.division === division;
      block.style.display = visibleDivision ? "" : "none";
      if (!visibleDivision) continue;

      const items = Array.from(block.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
      const parent = items[0]?.parentElement ?? null;
      const visible = items.filter(matchesQuery);

      items.forEach((el) => (el.style.display = "none"));
      visible
        .sort((a, b) => {
          const delta = sortValue(a) - sortValue(b);
          return state.dir === "asc" ? delta : -delta;
        })
        .forEach((el) => {
          el.style.display = "";
          parent?.appendChild(el);
        });

      const empty = block.querySelector("[data-empty]");
      empty?.classList.toggle("hidden", visible.length > 0);

      const count = block.querySelector("[data-count]");
      if (count) {
        count.textContent = `${visible.length} ${
          visible.length === 1 ? "equipo" : "equipos"
        }`;
      }

      total += visible.length;
    }

    const filtered =
      state.division !== "all" || state.query !== "" || state.sort !== "rank";
    els.summary?.classList.toggle("hidden", !filtered);
    if (els.count) els.count.textContent = String(total);
  }

  function setActive(buttons: HTMLButtonElement[], active: HTMLButtonElement): void {
    for (const btn of buttons) {
      const on = btn === active;
      if (on) btn.setAttribute("data-active", "");
      else btn.removeAttribute("data-active");
      btn.setAttribute("aria-selected", String(on));
    }
  }

  function updateSortDirUI(): void {
    const isDefault = state.dir === DEFAULT_DIR[state.sort];
    els.sortDir?.classList.toggle("border-brand-navy", !isDefault);
    els.sortDir?.classList.toggle("text-brand-navy", !isDefault);
    if (els.sortDirIcon) {
      els.sortDirIcon.innerHTML =
        state.dir === "asc"
          ? '<path d="M8 13V3" /><path d="M4 7l4-4 4 4" />'
          : '<path d="M8 3v10" /><path d="M4 9l4 4 4-4" />';
    }
  }

  // ── Listeners ──────────────────────────────────────────────────────────────
  for (const tab of els.tabs) {
    tab.addEventListener("click", () => {
      state.division = (tab.dataset.division as DivisionFilter) ?? "all";
      setActive(els.tabs, tab);
      apply();
    });
  }

  for (const toggle of els.toggles) {
    toggle.addEventListener("click", () => {
      state.view = (toggle.dataset.view as ViewMode) ?? "cards";
      setActive(els.toggles, toggle);
      apply();
    });
  }

  els.search?.addEventListener("input", (e) => {
    state.query = (e.target as HTMLInputElement).value.trim().toLowerCase();
    apply();
  });

  els.sortField?.addEventListener("change", (e) => {
    state.sort = (e.target as HTMLSelectElement).value as SortField;
    state.dir = DEFAULT_DIR[state.sort];
    updateSortDirUI();
    apply();
  });

  els.sortDir?.addEventListener("click", () => {
    state.dir = state.dir === "asc" ? "desc" : "asc";
    updateSortDirUI();
    apply();
  });

  updateSortDirUI();
  apply();
}
