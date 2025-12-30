import type { Metadata } from "next";
import LoginForm from "@/app/login/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  alternates: { canonical: "/login" },
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; mode?: string }>;
};

export default async function LoginPage ({ searchParams }: Props)
{
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  const forcedMode = sp.mode === "admin" ? "admin" : sp.mode === "customer" ? "customer" : null;
  const inferredMode = callbackUrl?.startsWith("/admin") ? "admin" : "customer";
  const mode = forcedMode ?? inferredMode;
  const defaultCallbackUrl = mode === "admin" ? "/admin" : "/account";

  return <LoginForm defaultCallbackUrl={defaultCallbackUrl} mode={mode} />;
}



