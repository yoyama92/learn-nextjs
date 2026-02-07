import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageWrapper } from "../../../../../../components/_common/page";
import { EditUserForm } from "../../../../../../components/admin/edit-user-form";
import { verifySession } from "../../../../../../lib/session";
import { z } from "../../../../../../lib/zod";
import { getUser } from "../../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "User Edit Page - Next.js Sample App",
};

const paramSchema = z.object({
  id: z.string().describe("編集するユーザーのID"),
});

type Params = z.infer<typeof paramSchema>;

/**
 * ユーザー情報編集ページ
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
    <EditUserForm
      user={{
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        isAdmin: userInfo.role === "admin",
      }}
    />
  );
};
