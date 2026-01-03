export type ComputeRuntime = "nodejs20.x" | "nodejs22.x";

export function generateDeployManifest({
  reactRouterVersion,
  runtimeVersion,
}: {
  reactRouterVersion: string;
  runtimeVersion?: ComputeRuntime;
}): string {
  const manifest = {
    version: 1,
    framework: {
      name: "react-router",
      version: reactRouterVersion,
    },
    routes: [
      {
        path: "/assets/*",
        target: {
          kind: "Static",
        },
      },
      {
        path: "/*.*",
        target: {
          kind: "Static",
        },
        fallback: {
          kind: "Compute",
          src: "default",
        },
      },
      {
        path: "/*",
        target: {
          kind: "Compute",
          src: "default",
        },
      },
    ],
    computeResources: [
      {
        name: "default",
        runtime: runtimeVersion ?? "nodejs20.x",
        entrypoint: "server.mjs",
      },
    ],
  };

  return JSON.stringify(manifest, null, 2);
}
