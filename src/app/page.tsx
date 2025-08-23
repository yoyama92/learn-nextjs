import { redirect } from "next/navigation";

import { PageWrapper } from "../components/_common/page";
import { auth } from "../lib/auth";

export default function Home() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}

const AsyncPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  redirect(session.user.role === "admin" ? "/admin" : "/account");
};
