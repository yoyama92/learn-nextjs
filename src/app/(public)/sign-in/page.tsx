import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageWrapper } from "../../../components/_common/page";
import { SignIn } from "../../../components/auth/sign-in";
import { auth } from "../../../lib/auth";

export const metadata: Metadata = {
  title: "ユーザーログイン - Next.js Sample App",
};

/**
 * ログインページ
 */
export default function Page() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}

const AsyncPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ログイン済みの場合はトップページへリダイレクト
  if (session) {
    redirect("/");
  }
  return <SignIn />;
};
