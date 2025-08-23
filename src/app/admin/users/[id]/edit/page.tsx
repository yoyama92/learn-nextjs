import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageWrapper } from "../../../../../components/_common/page";
import { EditUserForm } from "../../../../../components/admin/edit-user-form";
import { auth } from "../../../../../lib/auth";
import { z } from "../../../../../lib/zod";
import { getUser } from "../../../../../server/services/userService";
import { forbidden } from "../../../../../utils/navigation";

export const metadata: Metadata = {
  title: "User Edit Page - Next.js Sample App",
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
    id: z.uuid(),
  });
  const parseResult = schema.safeParse(await params);
  if (!parseResult.success) {
    notFound();
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const authedUserInfo = await getUser(session.user.id);
  if (!authedUserInfo) {
    notFound();
  }

  if (!authedUserInfo.role?.isAdmin) {
    forbidden();
  }

  const { id } = parseResult.data;

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
        isAdmin: userInfo.role?.isAdmin,
      }}
    />
  );
};
