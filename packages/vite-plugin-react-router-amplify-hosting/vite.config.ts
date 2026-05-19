import { defineConfig } from "vite-plus";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  pack: {
    dts: true,
    format: ["esm", "cjs"],
    sourcemap: true,
  },
  test: {
    name: `${pkg.name}-unit`,
    include: ["**/*.test.ts"],
    exclude: ["integration/**", "node_modules/**", ".tmp/**"],
  },
});
