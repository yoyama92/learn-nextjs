import { Suspense } from "react";

import { Loading } from "./loading";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};
