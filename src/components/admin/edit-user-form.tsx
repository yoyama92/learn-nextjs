"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { postEditUser } from "../../actions/admin";
import {
  type EditUserSchema,
  type UserSchema,
  userSchema,
} from "../../schemas/admin";
import { UserForm } from "./user-form";

export const EditUserForm = ({ user }: { user: EditUserSchema }) => {
  const router = useRouter();
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  });

  const onSubmit: SubmitHandler<UserSchema> = async (data) => {
    try {
      const result = await postEditUser({
        id: user.id,
        ...data,
      });
      if (result === null) {
        window.alert("更新に失敗しました。");
        return;
      }
      if (result?.success) {
        window.alert("更新に成功しました");
      } else {
        window.alert("更新に失敗しました。");
      }
      router.push("/admin/users");
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`更新に失敗しました。: ${error.message}`);
      }
    }
  };

  return <UserForm title="ユーザー更新" form={form} onSubmit={onSubmit} />;
};
