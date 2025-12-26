# 🔐 Laporan Keamanan Kode - Kocheng Jalanan

Dokumen ini berisi hasil audit keamanan dan rekomendasi untuk aplikasi **Kocheng Jalanan**.

---

## 📊 Ringkasan Temuan

| Kategori | Status | Prioritas |
|----------|--------|-----------|
| Authentication | ⚠️ Perlu Perbaikan | Tinggi |
| Authorization (RLS) | ✅ DIPERBAIKI | - |
| Input Validation | ✅ DIPERBAIKI | - |
| XSS Prevention | ✅ Baik | - |
| API Key Security | ✅ Baik | - |
| File Upload | ✅ DIPERBAIKI | - |
| Environment Variables | ✅ Sudah Ada | - |
| Console Logs | ✅ DIPERBAIKI | - |

---

## 🚨 Temuan Keamanan

### 1. **[TINGGI] RLS Policy Infinite Recursion**

**File:** `supabase/schema.sql`

**Masalah:**
Policy pada tabel `admins` menyebabkan infinite recursion ketika tabel `cats` di-query:

```sql
CREATE POLICY "Admins can view admins"
ON admins FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM admins)); -- ❌ Recursive!
```

**Risiko:** Aplikasi error 500 saat admin mencoba INSERT/UPDATE data kucing.

**Rekomendasi:** Gunakan `SECURITY DEFINER` function:

```sql
-- Hapus policy bermasalah
DROP POLICY IF EXISTS "Admins can view admins" ON admins;

-- Buat policy sederhana (admin list bukan data sensitif)
CREATE POLICY "Authenticated users can view admins"
ON admins FOR SELECT
TO authenticated
USING (true);

-- ATAU gunakan SECURITY DEFINER function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update policies di tabel cats
CREATE POLICY "Only admins can insert cats"
ON cats FOR INSERT
TO authenticated
WITH CHECK (is_admin());
```

---

### 2. **[TINGGI] Admin Check Hanya di Client-Side**

**File:** `src/routes/admin/(dashboard)/+layout.svelte`

**Masalah:**
Admin route hanya dilindungi oleh pengecekan client-side:

```svelte
onMount(() => {
    user.subscribe((currentUser) => {
        if (!$authLoading && !currentUser) {
            goto('/admin/login'); // ❌ Bisa di-bypass!
        }
    });
});
```

**Risiko:** 
- User bisa memanipulasi JavaScript untuk bypass redirect
- API endpoints tidak terproteksi

**Rekomendasi:**
1. Tambahkan server-side middleware menggunakan SvelteKit `hooks.server.ts`:

```typescript
// src/hooks.server.ts
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { createAdminClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/admin') && 
        !event.url.pathname.startsWith('/admin/login')) {
        
        const session = event.cookies.get('sb-access-token');
        if (!session) {
            throw redirect(303, '/admin/login');
        }

        // Verify user is admin
        const supabase = createAdminClient();
        const { data: admin } = await supabase
            .from('admins')
            .select('id')
            .eq('id', /* userId from JWT */)
            .single();

        if (!admin) {
            throw redirect(303, '/admin/login');
        }
    }

    return resolve(event);
};
```

2. Gunakan `+layout.server.ts` untuk load data dengan pengecekan admin.

---

### 3. **[TINGGI] Environment Variables Tidak Ada .env.example**

**Masalah:**
Tidak ada file `.env.example` sebagai referensi environment variables yang diperlukan.

**Risiko:**
- Developer baru tidak tahu variabel apa yang harus diisi
- Bisa menyebabkan kebocoran jika variabel sensitif di-push ke git

**Rekomendasi:**
Buat file `.env.example`:

