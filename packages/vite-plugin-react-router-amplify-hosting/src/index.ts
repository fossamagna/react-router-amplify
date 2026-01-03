import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BuildManifest,
  Config as ReactRouterConfig,
} from "@react-router/dev/config";
import semver from "semver";
import type {
  BuildEnvironmentOptions,
  EnvironmentOptions,
  Plugin,
  PluginOption,
  ResolvedConfig,
  UserConfig,
} from "vite";
import { determineRuntimeVersion } from "./determineRuntimeVersion";
import { generateDeployManifest } from "./generateDeployManifest";

const AMPLITY_HOSTING_DIR = ".amplify-hosting";
const AMPLITY_HOSTING_COMPUTE_DEFAULT_DIR = `${AMPLITY_HOSTING_DIR}/compute/default`;
const AMPLITY_HOSTING_STATIC_DIR = `${AMPLITY_HOSTING_DIR}/static`;

const DEPLOY_MANIFEST = "deploy-manifest.json";

const FUNCTION_HANDLER_CHUNK = "server";

const FUNCTION_HANDLER_MODULE_ID = "virtual:react-router-amplify-hosting";
const RESOLVED_FUNCTION_HANDLER_MODULE_ID = `\0${FUNCTION_HANDLER_MODULE_ID}`;

// The virtual module that is the compiled Vite SSR entrypoint
const FUNCTION_HANDLER_V4 = /* js */ `
import { createRequestHandler } from "@react-router/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import * as build from "virtual:react-router/server-build";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(express.static("build/client"));
app.use(morgan("tiny"));

app.all("*", createRequestHandler({
  build,
  getLoadContext: async (_req, ctx) => ctx,
}));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
`;

const FUNCTION_HANDLER_V5 = /* js */ `
import { createRequestHandler } from "@react-router/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import * as build from "virtual:react-router/server-build";

const app = express();
app.disable("x-powered-by");
app.use(compression());
app.use(express.static("build/client"));
app.use(morgan("tiny"));

app.all("*splat", createRequestHandler({
  build,
  getLoadContext: async (_req, ctx) => ctx,
}));

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000");
});
`;

export type { PluginOption };

export type PluginOptions = {
  expressVersion?: "5" | "4";
  computeRuntime?: "nodejs20.x" | "nodejs22.x";
};
export function amplifyHosting(opts?: PluginOptions): Plugin {
  let resolvedConfig: ResolvedConfig;
  let pluginConfig: ReturnType<typeof resolvePluginConfig>;
  const pluginOptions: PluginOptions = opts ?? {};

  return {
    name: "react-router-amplify-hosting",
    apply: "build",

    config(config) {
      pluginConfig = resolvePluginConfig(config);

      if (!pluginConfig) {
        return config;
      }

      if (pluginConfig.isSsrBuild) {
        config.build = configureBuildEnvironmentOptions(config.build ?? {});
        config.ssr ??= {};
        config.ssr.noExternal = true;
      }

      if (pluginConfig.future.v8_viteEnvironmentApi) {
        return {
          ...config,
          ssr: {
            ...config.ssr,
            noExternal: true,
          },
          environments: {
            ssr: {
              build: configureBuildEnvironmentOptions({}),
            },
          },
        };
      }

      return {
        ...config,
      };
    },

    resolveId(id) {
      if (id === FUNCTION_HANDLER_MODULE_ID) {
        return RESOLVED_FUNCTION_HANDLER_MODULE_ID;
      }
      return;
    },

    async load(id) {
      if (id === RESOLVED_FUNCTION_HANDLER_MODULE_ID) {
        let expressVersion: string | undefined;
        if (pluginOptions.expressVersion) {
          expressVersion = pluginOptions.expressVersion;
          console.log(`Using configured express version: ${expressVersion}`);
        } else {
          expressVersion =
            pluginOptions.expressVersion ??
            (await getPackageVersion("express"));
          console.log(`Detected express version: ${expressVersion}`);
        }
        const semverExpressVersion = expressVersion
          ? semver.coerce(expressVersion)
          : null;
        if (semverExpressVersion && semver.gte(semverExpressVersion, "5.0.0")) {
          return FUNCTION_HANDLER_V5;
        }
        return FUNCTION_HANDLER_V4;
      }
      return;
    },

    async configResolved(config) {
      resolvedConfig = config;
    },

    // See https://rollupjs.org/plugin-development/#writebundle.
    async writeBundle(options, _bundle) {
      if (!pluginConfig) {
        return;
      }
      const isClientBuild = pluginConfig.future.v8_viteEnvironmentApi
        ? this.environment.name === "client"
        : !pluginConfig.isSsrBuild;
      const isServerBuild = pluginConfig.future.v8_viteEnvironmentApi
        ? this.environment.name === "ssr"
        : pluginConfig.isSsrBuild;

      if (isClientBuild) {
        const staticDir = path.join(
          resolvedConfig.root,
          AMPLITY_HOSTING_STATIC_DIR,
        );
        await mkdir(staticDir, { recursive: true });
        const dir = options.dir ?? "";
        await cp(dir, staticDir, { recursive: true });
      } else if (isServerBuild) {
        // copy server.mjs to the compute default directory
        const computeDefaultDir = path.join(
          resolvedConfig.root,
          AMPLITY_HOSTING_COMPUTE_DEFAULT_DIR,
        );
        await mkdir(computeDefaultDir, { recursive: true });
        const dir = options.dir ?? "";
        await copyFile(
          path.join(dir, "server.mjs"),
          path.join(computeDefaultDir, "server.mjs"),
        );
        // write deploy-manifest.json
        const reactRouterVersion = await getPackageVersion(
          "react-router",
          "0.0.0",
        );
        const { computeRuntime } = pluginOptions;
        const runtimeVersion =
          computeRuntime ??
          (await determineRuntimeVersion(resolvedConfig.root));
        console.log(`Using compute runtime: ${runtimeVersion}`);
        const amplifyHostingDir = path.join(
          resolvedConfig.root,
          AMPLITY_HOSTING_DIR,
        );
        await writeFile(
          path.join(amplifyHostingDir, DEPLOY_MANIFEST),
          generateDeployManifest({ reactRouterVersion, runtimeVersion }),
        );
      }
    },
  };
}

