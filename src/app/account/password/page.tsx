import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageWrapper } from "@/components/_common/page";
import { PasswordChangeForm } from "@/components/auth/password-change";
import { auth } from "@/lib/auth";
import { getUser } from "@/server/services/userService";

export const metadata: Metadata = {
  title: "Change Password - Next.js Sample App",
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
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userInfo = await getUser(session.user.id);
  if (!userInfo) {
    notFound();
  }

  return (
    <PasswordChangeForm
      user={{
        email: userInfo.email,
      }}
    />
  );
};
