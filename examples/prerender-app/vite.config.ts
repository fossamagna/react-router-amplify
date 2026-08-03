import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { amplifyHosting } from "vite-plugin-react-router-amplify-hosting";

export default defineConfig({
  plugins: [reactRouter(), amplifyHosting({ computeRuntime: "nodejs22.x" })],
});
