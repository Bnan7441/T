-- Migration: Add payment_intents table and update user_courses for Stripe integration
-- This migration adds comprehensive payment tracking with Stripe Payment Intents

-- Create payment_intents table
CREATE TABLE IF NOT EXISTS payment_intents (
    id SERIAL PRIMARY KEY,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Add payment_intent_id column to user_courses if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_courses' AND column_name = 'payment_intent_id'
    ) THEN
        ALTER TABLE user_courses 
        ADD COLUMN payment_intent_id VARCHAR(255);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_course_id ON payment_intents(course_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);
CREATE INDEX IF NOT EXISTS idx_user_courses_payment_intent_id ON user_courses(payment_intent_id);

-- Add comment for documentation
COMMENT ON TABLE payment_intents IS 'Tracks Stripe Payment Intents for course purchases';
COMMENT ON COLUMN payment_intents.payment_intent_id IS 'Stripe Payment Intent ID (pi_xxx)';
COMMENT ON COLUMN payment_intents.status IS 'Payment status: requires_payment_method, requires_confirmation, requires_action, processing, succeeded, canceled';
