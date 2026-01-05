import type { Metadata } from "next";
import { Suspense } from "react";

import RegisterForm from "@/app/register/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  alternates: { canonical: "/register" },
};

export default function RegisterPage ()
{
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}



