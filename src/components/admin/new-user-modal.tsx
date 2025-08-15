"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  type ForwardedRef,
  type HTMLInputTypeAttribute,
  type RefObject,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import {
  type SubmitHandler,
  type UseFormRegisterReturn,
  useForm,
} from "react-hook-form";

import { postNewUser } from "../../actions/admin";
import {
  type CreateUserSchema,
  createUserSchema,
  createUserSchemaKeys,
} from "../../schemas/admin";

const useFormIds = (): Record<keyof CreateUserSchema, string> => {
  const userNameId = useId();
  const emailId = useId();
  const isAdminId = useId();
  return {
    name: userNameId,
    email: emailId,
    isAdmin: isAdminId,
  };
};

const TextInput = ({
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
  register: UseFormRegisterReturn<keyof CreateUserSchema>;
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

/**
 * ダイアログを操作するためのカスタムフック
 * @param param.onClose ダイアログが閉じたときに呼び出す関数
 */
const useDialog = ({
  onClose,
}: {
  onClose: () => void;
}): RefObject<HTMLDialogElement | null> => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleClose = () => {
      onClose();
    };
    if (dialogRef.current) {
      dialogRef.current.addEventListener("close", handleClose);
    }

    return () => {
      if (dialogRef.current) {
        dialogRef.current.removeEventListener("close", handleClose);
      }
    };
  }, [onClose]);

  return dialogRef;
};

const NewUserForm = ({
  done,
  onClose,
  ref,
}: {
  done: () => void;
  onClose: () => void;
  ref: ForwardedRef<{
    reset: () => void;
  }>;
}) => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema),
  });

  // 外部に公開するメソッド
  // ダイアログを閉じたときに値を初期化したいので、リセット関数を呼び出し元から実行できるようにする。
  useImperativeHandle(ref, () => ({
    reset: () => {
      reset();
    },
  }));

  const onSubmit: SubmitHandler<CreateUserSchema> = async (data) => {
    try {
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
      done();
    } catch (error) {
      if (error instanceof Error) {
        window.alert(`Error creating user: ${error.message}`);
      }
    }
  };

  const formIds = useFormIds();
  return (
    <form className="modal-box" onSubmit={handleSubmit(onSubmit)}>
      <h3 className="font-bold text-lg">Create New User</h3>
      <TextInput
        label="名前"
        id={formIds.name}
        errors={errors.name?.message}
        register={register(createUserSchemaKeys.name)}
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
          onClick={() => {
            onClose();
          }}
        >
          閉じる
        </button>
      </div>
    </form>
  );
};

export const NewUserModal = () => {
  const formRef = useRef<{ reset: () => void }>(null);
  const dialogRef = useDialog({
    onClose: () => {
      formRef.current?.reset();
    },
  });
  const router = useRouter();

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
        <NewUserForm
          ref={formRef}
          done={() => {
            router.refresh();
            dialogRef.current?.close();
          }}
          onClose={() => {
            dialogRef.current?.close();
          }}
        />
      </dialog>
    </>
  );
};
