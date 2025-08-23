/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "main"."user_roles" DROP CONSTRAINT "user_roles_userId_fkey";

-- AlterTable
ALTER TABLE "main"."users" DROP COLUMN "deleted_at";

-- AddForeignKey
ALTER TABLE "main"."user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "main"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
