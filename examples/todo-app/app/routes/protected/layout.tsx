import { fetchUserAttributes } from "aws-amplify/auth/server";
import { data, Outlet, redirect } from "react-router";
import type { Route } from "./+types/layout";
import { runWithAmplifyServerContext } from "../../lib/amplifyServerUtils";

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  return await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: async (contextSpec) => {
      try {
        const user = await fetchUserAttributes(contextSpec);
        if (!user) {
          return redirect("/login", {
            // Redirect to /login
            headers: responseHeaders,
          });
        }
        return data(
          {}, // Return empty data
          {
            headers: responseHeaders,
          },
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        return redirect("/login", {
          // Redirect to /login
          headers: responseHeaders,
        });
      }
    },
  });
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return <Outlet />;
}
