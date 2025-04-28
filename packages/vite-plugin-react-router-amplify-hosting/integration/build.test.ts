import { afterEach, describe, expect, test } from "vitest";
import { join } from "node:path";
import { stat, rm } from "node:fs/promises";

import { build, createProject, npmInstall, reactRouterConfig } from "./helpers/vite";

describe("build test", () => {
  let cwd: string;

  test("vite 5", {timeout: 60_000}, async () => {
    cwd = await createProject({}, "vite-5-template");
    const installReturns = await npmInstall({ cwd });
    console.log(installReturns.stderr.toString());
    const returns = await build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(true);
  });

  test("vite 6", {timeout: 60_000}, async () => {
    cwd = await createProject({}, "vite-6-template");
    await npmInstall({ cwd });
    const returns = await build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(true);
  });

  test("vite 6 with unstable_viteEnvironmentApi future flag", {timeout: 60_000}, async () => {
    cwd = await createProject({
      "react-router.config.ts": reactRouterConfig({
        viteEnvironmentApi: true,
        ssr: true,
      }),
    }, "vite-6-template");
    await npmInstall({ cwd });
    const returns = await build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile()).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(true);
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });
});

