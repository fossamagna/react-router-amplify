import type {
  CredentialsAndIdentityIdProvider,
  TokenProvider,
} from "@aws-amplify/core";
import type { ResourcesConfig } from "aws-amplify";
import * as adapterCore from "aws-amplify/adapter-core";
import cookie from "cookie";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerRunner } from "./adapter";

vi.mock("aws-amplify/adapter-core", () => ({
  createUserPoolsTokenProvider: vi.fn(),
  createAWSCredentialsAndIdentityIdProvider: vi.fn(),
  runWithAmplifyServerContext: vi.fn(),
  createKeyValueStorageFromCookieStorageAdapter: vi.fn((adapter) => adapter),
}));

vi.mock("cookie", () => ({
  default: {
    parse: vi.fn(),
    serialize: vi.fn(),
  },
}));

describe("createServerRunner", () => {
  const mockAmplifyConfig: ResourcesConfig = {
    Storage: {
      S3: {
        bucket: "bucket",
        region: "us-east-1",
      },
    },
  };

  const mockAuthConfig: ResourcesConfig = {
    ...mockAmplifyConfig,
    Auth: {
      Cognito: {
        identityPoolId: "123",
        userPoolId: "abc",
        userPoolClientId: "def",
      },
    },
  };
  const mockParsedConfig = mockAmplifyConfig;
  const mockOperation = vi.fn();
  const mockResponse = { data: "test-response" };
  let mockRequest: Request;
  let mockResponseHeaders: Headers;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRequest = new Request("https://example.com");
    mockResponseHeaders = new Headers();
    vi.mocked(adapterCore.runWithAmplifyServerContext).mockResolvedValue(
      mockResponse,
    );
    vi.mocked(cookie.parse).mockReturnValue({});
    vi.mocked(cookie.serialize).mockReturnValue("cookie=value");
  });

  it("creates a serverRunner with the provided config", () => {
    const { runWithAmplifyServerContext } = createServerRunner({
      config: mockAmplifyConfig,
    });
    expect(runWithAmplifyServerContext).toBeDefined();
    expect(typeof runWithAmplifyServerContext).toBe("function");
  });

  it("runs operations with no Auth config", async () => {
    const { runWithAmplifyServerContext } = createServerRunner({
      config: mockAmplifyConfig,
    });

    const result = await runWithAmplifyServerContext({
      serverContext: {
        request: mockRequest,
        responseHeaders: mockResponseHeaders,
      },
      operation: mockOperation,
    });

    expect(adapterCore.runWithAmplifyServerContext).toHaveBeenCalledWith(
      mockParsedConfig,
      {},
      mockOperation,
    );
    expect(result).toEqual(mockResponse);
  });

  it("handles Auth config with no cookies", async () => {
    const { runWithAmplifyServerContext } = createServerRunner({
      config: mockAuthConfig,
    });

    const result = await runWithAmplifyServerContext({
      serverContext: {
        request: mockRequest,
        responseHeaders: mockResponseHeaders,
      },
      operation: mockOperation,
    });

    expect(adapterCore.createUserPoolsTokenProvider).not.toHaveBeenCalled();
    expect(
      adapterCore.createAWSCredentialsAndIdentityIdProvider,
    ).not.toHaveBeenCalled();
    expect(adapterCore.runWithAmplifyServerContext).toHaveBeenCalledWith(
      mockAuthConfig,
      {},
      mockOperation,
    );
    expect(result).toEqual(mockResponse);
  });

  it("handles Auth config with cookies", async () => {
    const mockCookies = { "auth-cookie": "value" };
    vi.mocked(cookie.parse).mockReturnValue(mockCookies);

    const mockTokenProvider = { token: "mock-token" };
    const mockCredentialsProvider = { credentials: "mock-credentials" };

    vi.mocked(adapterCore.createUserPoolsTokenProvider).mockReturnValue(
      mockTokenProvider as unknown as TokenProvider,
    );
    vi.mocked(
      adapterCore.createAWSCredentialsAndIdentityIdProvider,
    ).mockReturnValue(
      mockCredentialsProvider as unknown as CredentialsAndIdentityIdProvider,
    );

    const mockRequestWithCookies = new Request("https://example.com", {
      headers: { Cookie: "auth-cookie=value" },
    });

    const { runWithAmplifyServerContext } = createServerRunner({
      config: mockAuthConfig as ResourcesConfig,
    });

    const result = await runWithAmplifyServerContext({
      serverContext: {
        request: mockRequestWithCookies,
        responseHeaders: mockResponseHeaders,
      },
      operation: mockOperation,
    });

    expect(cookie.parse).toHaveBeenCalledWith("auth-cookie=value");
    expect(adapterCore.createUserPoolsTokenProvider).toHaveBeenCalled();
    expect(
      adapterCore.createAWSCredentialsAndIdentityIdProvider,
    ).toHaveBeenCalled();

    expect(adapterCore.runWithAmplifyServerContext).toHaveBeenCalledWith(
      mockAuthConfig,
      {
        Auth: {
          tokenProvider: mockTokenProvider,
          credentialsProvider: mockCredentialsProvider,
        },
      },
      mockOperation,
    );
    expect(result).toEqual(mockResponse);
  });
});
