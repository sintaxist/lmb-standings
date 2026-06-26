/**
 * Tooltips accesibles para cualquier elemento con [data-tip].
 *
 * - Delegación de eventos: funciona también con contenido inyectado después
 *   (p. ej. el detalle que se rellena al abrir el modal).
 * - Un único nodo flotante que se posiciona arriba del elemento, centrado,
 *   sin taparlo. Se mantiene SIEMPRE dentro del viewport (clamp horizontal y
 *   ancho máximo responsivo) para que no se corte en móvil ni en la 1ª columna
 *   de la tabla; si no hay espacio arriba, se voltea hacia abajo.
 * - Si el elemento está dentro de un <dialog open>, el tooltip se monta dentro
 *   de ese diálogo para vivir en el mismo "top layer" y no quedar detrás.
 */

const MARGIN = 8; // separación mínima respecto a los bordes del viewport
const GAP = 8; // separación entre el tooltip y el elemento
const MAX_WIDTH = 240;

let tip: HTMLElement | null = null;
let label: HTMLElement | null = null;
let arrow: HTMLElement | null = null;
let initialized = false;

function ensureTip(): void {
  if (tip) return;
  tip = document.createElement("div");
  tip.setAttribute("role", "tooltip");
  tip.className =
    "pointer-events-none fixed left-0 top-0 z-[60] rounded-md bg-ink px-2.5 py-1.5 text-center font-sans text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-100";

  label = document.createElement("span");
  tip.appendChild(label);

  arrow = document.createElement("span");
  tip.appendChild(arrow);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function show(target: HTMLElement): void {
  const text = target.dataset.tip;
  if (!text) return;
  ensureTip();
  label!.textContent = text;

  // Montar en el diálogo abierto si aplica (top layer); si no, en el body.
  const host = target.closest("dialog[open]") as HTMLElement | null;
  const container = host ?? document.body;
  if (tip!.parentElement !== container) container.appendChild(tip!);

  const vw = document.documentElement.clientWidth;
  const maxWidth = Math.min(MAX_WIDTH, vw - MARGIN * 2);
  tip!.style.maxWidth = `${maxWidth}px`;

  // Hacer medible (sin transform) antes de calcular posición.
  tip!.style.transform = "none";
  tip!.style.opacity = "1";

  const r = target.getBoundingClientRect();
  const tw = tip!.offsetWidth;
  const th = tip!.offsetHeight;
  const centerX = r.left + r.width / 2;

  // Horizontal: centrado y luego clampeado dentro del viewport.
  const left = clamp(centerX - tw / 2, MARGIN, vw - tw - MARGIN);

  // Vertical: arriba por defecto; si no cabe, abajo.
  const placeBelow = r.top - GAP - th < MARGIN;
  const top = placeBelow ? r.bottom + GAP : r.top - GAP - th;

  tip!.style.left = `${left}px`;
  tip!.style.top = `${top}px`;

  // La flecha apunta al centro real del elemento aunque el globo se haya
  // desplazado para no salirse.
  const arrowX = clamp(centerX - left, 12, tw - 12);
  arrow!.style.left = `${arrowX}px`;
  arrow!.className = placeBelow
    ? "absolute bottom-full -translate-x-1/2 border-4 border-transparent border-b-ink"
    : "absolute top-full -translate-x-1/2 border-4 border-transparent border-t-ink";
}

function hide(): void {
  if (tip) tip.style.opacity = "0";
}

export function initTooltips(): void {
  if (initialized) return;
  initialized = true;

  document.addEventListener("pointerover", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    if (t) show(t);
  });
  document.addEventListener("pointerout", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    // No ocultar al moverse a un hijo del mismo elemento.
    if (t && !t.contains(e.relatedTarget as Node)) hide();
  });
  document.addEventListener("focusin", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tip]");
    if (t) show(t);
  });
  document.addEventListener("focusout", hide);

  // Evitar tooltips desfasados al hacer scroll (incluye el scroll del modal).
  window.addEventListener("scroll", hide, { capture: true, passive: true });
  // Ocultar si se cierra un diálogo.
  document.addEventListener("close", hide, true);
}
