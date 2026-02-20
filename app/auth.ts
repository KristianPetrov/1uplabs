import "server-only";

import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/app/db";
import { users } from "@/app/db/schema";

// NextAuth warns if it can't determine the canonical site URL.
// Prefer an explicit `NEXTAUTH_URL`, but fall back to `NEXT_PUBLIC_SITE_URL`,
// and in development default to localhost to keep DX clean.
if (!process.env.NEXTAUTH_URL && process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_SITE_URL;
}
if (process.env.NODE_ENV !== "production" && !process.env.NEXTAUTH_URL) {
  const port = process.env.PORT ?? "3000";
  process.env.NEXTAUTH_URL = `http://localhost:${port}`;
}

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize (credentials)
      {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const password = parsed.data.password;

        const rows = await db
          .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            role: users.role,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        const user = rows[0];
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt ({ token, user })
    {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session ({ session, token })
    {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

// Convenience export for server components / server actions.
export const nextAuthHandler = NextAuth(authOptions);
