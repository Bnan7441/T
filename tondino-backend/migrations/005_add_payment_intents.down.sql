-- Rollback migration: Remove payment_intents table and payment_intent_id from user_courses

-- Drop indexes
DROP INDEX IF EXISTS idx_user_courses_payment_intent_id;
DROP INDEX IF EXISTS idx_payment_intents_created_at;
DROP INDEX IF EXISTS idx_payment_intents_status;
DROP INDEX IF EXISTS idx_payment_intents_course_id;
DROP INDEX IF EXISTS idx_payment_intents_user_id;

-- Remove payment_intent_id column from user_courses
ALTER TABLE user_courses DROP COLUMN IF EXISTS payment_intent_id;

-- Drop payment_intents table
DROP TABLE IF EXISTS payment_intents;
