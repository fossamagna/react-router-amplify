import type { Route } from "./+types/about";

export function meta() {
  return [{ title: "About - Prerender + Amplify Hosting example" }];
}

export function loader() {
  return { prerenderedAt: new Date().toISOString() };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>About</h1>
      <p>This page was prerendered at build time: {loaderData.prerenderedAt}</p>
    </div>
  );
}
