import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  pack: {
    dts: true,
    format: ['esm', 'cjs'],
    sourcemap: true,
  },
  test: {
    name: `${pkg.name}-unit`,
    include: ["**/*.test.ts"],
    exclude: ["integration/**", "node_modules/**", ".tmp/**"],
  },
});
