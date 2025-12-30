"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function withCallback (href: string, callbackUrl: string): string
{
  const u = new URL(href, "http://local");
  u.searchParams.set("callbackUrl", callbackUrl);
  return `${u.pathname}${u.search ? u.search : ""}`;
}

export default function AuthNav ()
{
  const { data: session, status } = useSession();

  if (status === "loading")
  {
    return (
      <div className="h-9 w-[148px] animate-pulse rounded-full border border-white/10 bg-white/5" />
    );
  }

  if (!session?.user)
  {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={withCallback("/login", "/account")}
          className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8 neon-edge"
        >
          Log in
        </Link>
        <Link
          href={withCallback("/register", "/account")}
          className="inline-flex h-9 items-center justify-center rounded-full bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400 neon-edge"
        >
          Create account
        </Link>
      </div>
    );
  }

  const isAdmin = (session.user as any).role === "admin";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={isAdmin ? "/admin" : "/account"}
        className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-emerald-500/30 hover:bg-white/8 neon-edge"
      >
        {isAdmin ? "Admin" : "Account"}
      </Link>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/" })}
        className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:border-rose-500/30 hover:bg-white/8 neon-edge"
      >
        Sign out
      </button>
    </div>
  );
}


