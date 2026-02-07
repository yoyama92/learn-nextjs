import { PageWrapper } from "../../../components/_common/page";
import { AdminNavigation } from "../../../components/admin/navigation";
import { verifySession } from "../../../lib/session";

/**
 * 管理者用ページ
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

  return (
    <>
      <h2 className="text-lg font-bold">管理者ページ </h2>
      <AdminNavigation />
    </>
  );
};
