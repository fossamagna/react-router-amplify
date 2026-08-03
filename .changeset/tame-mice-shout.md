---
"vite-plugin-react-router-amplify-hosting": patch
---

fix: support `prerender` together with `amplifyHosting()`

Previously, enabling React Router's `prerender` option together with `ssr: true` caused the build to fail with "Server build file not found in manifest", because the plugin's SSR build configuration overwrote React Router's own server-build entry and renamed its output file, both of which React Router's prerendering relies on. Even when the build didn't crash, prerendered pages were copied to the wrong point in the build lifecycle and were missing from `.amplify-hosting/static`.
