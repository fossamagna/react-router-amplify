import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/index.tsx"),
  route("new", "./routes/new.tsx"),
  route(":todoId", "./routes/$todoId/index.tsx"),
  route(":todoId/edit", "./routes/$todoId/edit.tsx"),
] satisfies RouteConfig;
