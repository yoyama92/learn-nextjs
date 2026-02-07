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

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <PageWrapper>
      <AsyncPage params={params} />
    </PageWrapper>
  );
}

const AsyncPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const schema = z.object({
    id: z.string(),
  });
  const parseResult = schema.safeParse(await params);
  if (!parseResult.success) {
    notFound();
  }

  await verifySession({
    adminOnly: true,
  });
  const { id } = parseResult.data;

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
