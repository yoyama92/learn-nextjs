/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `activity_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `login_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "main"."activity_histories" DROP CONSTRAINT "activity_histories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "main"."login_histories" DROP CONSTRAINT "login_histories_id_fkey";

-- DropForeignKey
ALTER TABLE "main"."user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- AlterTable
ALTER TABLE "main"."users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "password",
ADD COLUMN     "ban_expires" TIMESTAMP(3),
ADD COLUMN     "ban_reason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "role" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "main"."activity_histories";

-- DropTable
DROP TABLE "main"."login_histories";

-- DropTable
DROP TABLE "main"."user_roles";

-- CreateTable
CREATE TABLE "main"."session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "impersonated_by" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "main"."session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "main"."session"("token");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "main"."account"("user_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "main"."verification"("identifier");

-- AddForeignKey
ALTER TABLE "main"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
