import { afterEach, describe, expect, test } from "vite-plus/test";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { stat, rm } from "node:fs/promises";
import { setTimeout as sleep } from "node:timers/promises";

import { build, createProject, npmInstall, reactRouterConfig } from "./helpers/vite";

// Start the generated server.mjs and return the response of `GET /`.
async function fetchFromBuiltServer(cwd: string): Promise<Response | undefined> {
  const server = spawn(
    process.argv[0],
    [join(cwd, ".amplify-hosting", "compute", "default", "server.mjs")],
    { cwd },
  );
  try {
    for (let i = 0; i < 50; i++) {
      try {
        return await fetch("http://localhost:3000/");
      } catch {
        await sleep(200);
      }
    }
    return undefined;
  } finally {
    server.kill();
  }
}

describe("build test", () => {
  let cwd: string;

  test("vite 7", async () => {
    cwd = await createProject({}, "vite-7-template");
    const installReturns = await npmInstall({ cwd });
    console.log(installReturns.stderr.toString());
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  test("vite 7 with v8_viteEnvironmentApi future flag", async () => {
    cwd = await createProject(
      {
        "react-router.config.ts": reactRouterConfig({
          viteEnvironmentApi: true,
          ssr: true,
        }),
      },
      "vite-7-template",
    );
    await npmInstall({ cwd });
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  test("vite 8", async () => {
    cwd = await createProject({}, "vite-8-template");
    await npmInstall({ cwd });
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  test("vite 8 with v8_viteEnvironmentApi future flag", async () => {
    cwd = await createProject(
      {
        "react-router.config.ts": reactRouterConfig({
          viteEnvironmentApi: true,
          ssr: true,
        }),
      },
      "vite-8-template",
    );
    await npmInstall({ cwd });
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  test("react-router 8", async () => {
    cwd = await createProject({}, "react-router-8-template");
    await npmInstall({ cwd });
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  // Regression test for https://github.com/fossamagna/react-router-amplify/issues/277
  test("react-router 8 with prerender", async () => {
    cwd = await createProject(
      {
        "react-router.config.ts": reactRouterConfig({
          ssr: true,
          prerender: true,
        }),
      },
      "react-router-8-template",
    );
    await npmInstall({ cwd });
    const returns = build({
      cwd,
    });
    console.log(returns.stderr.toString());
    expect(returns.status).toBe(0);
    expect((await stat(join(cwd, ".amplify-hosting", "deploy-manifest.json"))).isFile()).toBe(true);
    expect(
      (await stat(join(cwd, ".amplify-hosting", "compute", "default", "server.mjs"))).isFile(),
    ).toBe(true);
    expect((await stat(join(cwd, ".amplify-hosting", "static", "assets"))).isDirectory()).toBe(
      true,
    );
    // The prerendered page must be copied into the static output too, not
    // just the client build's own assets.
    expect((await stat(join(cwd, ".amplify-hosting", "static", "index.html"))).isFile()).toBe(true);
    // The compute function must actually be able to start: it previously
    // crashed with ERR_MODULE_NOT_FOUND because the shared chunk that
    // React Router's preserved server-build entry produces wasn't copied
    // alongside server.mjs.
    const response = await fetchFromBuiltServer(cwd);
    expect(response?.status).toBe(200);
  });

  afterEach(async () => {
    await rm(cwd, { recursive: true, force: true });
  });
});
