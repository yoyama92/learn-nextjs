import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/components/loading";
import { auth } from "@/lib/auth";
import { getUser } from "@/server/services/userService";
import { forbidden } from "@/utils/error";

export default function AdminPage() {
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

  if (!userInfo.role?.isAdmin) {
    forbidden();
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">Welcome, {userInfo.name}!</p>
      <p className="mt-2">You have administrative privileges.</p>
    </div>
  );
};
