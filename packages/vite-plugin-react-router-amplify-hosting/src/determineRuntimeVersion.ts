import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ComputeRuntime } from "./generateDeployManifest";

export async function determineRuntimeVersion(
  rootDir: string,
): Promise<ComputeRuntime> {
  const packageJson = await readPackageJson(rootDir);
  if (!packageJson) {
    return "nodejs20.x";
  }

  const nodeVersion = packageJson.engines?.node;
  return parseNodeVersion(nodeVersion);
}

export async function readPackageJson(
  rootDir: string,
): Promise<{ engines?: { node?: string } } | null> {
  try {
    const packageJsonPath = path.join(rootDir, "package.json");
    const content = await readFile(packageJsonPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.warn("Failed to read package.json:", error);
    return null;
  }
}

export function parseNodeVersion(nodeVersionSpec?: string): ComputeRuntime {
  if (!nodeVersionSpec) {
    return "nodejs20.x";
  }

  // Extract version number from strings like ">=20.0.0", "^20.0.0", "20", "20.x", etc.
  const match = nodeVersionSpec.match(/\d+/);
  if (!match) {
    return "nodejs20.x";
  }

  const majorVersion = Number.parseInt(match[0], 10);

  // Map major version to ComputeRuntime
  if (majorVersion >= 22) {
    return "nodejs22.x";
  }
  if (majorVersion >= 20) {
    return "nodejs20.x";
  }
  // For older versions, default to nodejs20.x
  console.warn(
    `Node.js version ${nodeVersionSpec} is not supported. Defaulting to nodejs20.x`,
  );
  return "nodejs20.x";
}
