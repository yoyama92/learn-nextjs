-- 列名をスネークケースに修正
ALTER TABLE "main"."user_roles" RENAME COLUMN "userId" TO user_id;

-- RenameForeignKey
ALTER TABLE "main"."user_roles" RENAME CONSTRAINT "user_roles_userId_fkey" TO "user_roles_user_id_fkey";

-- RenameIndex
ALTER INDEX "main"."user_roles_userId_key" RENAME TO "user_roles_user_id_key";
