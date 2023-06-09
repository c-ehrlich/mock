/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: /\.stories\.(t|j)sx?$/,
      include: "**/*.tsx",
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/__test__/setup.tsx"],
  },
});
