import { notFound, redirect } from "next/navigation";

import { PageWrapper } from "../../../../components/_common/page";
import { NewUserForm } from "../../../../components/admin/new-user-form";
import { auth } from "../../../../lib/auth";
import { getUser } from "../../../../server/services/userService";
import { forbidden } from "../../../../utils/navigation";

export default function AdminPage() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}

const AsyncPage = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userInfo = await getUser(session.user.id);
  if (!userInfo) {
    notFound();
  }

  if (!userInfo.role?.isAdmin) {
    forbidden();
  }

  return <NewUserForm />;
};
