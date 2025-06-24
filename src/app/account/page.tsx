import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/components/loading";
import { SignOut } from "@/components/sign-out";
import { UserInfo } from "@/components/user";
import { auth } from "@/lib/auth";
import { getUser } from "@/server/services/userService";

export const metadata: Metadata = {
  title: "User Profile - Next.js Sample App",
};

export default function Page() {
  return (
    <Suspense
      fallback={<Loading />}
    >
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
    <div className="flex flex-col gap-4">
      <SignOut />
      <UserInfo
        user={{
          name: userInfo.name,
          email: userInfo.email,
        }}
      />
    </div>
  );
};
