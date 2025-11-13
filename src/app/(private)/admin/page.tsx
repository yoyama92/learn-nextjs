import { PageWrapper } from "../../../components/_common/page";
import { verifySession } from "../../../lib/session";

export default function AdminPage() {
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

  return <h2 className="text-lg font-bold">管理者ページ</h2>;
};
