# LMB 2026 — Tabla de Posiciones

Landing page de resultados de la **Liga Mexicana de Beisbol** (temporada 2026),
maquetada en **Astro + Tailwind** a partir del diseño de Figma y alimentada en
tiempo real por la **MLB Stats API**.

> Reto técnico Igni — Desafío #2 (Maquetado).

---

## Cómo correr

```bash
npm install
npm run dev      # desarrollo en http://localhost:4321
npm run build    # build SSR para Vercel (genera .vercel/output)
npm run check    # type-check de Astro/TS
```

---

## Deploy (Vercel)

El proyecto usa el adapter **`@astrojs/vercel`** (`output: "server"`), así que se
despliega como funciones serverless con SSR. Dos formas:

**Desde GitHub (recomendado):** importar el repo en
[vercel.com/new](https://vercel.com/new) → Vercel detecta Astro y construye solo.
Cada push a `main` redepliega.

**Con la CLI:**

```bash
npm i -g vercel
vercel          # primer deploy (preview) + vincula el proyecto
vercel --prod   # deploy a producción
```

La página emite `Cache-Control: s-maxage=60, stale-while-revalidate=300`, de modo
que el CDN de Vercel cachea el HTML 60s y absorbe los picos de tráfico.

---

## Decisiones clave

### Render: SSR con caché en memoria

El contenido depende de datos en vivo, así que el sitio se renderiza en el
servidor (`output: "server"` + adapter de Node). Para soportar tráfico alto
(~25k visitas/hora) sin golpear la API en cada request, el cliente de datos
([`src/lib/mlb/client.ts`](src/lib/mlb/client.ts)) implementa:

- **Caché con TTL** (60 s): las visitas dentro de la ventana se sirven desde
  memoria; la API externa recibe ~1 request por intervalo.
- **Deduplicación de peticiones**: si varias requests coinciden con la caché
  vencida, una sola refresca y el resto espera esa misma promesa (sin estampida).
- **Fallback `stale`**: si el upstream falla pero hay datos previos, se sirven
  marcados como `stale` (la cabecera muestra "Datos en caché") en lugar de
  romper la página. Tolerancia a fallos.

### Arquitectura por capas (sin lógica en la vista)

```
src/
├── lib/
│   ├── mlb/
│   │   ├── types.ts        # Tipos CRUDOS de la MLB Stats API
│   │   ├── domain.ts       # Modelo de DOMINIO que consume la UI
│   │   ├── teams.ts        # Metadata estática (divisiones, ruta de logos)
│   │   ├── format.ts       # Helpers de formato puros
│   │   ├── normalize.ts    # API cruda  ->  modelo de dominio
│   │   ├── highlights.ts   # Stats derivados ("Lo más destacado")
│   │   ├── client.ts       # Fetch + caché + fallback
│   │   └── index.ts        # API pública del módulo (@/lib/mlb)
│   └── page-data.ts        # Compositor: une fetch + derivados + formato
│
├── components/
│   ├── layout/             # SiteHeader (hero), SiteFooter (glosario)
│   ├── sections/           # Secciones del Figma (Highlights, Standings, Sponsor…)
│   └── ui/                 # Primitivos presentacionales reutilizables
│
├── scripts/
│   └── standings-controller.ts  # Interactividad (tabs, búsqueda, orden, vista)
│
├── styles/global.css       # Base + tokens
├── layouts/BaseLayout.astro
└── pages/index.astro       # Orquestación delgada: solo reparte datos a secciones
```

Reglas que evitan el "código espagueti":

- **La UI nunca ve el JSON crudo.** `normalize.ts` traduce la respuesta de la
  API a un modelo de dominio estable (`TeamStanding`, `DivisionStandings`). Si
  la API cambia, solo se toca esa capa.
- **Una sola fuente para cada cómputo.** Los derivados (líderes, mejor racha,
  mayor diferencial, equipos en forma) viven en `highlights.ts`; ningún
  componente los recalcula.
- **Componentes presentacionales.** Reciben props tipadas del dominio y solo
  pintan. No hacen fetch ni transforman datos.
- **`index.astro` es delgado:** llama `loadStandingsPage()` y reparte el
  resultado a cada sección.

### Interactividad como _progressive enhancement_

El controlador ([`src/scripts/standings-controller.ts`](src/scripts/standings-controller.ts))
opera sobre el DOM ya renderizado por el servidor: muestra/oculta y reordena los
elementos existentes (no reconstruye markup ni vuelve a pedir datos). La página
funciona aunque el script no llegue a ejecutarse. Soporta:

- Filtro por división (Todas / Norte / Sur)
- Búsqueda por nombre de equipo
- Orden por posición, % de victorias, victorias, derrotas, juegos atrás, racha
  o diferencial (con dirección invertible)
- Alternancia entre vista de **Tarjetas** y **Tabla**

### Diseño

- **Tokens** extraídos de las variables de Figma (colores, tipografías) viven en
  [`tailwind.config.mjs`](tailwind.config.mjs); los componentes usan utilidades
  semánticas (`brand-red`, `surface-page`, `positive`…), no hex sueltos.
- **Tipografías:** Oswald (condensada, títulos y cifras) + Inter (cuerpo).
- **Assets:** los logos de los equipos se sirven desde su URL original (CDN de
  la MLB, `mlbstatic.com/team-logos/{id}.svg`), sin almacenarlos. El fondo del
  hero, el logo LMB (también usado como favicon) y el banner del patrocinador se
  extrajeron del documento de Figma y viven en `public/img/`.

## Fuente de datos

```
https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026
```

División 222 = Norte, 223 = Sur. Pública, sin autenticación.

## Notas

- El botón "Ver análisis / Ver" abre un modal (`<dialog>` nativo, accesible)
  con el análisis del equipo: récord, carreras, racha y desglose por situación
  (casa, visita, últ. 10, día/noche, 1 carrera, extra innings, vs zurdos/
  derechos). El detalle se serializa en el HTML (`buildTeamDetails`) y lo abre
  el controlador [`src/scripts/team-modal.ts`](src/scripts/team-modal.ts) por
  delegación de eventos.
- El banner de Caliente se recreó con CSS a partir del mock.
- Mobile no era prioridad: el layout degrada de forma razonable (grids a 1
  columna, tabla con scroll horizontal), pero el foco es el desktop del Figma.
