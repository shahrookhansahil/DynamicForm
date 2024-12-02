import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "@svgr/rollup";

const VITE_API_BASE_URL = "http://localhost:5000";

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svgr({
      svgrOptions: {},
    }),
  ],
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(VITE_API_BASE_URL),
  },
});
