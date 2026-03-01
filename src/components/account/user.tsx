"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useUserProfileForm } from "../../hooks/account/use-user-profile-form";
import {
  profileImageAllowedContentTypes,
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
  user: {
    name: string;
    email: string;
    isAdmin: boolean;
    image?: string | null;
  };
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
      image: user.image ?? undefined,
    },
  });

  const {
    currentImage,
    selectedFile,
    isUploading,
    handleProfileImageChange,
    onSubmit,
  } = useUserProfileForm({
    initialImage: user.image,
    reset,
  });

  return (
    <>
      <div className="flex flex-col gap-4 p-4 bg-base-100 border-base-300 rounded-box">
        <h2 className="text-lg font-bold">ユーザー情報</h2>
        <div className="flex flex-col ">
          <span>メールアドレス:{user.email}</span>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">プロフィール画像</legend>
            <div className="flex flex-col gap-2">
              <div className="avatar">
                <div className="w-20 rounded-full border border-base-300">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt="現在のプロフィール画像"
                      width={80}
                      height={80}
                      className="w-20 h-20"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-base-200" />
                  )}
                </div>
              </div>
            </div>
            <input
              className="file-input"
              type="file"
              accept={profileImageAllowedContentTypes.join(",")}
              onChange={handleProfileImageChange}
              disabled={isSubmitting || isUploading}
            />
            <p className="text-xs">JPEG / PNG / WebP、最大5MB</p>
          </fieldset>
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
              disabled={
                (!isDirty && !selectedFile) || isSubmitting || isUploading
              }
            >
              {isSubmitting || isUploading ? (
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
