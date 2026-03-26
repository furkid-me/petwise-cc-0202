-- CreateExpenseRecord
CREATE TABLE IF NOT EXISTS "expense_records" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "user_id" UUID NOT NULL,
    "pet_id" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(8, 2) NOT NULL,
    "notes" TEXT,
    CONSTRAINT "expense_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "expense_records_pet_id_record_date_idx" ON "expense_records"("pet_id", "record_date");

-- AddForeignKey
ALTER TABLE "expense_records" ADD CONSTRAINT "expense_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_records" ADD CONSTRAINT "expense_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
