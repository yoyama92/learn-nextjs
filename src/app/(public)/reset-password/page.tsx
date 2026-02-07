import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

import { PageWrapper } from "../../../components/_common/page";
import { ResetPasswordForm } from "../../../components/auth/reset-password";
import { auth } from "../../../lib/auth";

export const metadata: Metadata = {
  title: "Password Reset - Next.js Sample App",
};

/**
 * パスワードリセットページ
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
    token: z.string().optional(),
  });
  const parseResult = schema.safeParse(await searchParams);

  return <ResetPasswordForm token={parseResult.data?.token} />;
};
