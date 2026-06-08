-- ========================================================
-- VIBE STUDIO - SUPABASE DATABASE INITIALIZATION SCHEMA
-- ========================================================
-- Copy and paste this script directly into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/stlfwwxzawwwlmpbtuex/sql/new

-- 1. Create table for storing Client Orders & Free Previews
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'preview' | 'order'
    email_data JSONB, -- Nullable to allow partial data gracefully
    client_invoice JSONB, -- Nullable since 'preview' type may not contain invoice info
    status TEXT NOT NULL DEFAULT 'to_be_completed', -- 'to_be_completed' | 'in_progress' | 'completed'
    deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: If you already created the tables and are getting "null value in column violates not-null constraint",
-- please execute these statements in your Supabase SQL Editor:
-- ALTER TABLE orders ALTER COLUMN email_data DROP NOT NULL;
-- ALTER TABLE orders ALTER COLUMN client_invoice DROP NOT NULL;

-- 2. Create table for storing Admin Configuration (passwords, trash retention, etc.)
CREATE TABLE IF NOT EXISTS vibe_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
);

-- 3. Seed initial default values for Vibe configuration
INSERT INTO vibe_config (key, value)
VALUES 
    ('trashRetentionDays', '30'::jsonb),
    ('adminPassword', '"1234"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Enable Row Level Security (RLS) on both tables (standard Supabase default)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vibe_config ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive policies for both tables to allow simple anon/authenticated read, insert, update and write access
DROP POLICY IF EXISTS "Allow anon actions on orders" ON orders;
CREATE POLICY "Allow anon actions on orders" ON orders
    FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon actions on config" ON vibe_config;
CREATE POLICY "Allow anon actions on config" ON vibe_config
    FOR ALL
    USING (true)
    WITH CHECK (true);
