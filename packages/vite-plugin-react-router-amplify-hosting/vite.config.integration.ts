import { defineProject } from "vite-plus";
import pkg from "./package.json";

export default defineProject({
  test: {
    name: `${pkg.name}-integration`,
    include: ["integration/**/*.test.ts"],
    testTimeout: 180_000,
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
});