function configureBuildEnvironmentOptions(build: BuildEnvironmentOptions) {
  build.rollupOptions ??= {};
  build.rollupOptions.input = {
    [FUNCTION_HANDLER_CHUNK]: FUNCTION_HANDLER_MODULE_ID,
  };
  build.ssr = true;

  build.rollupOptions.output ??= {};
  if (Array.isArray(build.rollupOptions.output)) {
    console.warn(
      "Expected Vite config `build.rollupOptions.output` to be an object, but it is an array - overwriting it, but this may cause issues with your custom configuration",
    );
    build.rollupOptions.output = {};
  }

  build.rollupOptions.output.entryFileNames = "[name].mjs";
  return build;
}

type ResolvedEnvironmentBuildContext = {
  name: string; //EnvironmentName;
  options: EnvironmentOptions;
};

type ReactRouterPluginContext = {
  environmentBuildContext: ResolvedEnvironmentBuildContext | null;
  buildManifest: BuildManifest | null;
  rootDirectory: string;
  entryClientFilePath: string;
  entryServerFilePath: string;
  publicPath: string;
  reactRouterConfig: Required<ReactRouterConfig>;
  viteManifestEnabled: boolean;
};

function resolvePluginConfig(config: UserConfig) {
  if (!("__reactRouterPluginContext" in config)) {
    return null;
  }
  const { reactRouterConfig, environmentBuildContext, rootDirectory } = config[
    "__reactRouterPluginContext" as keyof typeof config
  ] as ReactRouterPluginContext;
  const buildDirectory = path.relative(
    rootDirectory,
    reactRouterConfig.buildDirectory,
  );
  const appDirectory = path.relative(
    rootDirectory,
    reactRouterConfig.appDirectory,
  );
  const isSsrBuild = environmentBuildContext?.name === "ssr";
  const future = reactRouterConfig.future;

  return {
    rootDirectory,
    buildDirectory,
    appDirectory,
    isSsrBuild,
    future,
  };
}

async function getPackageVersion(
  packageName: string,
): Promise<string | undefined>;
async function getPackageVersion(
  packageName: string,
  version: string,
): Promise<string>;
async function getPackageVersion(
  packageName: string,
  version?: string,
): Promise<string | undefined> {
  try {
    const packageJsonPath = new URL(
      await import.meta.resolve(`${packageName}/package.json`),
    ).pathname;
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch (_error) {
    // Fallback to reading from node_modules
    try {
      const packageJson = JSON.parse(
        await readFile(
          path.join(process.cwd(), "node_modules", packageName, "package.json"),
          "utf8",
        ),
      );
      return packageJson.version;
    } catch (error) {
      console.error(`Failed to get version of ${packageName}:`, error);
    }
    return version;
  }
}
