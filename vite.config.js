import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "popup/index.html"),
      },
    },
  },
});
