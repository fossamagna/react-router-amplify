# Prerender + Amplify Hosting example

A minimal React Router (v8) app that demonstrates using the `prerender`
config option together with `vite-plugin-react-router-amplify-hosting`.

## About this example

`react-router.config.ts` sets `ssr: true` and `prerender: true`, so every
route without dynamic/splat params (`/` and `/about` here) is statically
rendered at build time, in addition to the app being server-rendered for
any other request. `amplifyHosting()` copies the prerendered HTML into
`.amplify-hosting/static`, so Amplify Hosting can serve those pages
directly from its CDN without invoking the compute function, while still
falling back to server-side rendering for routes that aren't prerendered.

## Build

```sh
pnpm install
pnpm --filter react-router-amplify-hosting-example-prerender-app build
```

This produces `.amplify-hosting/static/index.html` and
`.amplify-hosting/static/about/index.html` (the prerendered pages) plus
`.amplify-hosting/compute/default/server.mjs` (the SSR compute function).
