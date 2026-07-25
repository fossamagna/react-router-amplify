# amplify-adapter-react-router

## 1.0.0

### Major Changes

- [#322](https://github.com/fossamagna/react-router-amplify/pull/322) [`d4e3f45`](https://github.com/fossamagna/react-router-amplify/commit/d4e3f45a79968f9712f98eb09ec9fda00fcccba4) Thanks [@fossamagna](https://github.com/fossamagna)! - Require Node.js >=22.22.0 and Vite 7+

  Breaking changes:

  - Drop support for Node.js 20. Both packages now require Node.js >=22.22.0 (`engines.node`).
  - Drop support for Vite 5 and 6. `vite-plugin-react-router-amplify-hosting` now requires `vite@^7.0.0 || ^8.0.0` as a peer dependency.
  - Remove `nodejs20.x` from the `ComputeRuntime` type and the `computeRuntime` plugin option. When the app's `engines.node` is missing, invalid, or below 22, the deploy manifest now defaults to `nodejs22.x` (previously `nodejs20.x`).
  - Both packages are now ESM-only: the CommonJS build (`dist/*.cjs`) is no longer published. CommonJS consumers on Node.js >=22.22.0 can still load them via `require()` thanks to `require(esm)` support.

## 0.2.0

### Minor Changes

- [`c41b582`](https://github.com/fossamagna/react-router-amplify/commit/c41b58244bc9b16ae884ab43ba037a93fe7481ad) Thanks [@fossamagna](https://github.com/fossamagna)! - feat: support react-router v7.10.0 stabilized future flags

## 0.1.2

### Patch Changes

- [#92](https://github.com/fossamagna/react-router-amplify/pull/92) [`270a0af`](https://github.com/fossamagna/react-router-amplify/commit/270a0af8f3d38ac89310f3d0f0bea02b349a1413) Thanks [@ikoamu](https://github.com/ikoamu)! - fix: ensure cookie names are encoded for js-cookie compatibility

## 0.1.1

### Patch Changes

- [#60](https://github.com/fossamagna/react-router-amplify/pull/60) [`2abf229`](https://github.com/fossamagna/react-router-amplify/commit/2abf22956263e3abdec198322b37e3a63f031386) Thanks [@fossamagna](https://github.com/fossamagna)! - test: add test for adapter.ts

- [#54](https://github.com/fossamagna/react-router-amplify/pull/54) [`ac3c898`](https://github.com/fossamagna/react-router-amplify/commit/ac3c898ec9adf4615558f561f77013932ae08f30) Thanks [@fossamagna](https://github.com/fossamagna)! - docs: update README.md

## 0.1.0

### Minor Changes

- [#40](https://github.com/fossamagna/react-router-amplify/pull/40) [`15aa872`](https://github.com/fossamagna/react-router-amplify/commit/15aa872b67836e9e7d4e34c2cd4c662f18da6f36) Thanks [@fossamagna](https://github.com/fossamagna)! - feat: add amplify-adapter-react-router pacakge
