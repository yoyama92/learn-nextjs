import { APIError } from "better-auth";
import { headers } from "next/headers";

import { auth } from "../../lib/auth";

export const VerifyEmail = async ({ token }: { token?: string }) => {
  if (!token) {
    return (
      <VerifyEmailError message=" 認証リンクが正しくありません。再度ログインして認証メールを再送してください。" />
    );
  }

  try {
    const result = await auth.api.verifyEmail({
      query: {
        token: token,
      },
      headers: await headers(),
    });

    if (result?.status) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
            <h2 className="card-title justify-center mb-2">
              メールアドレス認証
            </h2>
            <p className="text-sm">認証が完了しました。</p>
            <a href="/sign-in" className="link link-primary mt-2">
              ログインページへ移動
            </a>
          </div>
        </div>
      );
    }
    return (
      <VerifyEmailError message="メールアドレスの認証に失敗しました。時間をおいて再度お試しください。" />
    );
  } catch (error) {
    if (error instanceof APIError) {
      return (
        <VerifyEmailError message="認証リンクが無効です。認証メールを再送してください。" />
      );
    } else {
      return <VerifyEmailError message="システムエラーが発生しました。" />;
    }
  }
};

const VerifyEmailError = ({ message }: { message: string }) => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="fieldset bg-base-100 border-base-300 rounded-box w-sm border p-4">
        <h2 className="card-title justify-center mb-2">
          メールアドレス認証エラー
        </h2>
        <p className="text-error text-sm">{message}</p>
        <a href="/sign-in" className="link link-primary mt-2">
          ログインページに戻る
        </a>
      </div>
    </div>
  );
};
