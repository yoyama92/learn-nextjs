import type { Metadata } from "next";

import { PageWrapper } from "../../../../components/_common/page";
import { PasswordChangeForm } from "../../../../components/auth/password-change";
import { verifySession } from "../../../../lib/session";

export const metadata: Metadata = {
  title: "Change Password - Next.js Sample App",
};

export default function Page() {
  return (
    <PageWrapper>
      <AsyncPage />
    </PageWrapper>
  );
}
const AsyncPage = async () => {
  const { user } = await verifySession();

  return (
    <PasswordChangeForm
      user={{
        email: user.email,
      }}
    />
  );
};
