"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ForbiddenError, UnauthorizedError } from "../../utils/error";
import { SignOutButton } from "../auth/sign-out";

/**
 * 404 Forbidden ページ
 */
export const Forbidden = () => {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="text-lg font-bold text-red-500">403 Forbidden</h2>
      <p>アクセス権限がありません。</p>
      <div className="flex flex-row gap-2">
        <div>
          <Link href="/" className="btn btn-outline">
            ホームに戻る
          </Link>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
};

export const ErrorPage = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  const router = useRouter();

  useEffect(() => {
    if (error.message === UnauthorizedError.MESSAGE) {
      router.replace("/sign-in");
    }
  }, [error, router]);

  if (error.message === ForbiddenError.MESSAGE) {
    return <Forbidden />;
  }

  return (
    error.message !== UnauthorizedError.MESSAGE && (
      <div className="max-sm:p-4 p-6 flex flex-col gap-4">
        <h2>原因不明のエラーが発生しました。</h2>
        <button type="button" onClick={() => reset()}>
          再読み込み
        </button>
      </div>
    )
  );
};
