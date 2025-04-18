import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("login", "./routes/auth/login.tsx"), // Update login route path
  layout("./routes/protected/layout.tsx", [ // Wrap protected routes
    index("./routes/index.tsx"),
    route("new", "./routes/new.tsx"),
    route(":todoId", "./routes/$todoId/index.tsx"),
    route(":todoId/edit", "./routes/$todoId/edit.tsx"),
  ]),
] satisfies RouteConfig;
