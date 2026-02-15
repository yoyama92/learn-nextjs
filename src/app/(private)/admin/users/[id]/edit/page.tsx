import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../../components/_common/page";
import { EditUserForm } from "../../../../../../components/admin/edit-user-form";
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
export default definePrivatePage<Params>({
  adminOnly: true,
  name: "admin_edit_user",
}).page(async ({ props: { params } }) => {
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
});
