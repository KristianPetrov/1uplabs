import type { Metadata } from "next";

import RegisterForm from "@/app/register/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  alternates: { canonical: "/register" },
};

export default function RegisterPage ()
{
  return <RegisterForm />;
}



