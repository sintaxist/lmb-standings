import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

// SSR en Vercel (funciones serverless). El contenido depende de datos en
// tiempo real (MLB Stats API); además de la caché en memoria del cliente de
// datos, la página emite cabeceras Cache-Control para que el CDN de Vercel
// sirva el HTML renderizado durante 60s (stale-while-revalidate), absorbiendo
// picos de tráfico sin golpear la API en cada visita.
export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false })],
});
