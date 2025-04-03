import { TodoListItem, type TodoListItemProps } from "./TodoListItem";

export type TodoListProps = {
  items: TodoListItemProps["item"][];
};

export function TodoList({ items }: TodoListProps) {
  if (items.length === 0) {
    return <p>No items</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 border-1 border-gray-200 rounded-xl">
      {items.map((item) => (
        <TodoListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
