import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin, PluginOption, ResolvedConfig } from "vite";
import { generateDeployManifest } from "./generateDeployManifest";

const AMPLITY_HOSTING_DIR = ".amplify-hosting";
const AMPLITY_HOSTING_COMPUTE_DEFAULT_DIR = `${AMPLITY_HOSTING_DIR}/compute/default`;
const AMPLITY_HOSTING_STATIC_DIR = `${AMPLITY_HOSTING_DIR}/static`;

const DEPLOY_MANIFEST = "deploy-manifest.json";

const FUNCTION_HANDLER_CHUNK = "server";

const FUNCTION_HANDLER_MODULE_ID = "virtual:react-router-amplify-hosting";
const RESOLVED_FUNCTION_HANDLER_MODULE_ID = `\0${FUNCTION_HANDLER_MODULE_ID}`;

// The virtual module that is the compiled Vite SSR entrypoint
const FUNCTION_HANDLER = /* js */ `
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

export type { PluginOption };
export function amplifyHosting(): Plugin {
  let resolvedConfig: ResolvedConfig;
  let isProductionSsrBuild = false;
  let isProductionClientBuild = false;

  return {
    name: "react-router-amplify-hosting",
    apply: "build",

    config(config, { command, isSsrBuild }) {
      isProductionClientBuild = command === "build" && isSsrBuild === false;
      isProductionSsrBuild = command === "build" && isSsrBuild === true;
      if (isProductionSsrBuild) {
        config.build ??= {};
        config.build.rollupOptions ??= {};
        config.build.rollupOptions.input = {
          [FUNCTION_HANDLER_CHUNK]: FUNCTION_HANDLER_MODULE_ID,
        };
        config.build.ssr = true;

        config.build.rollupOptions.output ??= {};
        if (Array.isArray(config.build.rollupOptions.output)) {
          console.warn(
            "Expected Vite config `build.rollupOptions.output` to be an object, but it is an array - overwriting it, but this may cause issues with your custom configuration",
          );
          config.build.rollupOptions.output = {};
        }

        config.build.rollupOptions.output.entryFileNames = "[name].mjs";
        config.ssr ??= {};
        config.ssr.noExternal = true;
      }
    },

    resolveId(id) {
      if (id === FUNCTION_HANDLER_MODULE_ID) {
        return RESOLVED_FUNCTION_HANDLER_MODULE_ID;
      }
      return;
    },

    load(id) {
      if (id === RESOLVED_FUNCTION_HANDLER_MODULE_ID) {
        return FUNCTION_HANDLER;
      }
      return;
    },

    async configResolved(config) {
      resolvedConfig = config;
    },

    // See https://rollupjs.org/plugin-development/#writebundle.
    async writeBundle(options, _bundle) {
      if (isProductionClientBuild) {
        const staticDir = join(resolvedConfig.root, AMPLITY_HOSTING_STATIC_DIR);
        await mkdir(staticDir, { recursive: true });
        const dir = options.dir ?? "";
        await cp(dir, staticDir, { recursive: true });
      }
      if (isProductionSsrBuild) {
        const computeDefaultDir = join(
          resolvedConfig.root,
          AMPLITY_HOSTING_COMPUTE_DEFAULT_DIR,
        );
        await mkdir(computeDefaultDir, { recursive: true });
        const dir = options.dir ?? "";
        await cp(dir, computeDefaultDir, { recursive: true });
        // write deploy-manifest.json
        const reactRouterVersion = await getPackageVersion(
          "react-router",
          "0.0.0",
        );
        const amplifyHostingDir = join(
          resolvedConfig.root,
          AMPLITY_HOSTING_DIR,
        );
        await writeFile(
          join(amplifyHostingDir, DEPLOY_MANIFEST),
          generateDeployManifest(reactRouterVersion),
        );
      }
    },
  };
}

async function getPackageVersion(packageName: string, version?: string) {
  try {
    const packageJsonPath = new URL(
      await import.meta.resolve(`${packageName}/package.json`),
    ).pathname;
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    return packageJson.version;
  } catch (error) {
    // Fallback to reading from node_modules
    try {
      const packageJson = JSON.parse(
        await readFile(
          join(process.cwd(), "node_modules", packageName, "package.json"),
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
