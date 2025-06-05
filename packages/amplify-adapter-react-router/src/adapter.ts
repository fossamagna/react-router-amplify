import type {
  KeyValueStorageInterface,
  LibraryOptions,
  ResourcesConfig,
} from "@aws-amplify/core";
import {
  type AmplifyServer,
  type CookieStorage,
  createAWSCredentialsAndIdentityIdProvider,
  createKeyValueStorageFromCookieStorageAdapter,
  createUserPoolsTokenProvider,
  runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from "aws-amplify/adapter-core";
import { parseAmplifyConfig } from "aws-amplify/utils";
import cookie from "cookie";

/**
 * Ensures the cookie names are encoded in order to look up the cookie store
 * that is manipulated by js-cookie on the client side.
 *
 * see: https://github.com/aws-amplify/amplify-js/blob/main/packages/adapter-nextjs/src/utils/cookie/ensureEncodedForJSCookie.ts
 */
function ensureEncodedForJSCookie(name: string) {
  return encodeURIComponent(name).replace(
    /%(2[346B]|5E|60|7C)/g,
    decodeURIComponent,
  );
}

export type ReactRouterServerContext = {
  request: Request;
  responseHeaders: Headers;
};

export type RunWithContextInput<OperationResult> = {
  serverContext: ReactRouterServerContext;
  operation(
    contextSpec: AmplifyServer.ContextSpec,
  ): OperationResult | Promise<OperationResult>;
};

export type RunOperationWithContext = <OperationResult>(
  input: RunWithContextInput<OperationResult>,
) => Promise<OperationResult>;

/**
 * Creates the `runWithAmplifyServerContext` function to run Amplify server side APIs in an isolated request context.
 *
 * @remarks
 * This function should be called only once; you can use the returned `runWithAmplifyServerContext` across
 * your codebase.
 *
 * @param input The input used to create the `runWithAmplifyServerContext` function.
 * @param input.config The {@link ResourcesConfig} imported from the `amplifyconfiguration.json` file or manually
 * created.
 * @returns An object that contains the `runWithAmplifyServerContext` function.
 *
 * @example
 * import { createServerRunner } from 'amplify-adapter-react-router';
 * import config from './amplify_outputs.json';
 *
 * export const { runWithAmplifyServerContext } = createServerRunner({ config })
 */
export function createServerRunner({
  config,
}: {
  config: Parameters<typeof parseAmplifyConfig>[0];
}): {
  runWithAmplifyServerContext: RunOperationWithContext;
} {
  const amplifyConfig = parseAmplifyConfig(config);

  return {
    runWithAmplifyServerContext: async ({ serverContext, operation }) => {
      const libraryOptions: LibraryOptions = {};
      if (amplifyConfig.Auth) {
        const { request, responseHeaders } = serverContext;
        const cookieHeader = request.headers.get("Cookie");
        if (cookieHeader) {
          const cookies = cookie.parse(cookieHeader);
          const keyValueStorage: KeyValueStorageInterface =
            createKeyValueStorageFromCookieStorageAdapter({
              getAll: (): CookieStorage.Cookie[] =>
                Object.entries(cookies).map(([name, value]) => ({
                  name,
                  value,
                })),
              get: (name: string): CookieStorage.Cookie | undefined => {
                const encodedName = ensureEncodedForJSCookie(name);
                return { name: encodedName, value: cookies[encodedName] };
              },
              set: (
                name: string,
                value: string,
                options?: CookieStorage.SetCookieOptions,
              ): void => {
                responseHeaders.append(
                  "Set-Cookie",
                  cookie.serialize(
                    ensureEncodedForJSCookie(name),
                    value,
                    options,
                  ),
                );
              },
              delete: (name: string): void => {
                responseHeaders.append(
                  "Set-Cookie",
                  cookie.serialize(ensureEncodedForJSCookie(name), "", {
                    expires: new Date(0),
                  }),
                );
              },
            });

          const tokenProvider = createUserPoolsTokenProvider(
            amplifyConfig.Auth,
            keyValueStorage,
          );

          const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
            amplifyConfig.Auth,
            keyValueStorage,
          );
          libraryOptions.Auth = { tokenProvider, credentialsProvider };
        }
      }

      return runWithAmplifyServerContextCore(
        amplifyConfig,
        libraryOptions,
        operation,
      );
    },
  };
}
