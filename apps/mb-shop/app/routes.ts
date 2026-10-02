import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/butikk.tsx"),
  route("login", "routes/login.tsx"),
  route("orders", "routes/orders.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
