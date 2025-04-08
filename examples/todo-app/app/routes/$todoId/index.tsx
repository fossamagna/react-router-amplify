import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";
import type { Route } from "./+types/index";
import { client } from "~/lib/amplify-ssr-client";
import { redirect } from "react-router";

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method === "DELETE") {
    const {
      todoId,
    } = params;
    if (typeof todoId !== "string") {
      throw new Error("Invalid todoId");
    }
    const responseHeaders = new Headers();
    await runWithAmplifyServerContext({
      serverContext: { request, responseHeaders },
      operation: (contextSpec) =>
        client.models.Todo.delete(contextSpec, {
          id: todoId,
        }),
    });
    return redirect("/", {
      headers: responseHeaders,
    });
  }
}

