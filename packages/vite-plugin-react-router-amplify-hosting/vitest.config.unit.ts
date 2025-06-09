import { defineProject } from "vitest/config";
import pkg from "./package.json";

export default defineProject({
  test: {
    name: `${pkg.name}-unit`,
    include: ["**/*.test.ts"],
    exclude: ["integration/**", "node_modules/**", ".tmp/**"],
  },
});
