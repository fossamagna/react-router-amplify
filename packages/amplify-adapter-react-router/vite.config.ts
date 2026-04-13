import { defineConfig } from "vite-plus";
import pkg from "./package.json";

export default defineConfig({
  pack: {
    unbundle: true,
    dts: true,
    format: ["esm", "cjs"],
    sourcemap: true,
  },
  test: {
    name: `${pkg.name}-unit`,
    include: ["**/*.test.ts"],
    exclude: ["integration/**"],
  },
});
