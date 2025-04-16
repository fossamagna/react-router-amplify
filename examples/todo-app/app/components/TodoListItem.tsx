import { Link, useFetcher } from "react-router";
import type { Schema } from "../../amplify/data/resource";

export type Todo = Schema["Todo"]["type"];

export type TodoListItemProps = {
  item: Todo;
};

export function TodoListItem({ item }: TodoListItemProps) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  return (
    <li className="flex py-3">
      <div className="flex min-w-0 gap-x-4 px-3">
        <Link to={`/${item.id}/edit`}>
          <span className="text-sm/6 font-semibold text-white-900">
            {item.content}
          </span>
        </Link>
        {item.isDone && <span>☑️</span>}
      </div>
      <fetcher.Form
        method="delete"
        action={`/${item.id}`}
        className="flex flex-1 justify-end"
      >
        <button
          type="submit"
          className="py-1 px-3 mr-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
          disabled={busy}
        >
          x
        </button>
      </fetcher.Form>
    </li>
  );
}
