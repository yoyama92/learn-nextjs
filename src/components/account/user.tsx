"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { postUser } from "@/actions/user";
import { type UserSchema, userSchema, userSchemaKeys } from "@/schemas/user";

const useFormIds = (): Record<keyof UserSchema, string> => {
  const userNameId = useId();
  return {
    name: userNameId,
  };
};

export const UserInfo = ({
  user,
}: {
  user: { name: string; email: string };
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
      if (result) {
        reset({ name: result.name });
        window.alert(`更新しました\n${JSON.stringify(result, null, 2)}`);
      } else {
        window.alert("更新に失敗しました");
      }
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`Error updating user: ${error.message}`);
      }
    }
  };

  const formIds = useFormIds();
  return (
    <form
      className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-lg font-bold">ユーザー情報</h2>
      <div className="flex flex-col ">
        <span>Email:{user.email}</span>
      </div>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">名前</legend>
        <input
          id={formIds.name}
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
              Loading...
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
  );
};
