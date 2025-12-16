import { spawnSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import url from "node:url";
import stripIndent from "strip-indent";
import dedent from "dedent";
import type { Config } from "@react-router/dev/config";

const reactRouterBin = "node_modules/@react-router/dev/bin.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "../..");
const TMP_DIR = path.join(root, ".tmp/integration");

export const reactRouterConfig = ({
  ssr,
  basename,
  prerender,
  appDirectory,
  splitRouteModules,
  viteEnvironmentApi,
  middleware,
}: {
  ssr?: boolean;
  basename?: string;
  prerender?: boolean | string[];
  appDirectory?: string;
  splitRouteModules?: NonNullable<
    Config["future"]
  >["v8_splitRouteModules"];
  viteEnvironmentApi?: boolean;
  middleware?: boolean;
}) => {
  const config: Config = {
    ssr,
    basename,
    prerender,
    appDirectory,
    future: {
      v8_splitRouteModules: splitRouteModules,
      v8_viteEnvironmentApi: viteEnvironmentApi,
      v8_middleware: middleware,
    },
  };

  return dedent`
    import type { Config } from "@react-router/dev/config";

    export default ${JSON.stringify(config)} satisfies Config;
  `;
};

type ViteConfigServerArgs = {
  port: number;
  fsAllow?: string[];
};

type ViteConfigBuildArgs = {
  assetsInlineLimit?: number;
  assetsDir?: string;
};

type ViteConfigBaseArgs = {
  envDir?: string;
};

type ViteConfigArgs = (
  | ViteConfigServerArgs
  | { [K in keyof ViteConfigServerArgs]?: never }
) &
  ViteConfigBuildArgs &
  ViteConfigBaseArgs;

// export const viteConfig = {
//   server: async (args: ViteConfigServerArgs) => {
//     const { port, fsAllow } = args;
//     const hmrPort = await getPort();
//     const text = dedent`
//       server: {
//         port: ${port},
//         strictPort: true,
//         hmr: { port: ${hmrPort} },
//         fs: { allow: ${fsAllow ? JSON.stringify(fsAllow) : "undefined"} }
//       },
//     `;
//     return text;
//   },
//   build: ({ assetsInlineLimit, assetsDir }: ViteConfigBuildArgs = {}) => {
//     return dedent`
//       build: {
//         // Detect rolldown-vite. This should ideally use "rolldownVersion"
//         // but that's not exported. Once that's available, this
//         // check should be updated to use it.
//         rollupOptions: "transformWithOxc" in (await import("vite"))
//           ? {
//               onwarn(warning, warn) {
//                 // Ignore "The built-in minifier is still under development." warning
//                 if (warning.code === "MINIFY_WARNING") return;
//                 warn(warning);
//               },
//             }
//           : undefined,
//         assetsInlineLimit: ${assetsInlineLimit ?? "undefined"},
//         assetsDir: ${assetsDir ? `"${assetsDir}"` : "undefined"},
//       },
//     `;
//   },
//   basic: async (args: ViteConfigArgs) => {
//     return dedent`
//       import { reactRouter } from "@react-router/dev/vite";
//       import { envOnlyMacros } from "vite-env-only";
//       import tsconfigPaths from "vite-tsconfig-paths";

//       export default async () => ({
//         ${args.port ? await viteConfig.server(args) : ""}
//         ${viteConfig.build(args)}
//         envDir: ${args.envDir ? `"${args.envDir}"` : "undefined"},
//         plugins: [
//           reactRouter(),
//           envOnlyMacros(),
//           tsconfigPaths()
//         ],
//       });
//     `;
//   },
// };

export type TemplateName =
  | "vite-5-template"
  | "vite-6-template"
  | "vite-7-template";

export const viteMajorTemplates = [
  { templateName: "vite-5-template", templateDisplayName: "Vite 5" },
  { templateName: "vite-6-template", templateDisplayName: "Vite 6" },
  { templateName: "vite-7-template", templateDisplayName: "Vite 7" },
] as const satisfies Array<{
  templateName: TemplateName;
  templateDisplayName: string;
}>;

export async function createProject(
  files: Record<string, string> = {},
  templateName: TemplateName = "vite-5-template"
) {
  const projectName = `rr-${Math.random().toString(32).slice(2)}`;
  const projectDir = path.join(TMP_DIR, projectName);

  await fs.mkdir(projectDir, { recursive: true});

  // base template
  const templateDir = path.resolve(__dirname, templateName);
  await fs.cp(templateDir, projectDir, { recursive: true, errorOnExist: true });

  // user-defined files
  await Promise.all(
    Object.entries(files).map(async ([filename, contents]) => {
      const filepath = path.join(projectDir, filename);
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, stripIndent(contents));
    })
  );

  return projectDir;
}

// Avoid "Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env
// being set" in vite-ecosystem-ci which breaks empty stderr assertions. To fix
// this we always ensure that only NO_COLOR is set after spreading process.env.
const colorEnv = {
  FORCE_COLOR: undefined,
  NO_COLOR: "1",
} as const;

export const build = ({
  cwd,
  env = {},
}: {
  cwd: string;
  env?: Record<string, string>;
}) => {
  const nodeBin = process.argv[0];

  return spawnSync(nodeBin, [reactRouterBin, "build"], {
    cwd,
    env: {
      ...process.env,
      ...colorEnv,
      ...env,
      // Ensure build can pass in Rolldown. This can be removed once
      // "preserveEntrySignatures" is supported in rolldown-vite.
      ROLLDOWN_OPTIONS_VALIDATION: "loose",
    },
  });
};

export const npmInstall = ({
  cwd
}: {
  cwd: string
}) => {
  const nodeBin = process.argv[0];

  return spawnSync("npm", ["install"], {
    cwd,
    shell: true,
    env: {
      ...process.env,
      ...colorEnv,
      // Ensure build can pass in Rolldown. This can be removed once
      // "preserveEntrySignatures" is supported in rolldown-vite.
      ROLLDOWN_OPTIONS_VALIDATION: "loose",
    },
  });
};

export type Files = (args: { port: number }) => Promise<Record<string, string>>;
