-- ============================================
-- SECURITY FIX PATCH - Kocheng Jalanan
-- Jalankan script ini di Supabase SQL Editor
-- ============================================
-- Tanggal: 26 Desember 2025
-- Versi: 1.0.2 (Fixed dependency issue)
-- ============================================

-- ============================================
-- 1. FIX: Infinite Recursion pada RLS Policy admins
-- ============================================

-- Hapus policy lama yang bermasalah (jika ada)
DROP POLICY IF EXISTS "Admins can view admins" ON admins;

-- Hapus policy baru jika sudah ada (untuk idempotency)
DROP POLICY IF EXISTS "Authenticated users can view admins" ON admins;

-- Buat policy baru yang tidak menyebabkan infinite recursion
CREATE POLICY "Authenticated users can view admins"
ON admins FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 2. UPDATE: is_admin() function dengan SECURITY DEFINER
-- CATATAN: Gunakan CREATE OR REPLACE, JANGAN DROP karena ada dependencies
-- ============================================

-- Update function dengan SECURITY DEFINER (bypass RLS)
-- dan SET search_path untuk keamanan tambahan
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 3. UPDATE: RLS Policies untuk tabel cats menggunakan is_admin()
-- ============================================

-- Hapus policies lama
DROP POLICY IF EXISTS "Only admins can insert cats" ON cats;
DROP POLICY IF EXISTS "Only admins can update cats" ON cats;
DROP POLICY IF EXISTS "Only admins can delete cats" ON cats;

-- Buat policies baru menggunakan is_admin() function
CREATE POLICY "Only admins can insert cats"
ON cats FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update cats"
ON cats FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete cats"
ON cats FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- 4. SECURITY: Tambahkan constraint panjang notes pada activity logs
-- ============================================

-- Tambahkan constraint jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notes_max_length' 
        AND table_name = 'cat_activity_logs'
    ) THEN
        ALTER TABLE cat_activity_logs 
        ADD CONSTRAINT notes_max_length CHECK (char_length(notes) <= 500);
    END IF;
END $$;

-- Tambahkan constraint panjang user_name
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_name_max_length' 
        AND table_name = 'cat_activity_logs'
    ) THEN
        ALTER TABLE cat_activity_logs 
        ADD CONSTRAINT user_name_max_length CHECK (char_length(user_name) <= 50);
    END IF;
END $$;

-- ============================================
-- 5. VERIFICATION: Cek policies sudah benar
-- ============================================

-- Tampilkan semua policies untuk verifikasi
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('admins', 'cats', 'cat_activity_logs')
ORDER BY tablename, policyname;

-- ============================================
-- SELESAI! Verifikasi output di atas bahwa:
-- 1. admins: ada policy "Authenticated users can view admins"
-- 2. cats: ada policy dengan is_admin() untuk INSERT/UPDATE/DELETE
-- ============================================
