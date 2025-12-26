-- ============================================
-- KOCHENG JALANAN - DATABASE SCHEMA
-- ============================================

-- 1. Create admins table to track admin users
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admins table
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view admins (admin list is not sensitive)
-- This avoids infinite recursion
CREATE POLICY "Authenticated users can view admins"
ON admins FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 2. Create cats table
-- ============================================
CREATE TABLE cats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name TEXT,
    location_landmark TEXT,
    photos TEXT[],
    thumbnail_url TEXT,
    health_status TEXT DEFAULT 'sehat' CHECK (health_status IN ('sehat', 'sakit', 'kritis')),
    health_notes TEXT,
    gender TEXT DEFAULT 'unknown' CHECK (gender IN ('jantan', 'betina', 'unknown')),
    color TEXT,
    age_estimate TEXT DEFAULT 'dewasa' CHECK (age_estimate IN ('kitten', 'dewasa', 'senior')),
    is_neutered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Helper function to check if user is admin (SECURITY DEFINER bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 4. RLS Policies for cats table (using is_admin function)
-- ============================================

-- Policy: Anyone (public) can read active cats
CREATE POLICY "Anyone can read active cats"
ON cats FOR SELECT
USING (is_active = true);

-- Policy: Only admins can insert cats
CREATE POLICY "Only admins can insert cats"
ON cats FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Policy: Only admins can update cats
CREATE POLICY "Only admins can update cats"
ON cats FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Policy: Only admins can delete cats
CREATE POLICY "Only admins can delete cats"
ON cats FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- 5. Auto-update updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cats_updated_at
    BEFORE UPDATE ON cats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. MANUAL STEP: Add yourself as admin
-- ============================================
-- After creating your user in Supabase Auth, run:
-- 
-- INSERT INTO admins (id, email)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
--
-- Replace 'your-email@example.com' with your actual email.

-- ============================================
-- 7. Storage bucket (run in Dashboard)
-- ============================================
-- Go to Supabase Dashboard > Storage > New Bucket
-- Bucket name: cat-photos
-- Public bucket: Yes
