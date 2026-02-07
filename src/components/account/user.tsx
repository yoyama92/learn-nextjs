"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";

import { postUser } from "../../actions/user";
import {
  type UserSchema,
  userSchema,
  userSchemaKeys,
} from "../../schemas/user";

/**
 * 自身のユーザー情報表示・編集コンポーネント
 */
export const UserInfo = ({
  user,
}: {
  user: { name: string; email: string; isAdmin: boolean };
}) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSubmit: SubmitHandler<UserSchema> = async (data) => {
    try {
      const result = await postUser(data);
      if (result?.status) {
        reset({ name: data.name });
        window.alert(`更新しました\n${JSON.stringify(result, null, 2)}`);
      } else {
        window.alert("更新に失敗しました");
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`更新に失敗しました: ${error.message}`);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
        <h2 className="text-lg font-bold">ユーザー情報</h2>
        <div className="flex flex-col ">
          <span>メールアドレス:{user.email}</span>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">名前</legend>
            <input
              className={`input ${errors.name ? "input-error" : ""}`}
              type="text"
              placeholder="名前を入力"
              {...register(userSchemaKeys.name)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-error text-xs">{errors.name.message}</p>
            )}
          </fieldset>
          <div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-md">
                  更新中
                </span>
              ) : (
                "更新"
              )}
            </button>
          </div>
          <Link href="/account/password" className="link link-primary w-fit">
            パスワードを変更する
          </Link>
        </form>
      </div>
      {user.isAdmin && (
        <Link href="/admin" className="link link-hover mt-4 text-sm">
          管理者ページへ移動
        </Link>
      )}
    </>
  );
};
