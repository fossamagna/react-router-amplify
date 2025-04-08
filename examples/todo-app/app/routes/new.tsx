import { data, Form, redirect } from "react-router";
import type { Route } from "./+types/new";
import { runWithAmplifyServerContext } from "~/lib/amplifyServerUtils";
import { client } from "~/lib/amplify-ssr-client";

export function meta() {
  return [
    { title: "React Router Todo App" },
    { name: "description", content: "Add New Todo" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const content = formData.get("content");
  const isDone = formData.get("isDone") === "true";
  if (typeof content !== "string") {
    throw new Error("Invalid content");
  }
  const responseHeaders = new Headers();
  await runWithAmplifyServerContext({
    serverContext: { request, responseHeaders },
    operation: (contextSpec) =>
      client.models.Todo.create(contextSpec, {
        content,
        isDone,
      }),
  });
  return redirect("/", {
    headers: responseHeaders,
  });
}

export default function NewTodo() {
  return (
    <div className="flex flex-col gap-y-3 my-4 mx-2">
      <h1 className="text-2xl font-bold">New Todo</h1>
      <Form method="post">
        <textarea
          name="content"
          placeholder="Content"
          className="w-full h-32 p-2 border border-gray-300 rounded"
          required
        />
        <div className="flex items-center mb-4">
          <input
            name="isDone"
            type="checkbox"
            value="true"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="default-checkbox" className="ms-2 font-medium">
            Done
          </label>
        </div>
        <button
          type="submit"
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Create
        </button>
      </Form>
    </div>
  );
}
