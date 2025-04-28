import { defineProject } from "vitest/config";
import pkg from "./package.json";

export default defineProject({
  test: {
    name: `${pkg.name}-integration`,
    include: ["integration/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
    ],
  },
});
