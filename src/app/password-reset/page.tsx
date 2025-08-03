import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasswordResetForm } from "@/components/auth/password-reset";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Password Reset - Next.js Sample App",
};

export default async function Page() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return (
    <div className="flex justify-center items-center min-h-screen">
      <PasswordResetForm />
    </div>
  );
}
