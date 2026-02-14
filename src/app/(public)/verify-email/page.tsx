import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { PageWrapper } from "../../../components/_common/page";
import { VerifyEmail } from "../../../components/auth/verify-email";
import { auth } from "../../../lib/auth";

export const metadata: Metadata = {
  title: "Verify Email - Next.js Sample App",
};

/**
 * メールアドレス認証ページ
 */
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  return (
    <PageWrapper>
      <AsyncPage searchParams={searchParams} />
    </PageWrapper>
  );
}

const AsyncPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // ログイン済みの場合はトップページへリダイレクト
  if (session) {
    redirect("/");
  }

  const schema = z.object({
    token: z.string(),
  });
  const parseResult = schema.safeParse(await searchParams);

  return <VerifyEmail token={parseResult.data?.token} />;
};
