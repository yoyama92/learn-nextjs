"use client";

import { type ChangeEvent, useCallback, useState } from "react";
import type { SubmitHandler, UseFormReset } from "react-hook-form";

import { createProfileImageUploadUrl, postUser } from "../../actions/user";
import type {
  ProfileImageUploadRequestSchema,
  UserSchema,
} from "../../schemas/user";

/**
 * ユーザープロフィール編集フォームの状態を管理するhook
 */
export const useUserProfileForm = ({
  initialImage,
  reset,
}: {
  initialImage?: string | null;
  reset: UseFormReset<UserSchema>;
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    initialImage ?? undefined,
  );

  const handleProfileImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setSelectedFile(file);
    },
    [],
  );

  const onSubmit = useCallback<SubmitHandler<UserSchema>>(
    async (data) => {
      try {
        let image = data.image;
        if (selectedFile) {
          setIsUploading(true);
          const signedUrl = await createProfileImageUploadUrl({
            fileName: selectedFile.name,
            contentType:
              selectedFile.type as ProfileImageUploadRequestSchema["contentType"],
            size: selectedFile.size,
          });

          const uploadResult = await fetch(signedUrl.uploadUrl, {
            method: "PUT",
            body: selectedFile,
            headers: {
              "Content-Type": selectedFile.type,
            },
          });
          if (!uploadResult.ok) {
            throw new Error("画像のアップロードに失敗しました。");
          }
          image = signedUrl.imageUrl;
        }

        const result = await postUser({
          ...data,
          image,
        });

        if (result?.status) {
          reset({ name: data.name, image });
          setCurrentImage(image);
          setSelectedFile(null);
          window.alert(`更新しました\n${JSON.stringify(result, null, 2)}`);
        } else {
          window.alert("更新に失敗しました");
        }
      } catch (error) {
        if (error instanceof Error) {
          window.alert(`更新に失敗しました: ${error.message}`);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [reset, selectedFile],
  );

  return {
    currentImage,
    selectedFile,
    isUploading,
    handleProfileImageChange,
    onSubmit,
  };
};
