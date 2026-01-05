"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton ()
{
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-rose-500/30 hover:bg-white/8"
    >
      Sign out
    </button>
  );
}






