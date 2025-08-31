-- CreateTable
CREATE TABLE "main"."activity_histories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "main"."login_histories" (
    "id" UUID NOT NULL,
    "as_admin" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "login_histories_id_key" ON "main"."login_histories"("id");

-- AddForeignKey
ALTER TABLE "main"."activity_histories" ADD CONSTRAINT "activity_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "main"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "main"."login_histories" ADD CONSTRAINT "login_histories_id_fkey" FOREIGN KEY ("id") REFERENCES "main"."activity_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
