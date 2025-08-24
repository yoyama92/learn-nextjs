import { PageWrapper } from "../../../../components/_common/page";
import { NewUserForm } from "../../../../components/admin/new-user-form";
import { verifySession } from "../../../../lib/session";

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

  return <NewUserForm />;
};
