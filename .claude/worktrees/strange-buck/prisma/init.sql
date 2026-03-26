-- ============================================
-- PetWise 資料庫初始化 SQL
-- 請在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- 建立列舉型別
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');
CREATE TYPE "FamilyRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE "PetSpecies" AS ENUM ('DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER');
CREATE TYPE "PetGender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');
CREATE TYPE "DiaryCategory" AS ENUM ('FOOD', 'HEALTH', 'ACTIVITY', 'MEDICAL', 'GROOMING', 'BEHAVIOR', 'OTHER');
CREATE TYPE "ReminderCategory" AS ENUM ('VACCINE', 'DEWORMING', 'GROOMING', 'CHECKUP', 'MEDICATION', 'FOOD', 'OTHER');
CREATE TYPE "RepeatType" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- ==================== 用戶 ====================
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "line_user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "picture_url" TEXT,
    "status_message" TEXT,
    "email" TEXT,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Taipei',
    "language" TEXT NOT NULL DEFAULT 'zh-TW',
    "notify_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_line_user_id_key" ON "users"("line_user_id");

-- ==================== 家庭成員 ====================
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "member_line_user_id" TEXT NOT NULL,
    "member_name" TEXT NOT NULL,
    "role" "FamilyRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "family_members_user_id_member_line_user_id_key" ON "family_members"("user_id", "member_line_user_id");

-- ==================== 寵物 ====================
CREATE TABLE "pets" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" "PetSpecies" NOT NULL,
    "breed" TEXT,
    "gender" "PetGender",
    "birthday" TIMESTAMP(3),
    "adoption_date" TIMESTAMP(3),
    "color" TEXT,
    "weight" DECIMAL(5,2),
    "photo_url" TEXT,
    "is_neutered" BOOLEAN NOT NULL DEFAULT false,
    "microchip_id" TEXT,
    "medical_notes" TEXT,
    "allergies" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- ==================== 體重記錄 ====================
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "pet_id" TEXT NOT NULL,
    "weight" DECIMAL(5,2) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- ==================== 日記 ====================
CREATE TABLE "diaries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "raw_input" TEXT,
    "category" "DiaryCategory" NOT NULL,
    "sub_category" TEXT,
    "content" TEXT NOT NULL,
    "details" JSONB,
    "mood" INTEGER,
    "severity" INTEGER,
    "photos" TEXT[],
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_important" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "diaries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "diaries_user_id_pet_id_occurred_at_idx" ON "diaries"("user_id", "pet_id", "occurred_at");
CREATE INDEX "diaries_category_idx" ON "diaries"("category");

-- ==================== 標籤 ====================
CREATE TABLE "tags" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

CREATE TABLE "diary_tags" (
    "diary_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "diary_tags_pkey" PRIMARY KEY ("diary_id","tag_id")
);

-- ==================== 提醒 ====================
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "ReminderCategory" NOT NULL,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "repeat_type" "RepeatType" NOT NULL DEFAULT 'NONE',
    "repeat_interval" INTEGER,
    "repeat_end_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "notify_sent" BOOLEAN NOT NULL DEFAULT false,
    "notify_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reminders_user_id_remind_at_idx" ON "reminders"("user_id", "remind_at");
CREATE INDEX "reminders_is_active_remind_at_idx" ON "reminders"("is_active", "remind_at");

-- ==================== 付款 ====================
CREATE TABLE "payments" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "plan" "SubscriptionPlan" NOT NULL,
    "payment_method" TEXT NOT NULL,
    "transaction_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- ==================== AI 解析日誌 ====================
CREATE TABLE "ai_parse_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "raw_input" TEXT NOT NULL,
    "parsed_output" JSONB NOT NULL,
    "was_accepted" BOOLEAN,
    "user_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_parse_logs_pkey" PRIMARY KEY ("id")
);

-- ==================== 系統設定 ====================
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- ==================== 外鍵約束 ====================
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pets" ADD CONSTRAINT "pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diaries" ADD CONSTRAINT "diaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "diary_tags" ADD CONSTRAINT "diary_tags_diary_id_fkey" FOREIGN KEY ("diary_id") REFERENCES "diaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diary_tags" ADD CONSTRAINT "diary_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ==================== 自動更新 updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON "pets" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_diaries_updated_at BEFORE UPDATE ON "diaries" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON "reminders" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON "system_settings" FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- ✅ 完成！所有資料表和索引已建立
SELECT 'PetWise 資料庫初始化完成！' as result;
