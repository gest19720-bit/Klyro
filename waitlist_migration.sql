-- Run this in Supabase Dashboard → SQL Editor
-- Matches the live waitlist_signups table used by waitlist.html

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    email_normalized TEXT GENERATED ALWAYS AS (lower(trim(email))) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT waitlist_signups_email_format
        CHECK (email_normalized ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

    CONSTRAINT waitlist_signups_email_unique
        UNIQUE (email_normalized)
);

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.waitlist_signups FROM anon, authenticated;
GRANT INSERT ON TABLE public.waitlist_signups TO anon, authenticated;

DROP POLICY IF EXISTS "Public can join waitlist" ON public.waitlist_signups;

CREATE POLICY "Public can join waitlist"
    ON public.waitlist_signups
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
