import { redirect } from "next/navigation";

import { PageWrapper } from "../../components/_common/page";
import { verifySession } from "../../lib/session";

export default function AdminRoot() {
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

  redirect("/admin/users");
};