```env
# Public (exposed to client)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Pastikan `.gitignore` sudah mengabaikan `.env` dan `.env.local`.

---

### 4. **[SEDANG] Input Validation pada File Upload**

**File:** `src/lib/utils/storage.ts`

**Masalah:**
Tidak ada validasi file type dan ukuran sebelum upload:

```typescript
export async function uploadCatImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop(); // ❌ Bisa dimanipulasi
    // ... upload tanpa validasi
}
```

**Risiko:**
- User bisa upload file berbahaya (executable, script)
- File berukuran sangat besar bisa menyebabkan DoS

**Rekomendasi:**

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadCatImage(file: File): Promise<string | null> {
    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
        console.error('Invalid file type:', file.type);
        return null;
    }

    // Validasi ukuran
    if (file.size > MAX_FILE_SIZE) {
        console.error('File too large:', file.size);
        return null;
    }

    // Generate safe filename (hindari path traversal)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
        console.error('Invalid file extension');
        return null;
    }

    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    // ... rest of upload logic
}
```

---

### 5. **[SEDANG] Activity Log Tanpa Rate Limiting**

**File:** `src/lib/stores/activityLogs.ts`

**Masalah:**
Siapa saja (anonymous) bisa menambahkan activity log tanpa batasan:

```sql
CREATE POLICY "Anyone can insert activity logs"
ON cat_activity_logs FOR INSERT
WITH CHECK (true); -- ❌ Tidak ada batasan!
```

**Risiko:**
- Spam database dengan ribuan entri
- DoS attack
- Konten tidak pantas

**Rekomendasi:**
1. Implementasi rate limiting di edge function atau middleware
2. Tambahkan captcha untuk form publik
3. Moderasi konten manual atau otomatis
4. Batasi panjang field `notes` di database:

```sql
ALTER TABLE cat_activity_logs 
ADD CONSTRAINT notes_length CHECK (char_length(notes) <= 500);
```

---

### 6. **[RENDAH] Console Log di Production**

**File:** `src/lib/components/Map.svelte`

**Masalah:**
Ada `console.log` yang tersisa di code production:

```javascript
console.log('🔄 flyTo effect triggered:', ...);
console.log('📍 User marker added at:', ...);
```

**Risiko:**
- Membocorkan informasi internal
- Mengurangi performa

**Rekomendasi:**
Hapus atau gunakan environment check:

```javascript
if (import.meta.env.DEV) {
    console.log('Debug info...');
}
```

---

## ✅ Aspek Keamanan yang Sudah Baik

### 1. **XSS Prevention**
- Tidak ditemukan penggunaan `@html` atau `innerHTML` yang berbahaya
- Tidak ada `eval()` atau `Function()` constructor
- Svelte secara default melakukan HTML escaping

### 2. **API Key Management**
- `PUBLIC_SUPABASE_ANON_KEY` digunakan untuk client (sesuai best practice)
- `SUPABASE_SERVICE_ROLE_KEY` hanya di-import dari `$env/static/private` (server-only)
- Service role key tidak terekspos ke client

### 3. **SQL Injection**
- Menggunakan Supabase client dengan parameterized queries
- Tidak ada raw SQL query di client-side

### 4. **HTTPS**
- Supabase endpoints sudah menggunakan HTTPS by default

---

## 📋 Checklist Keamanan untuk Deployment

### Sebelum Go-Live:
- [ ] Perbaiki RLS policy infinite recursion
- [ ] Implementasi server-side auth check untuk admin routes
- [ ] Buat `.env.example` dan pastikan `.gitignore` benar
- [ ] Tambahkan validasi file upload
- [ ] Hapus console.log debug statements
- [ ] Aktifkan Supabase Row Level Security untuk semua tabel
- [ ] Review Storage policies di Supabase Dashboard
- [ ] Test dengan user non-admin untuk memastikan akses terbatas
- [ ] Enable Supabase Auth email confirmation untuk production
- [ ] Set up rate limiting (Cloudflare, Vercel Edge, dll)

### Monitoring:
- [ ] Aktifkan Supabase logs monitoring
- [ ] Set up alerting untuk failed auth attempts
- [ ] Monitor storage quota

---

## 🔗 Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [SvelteKit Security Best Practices](https://kit.svelte.dev/docs/security)
- [OWASP Web Security Checklist](https://owasp.org/www-project-web-security-testing-guide/)

---

*Dokumen ini dibuat pada: 26 Desember 2025*
*Versi aplikasi yang diaudit: 1.0.0*
