import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn } from "../../../actions/auth";
import { PageWrapper } from "../../../components/_common/page";
import { SignIn } from "../../../components/auth/sign-in";
import { auth } from "../../../lib/auth";

export const metadata: Metadata = {
  title: "ユーザーログイン - Next.js Sample App",
};

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
  if (session?.user) {
    redirect("/");
  }
  return (
    <SignIn
      title="ログイン"
      buttonLabel="ログインする"
      signIn={signIn}
      footer={
        <a href="/reset-password" className="link link-primary mt-2">
          パスワードを忘れた場合
        </a>
      }
    />
  );
};
