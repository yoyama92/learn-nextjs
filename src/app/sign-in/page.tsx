import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignIn } from "@/components/auth/sign-in";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In - Next.js Sample App",
};

export default async function Page() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return (
    <div className="flex justify-center items-center min-h-screen">
      <SignIn />
    </div>
  );
}
