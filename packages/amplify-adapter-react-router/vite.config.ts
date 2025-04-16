import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          sourcemap: true,
          dir: 'dist/es',
          entryFileNames: '[name].mjs',
        },
        {
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          sourcemap: true,
          dir: 'dist/cjs',
          entryFileNames: '[name].cjs',
        }
      ],
    },
  },
  plugins: [dts({ rollupTypes: false })],
});
