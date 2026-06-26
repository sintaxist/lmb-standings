import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// SSR: el contenido depende de datos en tiempo real (MLB Stats API).
// El render en servidor + caché en memoria (ver src/lib/mlb/client.ts) permite
// servir miles de visitas por hora sin golpear la API en cada request, y degradar
// con elegancia si el upstream falla.
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [tailwind({ applyBaseStyles: false })],
});
