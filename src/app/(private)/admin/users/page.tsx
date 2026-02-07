import { PageWrapper } from "../../../../components/_common/page";
import { UserList } from "../../../../components/admin/user-list";
import { verifySession } from "../../../../lib/session";
import { getUsers } from "../../../../server/services/userService";

/**
 * 管理者用ユーザー一覧ページ
 */
export default function Page() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}

const AsyncPage = async () => {
  await verifySession({
    adminOnly: true,
  });
  const users = await getUsers();
  return (
    <UserList
      users={users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isAdmin: user.role === "admin",
      }))}
    />
  );
};
