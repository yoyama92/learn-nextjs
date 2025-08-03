"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

import { postNewUser } from "@/actions/admin";
import {
  type CreateUserSchema,
  createUserSchema,
  createUserSchemaKeys,
} from "@/schemas/admin";

export const NewUserModal = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  dialogRef.current?.addEventListener("close", () => {
    reset();
  });

  const onSubmit: SubmitHandler<CreateUserSchema> = async (data) => {
    try {
      // Here you would typically call an API to create the user
      // For example: await createUser(data);
      const result = await postNewUser(data);
      if (result === null) {
        window.alert("User creation failed");
        return;
      }
      if (result?.mailSent) {
        window.alert("User created successfully");
      } else {
        window.alert(`User created, but email sending failed:${data.email}`);
      }
      router.refresh();
      dialogRef.current?.close();
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`Error creating user: ${error.message}`);
      }
    }
  };

  const userNameId = useId();
  const emailId = useId();
  const isAdminId = useId();
  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-primary max-w-fit"
        onClick={() => dialogRef.current?.showModal()}
      >
        Add User
      </button>
      <dialog className="modal" ref={dialogRef}>
        <form className="modal-box" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-bold text-lg">Create New User</h3>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">名前</legend>
            <input
              id={userNameId}
              className={`input ${errors.name ? "input-error" : ""}`}
              type="text"
              placeholder="名前を入力"
              {...register(createUserSchemaKeys.name)}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-error text-xs">{errors.name.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">メールアドレス</legend>
            <input
              id={emailId}
              className={`input ${errors.email ? "input-error" : ""}`}
              type="email"
              placeholder="メールアドレスを入力"
              {...register(createUserSchemaKeys.email)}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-error text-xs">{errors.email.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">管理者フラグ</legend>
            <input
              id={isAdminId}
              className="checkbox"
              type="checkbox"
              {...register(createUserSchemaKeys.isAdmin)}
              disabled={isSubmitting}
            />
            {errors.isAdmin && (
              <p className="text-error text-xs">{errors.isAdmin.message}</p>
            )}
          </fieldset>
          <div className="modal-action flex flex-row gap-1">
            <button className="btn btn-primary" type="submit">
              {isSubmitting ? (
                <span className="loading loading-spinner loading-md">
                  Loading...
                </span>
              ) : (
                "確定"
              )}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              閉じる
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
};
