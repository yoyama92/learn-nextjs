import { PageWrapper } from "../../../../components/_common/page";
import { UserListWithPagination } from "../../../../components/admin/user-list";
import { verifySession } from "../../../../lib/session";
import { getUsersPaginated } from "../../../../server/services/userService";

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
  const data = await getUsersPaginated(1);
  return <UserListWithPagination initialData={data} />;
};
