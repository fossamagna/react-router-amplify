import type { Route } from "./+types/index";
import { TodoList } from "~/components/TodoList";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";
import { data, Link } from "react-router";
import { client } from "~/lib/amplify-ssr-client";

export function meta() {
  return [
    { title: "React Router Todo App" },
    { name: "description", content: "Todo List" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const { data: todos, errors } = await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: (contextSpec) => client.models.Todo.list(contextSpec),
  });
  return data(
    {
      todos,
      error: errors?.map((e) => e.message).join(", "),
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { todos } = loaderData;
  return (
    <div className="flex flex-col gap-y-3 my-4 mx-2">
      <h1 className="text-2xl font-bold">Todo List</h1>
      <TodoList items={todos} />
      <Link to="/new">
        <button
          type="button"
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Add Todo
        </button>
      </Link>
    </div>
  );
}
