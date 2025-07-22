import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import strip from "@rollup/plugin-strip";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    // strip({
    //   include: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    //   functions: ['console.*', 'assert.*', 'debug', 'alert'],
    // }),
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
