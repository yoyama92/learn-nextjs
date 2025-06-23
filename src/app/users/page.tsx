import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  redirect(`/users/${session?.user?.id}`);
}
