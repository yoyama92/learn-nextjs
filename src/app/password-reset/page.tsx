import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageWrapper } from "@/components/_common/page";
import { PasswordResetForm } from "@/components/auth/password-reset";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Password Reset - Next.js Sample App",
};

export default function Page() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}

const AsyncPage = async () => {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }
  return <PasswordResetForm />;
};
