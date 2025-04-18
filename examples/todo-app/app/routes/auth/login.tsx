import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser } from "aws-amplify/auth";
import { redirect } from "react-router";
import type { Route } from "./+types/login";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Login - Todo App" },
    { name: "description", content: "Login to Todo App" },
  ];
}

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  try {
    const user = await getCurrentUser();
    if (user) {
      return redirect("/");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // ignore error - user not logged in
  }
  return {};
}

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Authenticator />
      </div>
    </div>
  );
}
