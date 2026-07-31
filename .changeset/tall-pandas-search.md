---
"vite-plugin-react-router-amplify-hosting": minor
---

Support React Router v8. The `future.v8_viteEnvironmentApi` flag was removed in React Router v8 because the Vite Environment API is always enabled, which prevented the plugin from generating `deploy-manifest.json` and `server.mjs`. The plugin now treats a missing flag as enabled.
