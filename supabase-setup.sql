-- Quick SQL Setup for Supabase
-- Copy and paste this into Supabase SQL Editor

-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT,
    apartment_type TEXT,
    user_type TEXT,
    message TEXT
);

-- Step 2: Enable Row Level Security
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies (allow public access)
-- Policy 1: Allow anyone to insert (submit forms)
CREATE POLICY "Allow public insert" ON form_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 2: Allow anyone to read (for admin panel)
CREATE POLICY "Allow public read" ON form_submissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy 3: Allow anyone to delete (for admin panel)
CREATE POLICY "Allow public delete" ON form_submissions
    FOR DELETE
    TO anon, authenticated
    USING (true);

