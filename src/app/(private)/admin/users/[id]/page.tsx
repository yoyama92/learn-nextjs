import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { definePrivatePage } from "../../../../../components/_common/page";
import { UserInfo } from "../../../../../components/admin/users/user";
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
export default definePrivatePage<Params>({
  adminOnly: true,
  name: "admin_user_detail",
}).page(async ({ props: { params } }) => {
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
});
