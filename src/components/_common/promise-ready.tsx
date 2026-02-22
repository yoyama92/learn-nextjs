"use client";

import { use, useEffect } from "react";

/**
 * Suspense配下でPromise解決完了を親へ通知するための補助コンポーネント。
 * 受け取ったPromiseの状態を読むだけで、新しい非同期処理は開始しない。
 * @param props.promise 解決状態を監視するPromise。
 * @param props.onReady Promise解決後に1回以上呼ばれるコールバック。
 */
export const PromiseReady = <T,>({
  promise,
  onReady,
}: {
  promise: Promise<T>;
  onReady: () => void;
}) => {
  use(promise);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
};
