import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { SignOut } from "@/components/sign-out";
import { UserInfo } from "@/components/user";
import { auth } from "@/lib/auth";
import { getUser } from "@/server/services/userService";

export const metadata: Metadata = {
  title: "User Profile - Next.js Sample App",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { id } = await params;

  if (session?.user?.id !== id) {
    redirect(`/users/${session?.user?.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <SignOut />
      <Suspense fallback={<div>Loading...</div>}>
        <AsyncUserInfo user={{ id: session.user.id }} />
      </Suspense>
    </div>
  );
}

const AsyncUserInfo = async (
  { user }: { user: { id: string } },
) => {
  const userInfo = await getUser(user.id);
  if (!userInfo) {
    notFound();
  }
  return (
    <UserInfo
      user={{
        name: userInfo.name,
        email: userInfo.email,
      }}
    />
  );
};
