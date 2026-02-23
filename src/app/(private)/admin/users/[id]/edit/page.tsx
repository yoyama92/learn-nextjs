import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../../components/_common/page";
import { EditUserForm } from "../../../../../../components/admin/users/edit-user-form";
import {
  type AdminUserIdParams,
  adminUserIdParamsSchema,
} from "../../../../../../schemas/route-params";
import { getUser } from "../../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "User Edit Page - Next.js Sample App",
};

/**
 * ユーザー情報編集ページ
 */
export default definePrivatePage<AdminUserIdParams>({
  adminOnly: true,
  name: "admin_edit_user",
}).page(async ({ props: { params } }) => {
  const data = adminUserIdParamsSchema.safeParse(await params).data;
  const id = data?.id;
  if (!id) {
    notFound();
  }
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
