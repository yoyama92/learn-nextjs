import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../components/_common/page";
import { UserInfo } from "../../../../../components/admin/users/user";
import {
  type AdminUserIdParams,
  adminUserIdParamsSchema,
} from "../../../../../schemas/route-params";
import { getUser } from "../../../../../server/services/userService";

export const metadata: Metadata = {
  title: "User Page - Next.js Sample App",
};

/**
 * ユーザー詳細ページ
 */
export default definePrivatePage<AdminUserIdParams>({
  adminOnly: true,
  name: "admin_user_detail",
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
    <UserInfo
      user={{
        name: userInfo.name,
        email: userInfo.email,
        isAdmin: userInfo.role === "admin",
      }}
    />
  );
});
