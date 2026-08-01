---
"vite-plugin-react-router-amplify-hosting": patch
---

Omit `getLoadContext` from the generated Express server handler. It passed the Express `Response` object as the load context, which React Router v8 rejects at runtime ("You must return an instance of `RouterContextProvider` from your `getLoadContext` function"), causing every request to fail with a 500 error.
