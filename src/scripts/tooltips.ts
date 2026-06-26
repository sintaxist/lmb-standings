/**
 * Tooltips accesibles para cualquier elemento con [data-tip].
 *
 * Se renderiza un único nodo flotante en <body> (no dentro de la tabla) para
 * que no lo recorte el `overflow` del contenedor con scroll horizontal, y se
 * posiciona SIEMPRE arriba del elemento, centrado. Responde a mouse y a foco
 * de teclado.
 */

let tip: HTMLElement | null = null;
let label: HTMLElement | null = null;

function ensureTip(): void {
  if (tip) return;
  tip = document.createElement("div");
  tip.setAttribute("role", "tooltip");
  tip.className =
    "pointer-events-none fixed left-0 top-0 z-[60] max-w-[220px] -translate-x-1/2 -translate-y-full rounded-md bg-ink px-2.5 py-1.5 text-center font-sans text-xs font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-100";

  label = document.createElement("span");
  tip.appendChild(label);

  const arrow = document.createElement("span");
  arrow.className =
    "absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink";
  tip.appendChild(arrow);

  document.body.appendChild(tip);
}

function show(target: HTMLElement): void {
  const text = target.dataset.tip;
  if (!text) return;
  ensureTip();
  label!.textContent = text;

  const r = target.getBoundingClientRect();
  tip!.style.left = `${r.left + r.width / 2}px`;
  tip!.style.top = `${r.top - 8}px`;
  tip!.style.opacity = "1";
}

function hide(): void {
  if (tip) tip.style.opacity = "0";
}

export function initTooltips(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-tip]");
  for (const t of targets) {
    t.addEventListener("mouseenter", () => show(t));
    t.addEventListener("mouseleave", hide);
    t.addEventListener("focus", () => show(t));
    t.addEventListener("blur", hide);
  }
  // Ocultar al hacer scroll para que no quede flotando desfasado.
  window.addEventListener("scroll", hide, { passive: true });
}
