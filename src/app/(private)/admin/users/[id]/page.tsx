import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageWrapper } from "../../../../../components/_common/page";
import { UserInfo } from "../../../../../components/admin/user";
import { verifySession } from "../../../../../lib/session";
import { z } from "../../../../../lib/zod";
import { getUser } from "../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "User Page - Next.js Sample App",
};

const paramSchema = z.object({
  id: z.string().describe("表示するユーザーID"),
});

type Params = z.infer<typeof paramSchema>;

/**
 * ユーザー詳細ページ
 */
export default function Page({ params }: { params: Promise<Params> }) {
  return (
    <PageWrapper>
      <AsyncPage params={params} />
    </PageWrapper>
  );
}

const AsyncPage = async ({ params }: { params: Promise<Params> }) => {
  await verifySession({
    adminOnly: true,
  });

  const { id } = await params;
  const userInfo = await getUser(id);
  if (!userInfo) {
    notFound();
  }

  return (
    <UserInfo
      user={{
        name: userInfo.name,
        email: userInfo.email,
        isAdmin: userInfo.role === "admin",
      }}
    />
  );
};
