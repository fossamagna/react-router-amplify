import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  // Statically prerender every route that has no dynamic/splat params, in
  // addition to server-rendering the app. `amplifyHosting()` copies the
  // generated static HTML into `.amplify-hosting/static` so Amplify Hosting
  // can serve those pages directly from its CDN, while routes that aren't
  // prerendered still fall back to the compute (SSR) function.
  prerender: true,
} satisfies Config;
