import type { Metadata } from "next";

import { PageWrapper } from "../../../components/_common/page";
import { UserInfo } from "../../../components/account/user";
import { verifySession } from "../../../lib/session";

export const metadata: Metadata = {
  title: "User Profile - Next.js Sample App",
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
    <UserInfo
      user={{
        name: user.name,
        email: user.email,
      }}
    />
  );
};
