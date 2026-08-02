import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { amplifyHosting } from "vite-plugin-react-router-amplify-hosting";

export default defineConfig({
  resolve: {
    // amplify-adapter-react-router and the app must share a single aws-amplify
    // instance: the Amplify server context registry is module-scoped, and a
    // duplicated copy in the SSR bundle breaks server-side auth entirely.
    dedupe: ["aws-amplify"],
  },
  plugins: [tailwindcss(), reactRouter(), amplifyHosting({ expressVersion: "5" }), tsconfigPaths()],
});
