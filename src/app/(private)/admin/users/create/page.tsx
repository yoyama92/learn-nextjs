import { PageWrapper } from "../../../../../components/_common/page";
import { NewUserForm } from "../../../../../components/admin/new-user-form";
import { verifySession } from "../../../../../lib/session";

/**
 * ユーザー新規作成ページ
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

  return <NewUserForm />;
};
