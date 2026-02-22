"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { postNewUser } from "../../../actions/admin";
import { type CreateUserSchema, createUserSchema } from "../../../schemas/admin";
import { UserForm } from "./user-form";

export const NewUserForm = () => {
  const router = useRouter();
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit: SubmitHandler<CreateUserSchema> = async (data) => {
    try {
      const result = await postNewUser(data);
      if (result?.mailSent) {
        window.alert("新規追加に成功しました");
      } else {
        window.alert(
          `新規追加に成功しましたがメール送信に失敗しました。:${data.email}`,
        );
      }
      router.push("/admin/users");
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`作成に失敗しました。: ${error.message}`);
      }
    }
  };

  return <UserForm title="ユーザー登録" form={form} onSubmit={onSubmit} />;
};
