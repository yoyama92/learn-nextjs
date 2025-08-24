"use client";

import Link from "next/link";
import { type HTMLInputTypeAttribute, useId } from "react";
import type {
  SubmitHandler,
  UseFormRegisterReturn,
  UseFormReturn,
} from "react-hook-form";

import {
  createUserSchemaKeys,
  type UserSchema,
  userSchemaKeys,
} from "../../schemas/admin";

const useFormIds = (): Record<keyof UserSchema, string> => {
  const userNameId = useId();
  const emailId = useId();
  const isAdminId = useId();
  return {
    name: userNameId,
    email: emailId,
    isAdmin: isAdminId,
  };
};

export const TextInput = ({
  label,
  id,
  errors,
  register,
  placeholder,
  type,
  disabled,
}: {
  label: string;
  id: string;
  errors?: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  disabled?: boolean;
  register: UseFormRegisterReturn<keyof UserSchema>;
}) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input
        id={id}
        className={`input ${errors ? "input-error" : ""}`}
        type={type ?? "text"}
        placeholder={placeholder}
        {...register}
        disabled={disabled}
      />
      {errors && <p className="text-error text-xs">{errors}</p>}
    </fieldset>
  );
};

export const UserForm = ({
  title,
  form,
  onSubmit,
}: {
  title: string;
  form: UseFormReturn<UserSchema>;
  onSubmit: SubmitHandler<UserSchema>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const formIds = useFormIds();
  return (
    <>
      <h2 className="text-lg font-bold">{title}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="card bg-base-100">
          <div className="card-body">
            <div className="card-title">基本情報</div>
            <TextInput
              label="名前"
              id={formIds.name}
              errors={errors.name?.message}
              register={register(userSchemaKeys.name)}
              type="text"
              placeholder="名前を入力"
              disabled={isSubmitting}
            />
            <TextInput
              label="メールアドレス"
              id={formIds.email}
              errors={errors.email?.message}
              register={register(createUserSchemaKeys.email)}
              type="email"
              placeholder="メールアドレスを入力"
              disabled={isSubmitting}
            />
            <fieldset className="fieldset">
              <legend className="fieldset-legend">管理者フラグ</legend>
              <input
                id={formIds.isAdmin}
                className="toggle"
                type="checkbox"
                {...register(createUserSchemaKeys.isAdmin)}
                disabled={isSubmitting}
              />
              {errors.isAdmin && (
                <p className="text-error text-xs">{errors.isAdmin.message}</p>
              )}
            </fieldset>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div></div>
          <div className="flex flex-row gap-2">
            <Link type="button" className="btn btn-outline" href="/admin/users">
              一覧に戻る
            </Link>
            <button className="btn btn-primary" type="submit">
              {isSubmitting ? (
                <span className="loading loading-spinner loading-md">
                  登録中
                </span>
              ) : (
                "確定"
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
