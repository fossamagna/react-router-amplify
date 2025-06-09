---
"vite-plugin-react-router-amplify-hosting": patch
---

fix: Resolve SSR build failure related to [fossamagna/react-router-amplify#93](https://github.com/fossamagna/react-router-amplify/issues/93).

- Revised the asset copy behavior during SSR build.
- Fixed handling of the `unstable_viteEnvironmentApi` flag in `@react-router/dev`.
