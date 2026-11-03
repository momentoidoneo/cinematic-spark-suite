import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: { ssr: "src/seo/renderPublicPage.tsx", outDir: ".prerender", emptyOutDir: true },
});
