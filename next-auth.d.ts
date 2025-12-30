import "next-auth";
import "next-auth/jwt";

declare module "next-auth"
{
  interface Session
  {
    user: {
      id: string;
      email: string;
      role: "admin" | "customer";
    };
  }

  interface User
  {
    role: "admin" | "customer";
  }
}

declare module "next-auth/jwt"
{
  interface JWT
  {
    uid?: string;
    role?: "admin" | "customer";
  }
}



