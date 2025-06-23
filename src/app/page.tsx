import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/components/loading";
import { auth } from "@/lib/auth";

export default function Home() {
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
  if (!session?.user) {
    redirect("/sign-in");
  }

  redirect(`/users/${session?.user?.id}`);
};
