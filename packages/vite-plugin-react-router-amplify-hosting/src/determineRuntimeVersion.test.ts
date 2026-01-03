import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  determineRuntimeVersion,
  parseNodeVersion,
  readPackageJson,
} from "./determineRuntimeVersion";

describe("parseNodeVersion", () => {
  test("should return nodejs22.x for version >= 22", () => {
    expect(parseNodeVersion("22")).toBe("nodejs22.x");
    expect(parseNodeVersion("22.0.0")).toBe("nodejs22.x");
    expect(parseNodeVersion(">=22.0.0")).toBe("nodejs22.x");
    expect(parseNodeVersion("^22.0.0")).toBe("nodejs22.x");
    expect(parseNodeVersion("~22.0.0")).toBe("nodejs22.x");
    expect(parseNodeVersion("22.x")).toBe("nodejs22.x");
    expect(parseNodeVersion("23.0.0")).toBe("nodejs22.x");
  });

  test("should return nodejs20.x for version >= 20 and < 22", () => {
    expect(parseNodeVersion("20")).toBe("nodejs20.x");
    expect(parseNodeVersion("20.0.0")).toBe("nodejs20.x");
    expect(parseNodeVersion(">=20.0.0")).toBe("nodejs20.x");
    expect(parseNodeVersion("^20.0.0")).toBe("nodejs20.x");
    expect(parseNodeVersion("~20.0.0")).toBe("nodejs20.x");
    expect(parseNodeVersion("20.x")).toBe("nodejs20.x");
    expect(parseNodeVersion("21.0.0")).toBe("nodejs20.x");
  });

  test("should return nodejs20.x for version < 20", () => {
    expect(parseNodeVersion("18")).toBe("nodejs20.x");
    expect(parseNodeVersion("18.0.0")).toBe("nodejs20.x");
    expect(parseNodeVersion("16.0.0")).toBe("nodejs20.x");
  });

  test("should return nodejs20.x for undefined or empty version", () => {
    expect(parseNodeVersion(undefined)).toBe("nodejs20.x");
    expect(parseNodeVersion("")).toBe("nodejs20.x");
  });

  test("should return nodejs20.x for invalid version string", () => {
    expect(parseNodeVersion("latest")).toBe("nodejs20.x");
    expect(parseNodeVersion("lts")).toBe("nodejs20.x");
  });
});

describe("readPackageJson", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `test-${Date.now()}-${Math.random()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should read package.json successfully", async () => {
    const packageJson = {
      name: "test-app",
      version: "1.0.0",
      engines: {
        node: ">=20.0.0",
      },
    };

    await writeFile(
      path.join(testDir, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    const result = await readPackageJson(testDir);
    expect(result).toEqual(packageJson);
  });

  test("should return null if package.json does not exist", async () => {
    const result = await readPackageJson(testDir);
    expect(result).toBeNull();
  });

  test("should return null if package.json is invalid JSON", async () => {
    await writeFile(path.join(testDir, "package.json"), "invalid json {");

    const result = await readPackageJson(testDir);
    expect(result).toBeNull();
  });
});

describe("determineRuntimeVersion", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `test-${Date.now()}-${Math.random()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test("should return nodejs22.x when engines.node is >= 22", async () => {
    await writeFile(
      path.join(testDir, "package.json"),
      JSON.stringify({
        name: "test-app",
        engines: { node: ">=22.0.0" },
      }),
    );

    const result = await determineRuntimeVersion(testDir);
    expect(result).toBe("nodejs22.x");
  });

  test("should return nodejs20.x when engines.node is >= 20", async () => {
    await writeFile(
      path.join(testDir, "package.json"),
      JSON.stringify({
        name: "test-app",
        engines: { node: ">=20.0.0" },
      }),
    );

    const result = await determineRuntimeVersion(testDir);
    expect(result).toBe("nodejs20.x");
  });

  test("should return nodejs20.x when engines.node is not specified", async () => {
    await writeFile(
      path.join(testDir, "package.json"),
      JSON.stringify({
        name: "test-app",
      }),
    );

    const result = await determineRuntimeVersion(testDir);
    expect(result).toBe("nodejs20.x");
  });

  test("should return nodejs20.x when package.json does not exist", async () => {
    const result = await determineRuntimeVersion(testDir);
    expect(result).toBe("nodejs20.x");
  });

  test("should handle various version formats", async () => {
    const testCases = [
      { version: "^22.0.0", expected: "nodejs22.x" },
      { version: "~22.0.0", expected: "nodejs22.x" },
      { version: "22.x", expected: "nodejs22.x" },
      { version: "22", expected: "nodejs22.x" },
      { version: "^20.0.0", expected: "nodejs20.x" },
      { version: "~20.0.0", expected: "nodejs20.x" },
      { version: "20.x", expected: "nodejs20.x" },
      { version: "20", expected: "nodejs20.x" },
      { version: "18", expected: "nodejs20.x" },
    ];

    for (const { version, expected } of testCases) {
      await writeFile(
        path.join(testDir, "package.json"),
        JSON.stringify({
          name: "test-app",
          engines: { node: version },
        }),
      );

      const result = await determineRuntimeVersion(testDir);
      expect(result).toBe(expected);
    }
  });
});
