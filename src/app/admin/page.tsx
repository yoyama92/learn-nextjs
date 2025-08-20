import { notFound, redirect } from "next/navigation";

import { PageWrapper } from "../../components/_common/page";
import { UserList } from "../../components/admin/user-list";
import { auth } from "../../lib/auth";
import { getUser, getUsers } from "../../server/services/userService";
import { forbidden } from "../../utils/navigation";

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

  const users = await getUsers();
  return (
    <UserList
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isAdmin: user.role?.isAdmin,
      }))}
    />
  );
};
