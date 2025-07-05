import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/components/loading";
import { PasswordChangeForm } from "@/components/password-change";
import { auth } from "@/lib/auth";
import { getUser } from "@/server/services/userService";

export const metadata: Metadata = {
  title: "Change Password - Next.js Sample App",
};

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncPage />
    </Suspense>
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
    <div className="flex justify-center items-center flex-1">
      <PasswordChangeForm
        user={{
          email: userInfo.email,
        }}
      />
    </div>
  );
};
