"use client";

import { useActionState, useCallback } from "react";
import { sendVerificationEmail, signIn } from "../../actions/auth";

const initialState = {
  error: "",
  formData: new FormData(),
};

export const useSignIn = () => {
  const handleSubmit = useCallback(async (...arg: [unknown, FormData]) => {
    const result = await signIn(...arg);
    if (result.status === "FORBIDDEN") {
      const confirmed = window.confirm(
        "メールアドレスが認証されていません。認証メールを送信しますか？",
      );
      if (confirmed) {
        const sendEmailResult = await sendVerificationEmail(...arg);
        if (sendEmailResult.success) {
          window.alert(
            "認証メールを送信しました。メール内のリンクをクリックすると、アカウントが有効化されます。",
          );
        } else {
          window.alert("認証メールの送信に失敗しました。");
        }
        return {
          formData: result.formData,
        };
      }
    }
    return {
      error: result.error,
      formData: result.formData,
    };
  }, []);
  return useActionState(handleSubmit, initialState);
};
