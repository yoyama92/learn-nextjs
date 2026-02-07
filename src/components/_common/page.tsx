import { Suspense } from "react";

import { Loading } from "./loading";

/**
 * ページ読み込み中にローディングを表示するためのラッパーコンポーネント
 */
export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
};
