import type { Route } from "./+types/home";

export function meta() {
  return [{ title: "Prerender + Amplify Hosting example" }];
}

// Because this route has no dynamic/splat params, `prerender: true` in
// `react-router.config.ts` renders it once at build time. This loader runs
// during the build, not per-request, so the timestamp below is baked into
// the static HTML that `amplifyHosting()` copies to `.amplify-hosting/static`.
export function loader() {
  return { prerenderedAt: new Date().toISOString() };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Home</h1>
      <p>This page was prerendered at build time: {loaderData.prerenderedAt}</p>
      <p>
        Reloading won't change the timestamp above, since it's static HTML served from Amplify
        Hosting's static assets, not re-rendered per request.
      </p>
    </div>
  );
}
