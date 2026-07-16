---
"vite-plugin-react-router-amplify-hosting": major
"amplify-adapter-react-router": major
---

Require Node.js >=22.22.0 and Vite 7+

Breaking changes:

- Drop support for Node.js 20. Both packages now require Node.js >=22.22.0 (`engines.node`).
- Drop support for Vite 5 and 6. `vite-plugin-react-router-amplify-hosting` now requires `vite@^7.0.0 || ^8.0.0` as a peer dependency.
- Remove `nodejs20.x` from the `ComputeRuntime` type and the `computeRuntime` plugin option. When the app's `engines.node` is missing, invalid, or below 22, the deploy manifest now defaults to `nodejs22.x` (previously `nodejs20.x`).
- Both packages are now ESM-only: the CommonJS build (`dist/*.cjs`) is no longer published. CommonJS consumers on Node.js >=22.22.0 can still load them via `require()` thanks to `require(esm)` support.
