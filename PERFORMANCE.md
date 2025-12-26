# 🚀 Rekomendasi Optimasi Performa - Kocheng Jalanan

Dokumen ini berisi rekomendasi dan saran dari perspektif **Backend Expert** untuk meningkatkan performa aplikasi **Kocheng Jalanan** tanpa mengubah flow yang sudah ada.

---

## 📊 Ringkasan Rekomendasi

| Area | Prioritas | Kompleksitas | Dampak |
|------|-----------|--------------|--------|
| Database Indexing | 🔴 Tinggi | Rendah | Besar |
| Image Optimization | 🔴 Tinggi | Sedang | Besar |
| Caching Strategy | 🟡 Sedang | Sedang | Sedang |
| API Optimization | 🟡 Sedang | Rendah | Sedang |
| CDN Implementation | 🟢 Rendah | Sedang | Sedang |

---

## 1. 🗄️ Database Optimization

### 1.1 Database Indexing

**Apa itu Index?**
Index adalah struktur data yang mempercepat pencarian di database, seperti indeks di buku. Tanpa index, database harus scan seluruh tabel (Full Table Scan) yang lambat.

**Rekomendasi Index untuk Kocheng Jalanan:**

```sql
-- =============================================
-- INDEX RECOMMENDATIONS
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Index untuk filtering kucing berdasarkan status
-- Digunakan saat filter di homepage (sehat/sakit/kritis)
CREATE INDEX IF NOT EXISTS idx_cats_health_status 
ON cats(health_status);

-- 2. Index untuk kucing aktif (paling sering di-query)
-- Digunakan di hampir semua query publik
CREATE INDEX IF NOT EXISTS idx_cats_is_active 
ON cats(is_active);

-- 3. Composite index untuk query umum
-- Mengoptimalkan: SELECT * FROM cats WHERE is_active = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_cats_active_created 
ON cats(is_active, created_at DESC);

-- 4. Index untuk activity logs per kucing
-- Mengoptimalkan fetch activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_cat_id 
ON cat_activity_logs(cat_id);

-- 5. Composite index untuk activity logs dengan sorting
CREATE INDEX IF NOT EXISTS idx_activity_logs_cat_created 
ON cat_activity_logs(cat_id, created_at DESC);

-- 6. Index untuk slug lookup
-- Mengoptimalkan URL-based queries
CREATE INDEX IF NOT EXISTS idx_cats_slug 
ON cats(slug);

-- 7. Spatial index untuk lokasi (jika menggunakan PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_cats_location 
-- ON cats USING GIST (ST_MakePoint(longitude, latitude));
```

**Dampak:** Query yang sebelumnya memakan 100-500ms bisa turun ke 1-10ms.

---

### 1.2 Query Optimization

**Masalah: N+1 Query Problem**

Saat ini, `fetchAllActivityLogs` menggunakan join yang baik. Tapi pastikan tidak ada query yang berjalan dalam loop.

**Contoh Buruk (N+1):**
```typescript
// ❌ JANGAN LAKUKAN INI
const cats = await getCats();
for (const cat of cats) {
    cat.activityLogs = await getActivityLogs(cat.id); // Query per kucing!
}
```

**Contoh Baik (Single Query with Join):**
```typescript
// ✅ GUNAKAN INI
const catsWithLogs = await supabase
    .from('cats')
    .select(`
        *,
        activity_logs:cat_activity_logs(*)
    `);
```

---

### 1.3 Pagination

**Apa itu Pagination?**
Pagination adalah teknik membagi data menjadi halaman-halaman kecil. Ini mencegah loading ribuan record sekaligus.

**Implementasi di Supabase:**
```typescript
// Fetch dengan pagination
const PAGE_SIZE = 20;

export async function fetchCatsPaginated(page: number = 1) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, count } = await supabase
        .from('cats')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);
    
    return {
        cats: data,
        totalCount: count,
        totalPages: Math.ceil(count / PAGE_SIZE),
        currentPage: page
    };
}
```

**Kapan Dibutuhkan:** Ketika jumlah kucing > 100.

---

## 2. 🖼️ Image Optimization

### 2.1 Image Compression

**Masalah Saat Ini:**
- Foto kucing di-upload tanpa kompresi
- File besar = loading lambat = UX buruk

**Solusi: Client-side Compression**

```typescript
// src/lib/utils/imageCompression.ts

/**
 * Compress image before upload
 * Menggunakan Canvas API untuk resize dan compress
 */
export async function compressImage(
    file: File, 
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Compression failed'));
                },
                'image/webp', // WebP format = 25-34% smaller
                quality
            );
        };
        
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
    });
}
```

**Dampak:** 
- File 5MB → 200-500KB (90% reduction)
- Loading 5x lebih cepat

---

### 2.2 Responsive Images

**Apa itu Responsive Images?**
Menyediakan ukuran gambar berbeda untuk device berbeda. Mobile tidak perlu load gambar 4K.

**Implementasi dengan Supabase Transformations:**

```typescript
// Helper untuk generate URL dengan ukuran berbeda
export function getOptimizedImageUrl(
    url: string, 
    size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string {
    const sizes = {
        thumbnail: { width: 150, height: 150 },
        medium: { width: 400, height: 400 },
        large: { width: 800, height: 800 }
    };
    
    const { width, height } = sizes[size];
    
    // Supabase Image Transformation
    // Aktifkan di Dashboard > Storage > Policies
    return `${url}?width=${width}&height=${height}&resize=cover`;
}
```

**Penggunaan di Component:**

```svelte
<img
    src={getOptimizedImageUrl(cat.thumbnail_url, 'thumbnail')}
    srcset="
        {getOptimizedImageUrl(cat.thumbnail_url, 'thumbnail')} 150w,
        {getOptimizedImageUrl(cat.thumbnail_url, 'medium')} 400w,
        {getOptimizedImageUrl(cat.thumbnail_url, 'large')} 800w
    "
    sizes="(max-width: 640px) 150px, (max-width: 1024px) 400px, 800px"
    alt={cat.name}
    loading="lazy"
/>
```

---

### 2.3 Lazy Loading

**Apa itu Lazy Loading?**
Hanya load gambar saat terlihat di viewport. Gambar di bawah fold tidak di-load sampai user scroll.

**Native Browser Support:**
```html
<img src="..." loading="lazy" alt="..." />
```

**Untuk Komponen Map (Leaflet):**
Marker icons sudah menggunakan lazy loading secara default karena dibuat dinamis.

---

## 3. 💾 Caching Strategy

### 3.1 Browser Caching (SvelteKit)

**Apa itu Caching?**
Menyimpan data di memori/disk agar tidak perlu fetch ulang dari server.

**Implementasi dengan SvelteKit Load Function:**

```typescript
// src/routes/+page.ts
export async function load({ fetch, setHeaders }) {
    setHeaders({
        'cache-control': 'public, max-age=60' // Cache 1 menit
    });
    
    const cats = await fetchCats();
    return { cats };
}
```

### 3.2 In-Memory Cache untuk Data Statis

```typescript
// src/lib/utils/cache.ts

interface CacheItem<T> {
    data: T;
    expiry: number;
}

class SimpleCache {
    private cache = new Map<string, CacheItem<any>>();
    
    set<T>(key: string, data: T, ttlSeconds: number = 60): void {
        this.cache.set(key, {
            data,
            expiry: Date.now() + (ttlSeconds * 1000)
        });
    }
    
    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    
    invalidate(key: string): void {
        this.cache.delete(key);
    }
}

export const cache = new SimpleCache();

// Penggunaan
export async function getCatsWithCache(): Promise<Cat[]> {
    const cached = cache.get<Cat[]>('all_cats');
    if (cached) return cached;
    
    const cats = await fetchCatsFromDB();
    cache.set('all_cats', cats, 60); // Cache 60 detik
    return cats;
}
```

### 3.3 Stale-While-Revalidate Pattern

**Apa itu SWR?**
Tampilkan data cache lama SAMBIL fetch data baru di background. User tidak perlu menunggu.

```typescript
export async function getCatsWithSWR(
    onUpdate: (cats: Cat[]) => void
): Promise<Cat[]> {
    // 1. Return cached data immediately
    const cached = cache.get<Cat[]>('all_cats');
    if (cached) {
        // 2. Revalidate in background
        fetchCatsFromDB().then(freshData => {
            cache.set('all_cats', freshData, 60);
            onUpdate(freshData);
        });
        return cached;
    }
    
    // 3. No cache, fetch and cache
    const fresh = await fetchCatsFromDB();
    cache.set('all_cats', fresh, 60);
    return fresh;
}
```

---

## 4. 🌐 API & Network Optimization

### 4.1 Request Batching

**Masalah:**
Multiple request terpisah = overhead tinggi.

**Solusi: Batch Requests**
```typescript
// Bukan ini:
const cats = await fetchCats();
const logs = await fetchActivityLogs();
const stats = await fetchStats();

// Tapi ini (parallel):
const [cats, logs, stats] = await Promise.all([
    fetchCats(),
    fetchActivityLogs(),
    fetchStats()
]);
```

### 4.2 Data Prefetching

**Prefetch data yang kemungkinan dibutuhkan:**

```svelte
<!-- Prefetch cat detail saat hover -->
<a 
    href="/cats/{cat.slug}"
    on:mouseenter={() => prefetchCat(cat.id)}
>
    {cat.name}
</a>

<script>
    import { goto, preloadData } from '$app/navigation';
    
    function prefetchCat(id: string) {
        preloadData(`/cats/${id}`);
    }
</script>
```

### 4.3 Selective Field Fetching

**Jangan fetch field yang tidak dibutuhkan:**

```typescript
// ❌ Fetch semua field
const { data } = await supabase.from('cats').select('*');

// ✅ Fetch field yang dibutuhkan saja
const { data } = await supabase
    .from('cats')
    .select('id, name, slug, thumbnail_url, health_status, latitude, longitude');
```

---

## 5. 🖥️ Frontend Performance

### 5.1 Code Splitting (Sudah Default di SvelteKit)

SvelteKit sudah melakukan code splitting otomatis per route. Setiap halaman hanya load JavaScript yang dibutuhkan.

### 5.2 Component Lazy Loading

```svelte
<!-- Lazy load komponen berat -->
{#await import('$lib/components/Map.svelte') then { default: Map }}
    <Map {cats} />
{/await}
```

### 5.3 Virtual List untuk Data Banyak

**Apa itu Virtual List?**
Hanya render item yang terlihat di viewport. Berguna jika ada 1000+ kucing.

```bash
npm install svelte-virtual-list
```

```svelte
<script>
    import VirtualList from 'svelte-virtual-list';
</script>

<VirtualList items={cats} let:item>
    <CatCard cat={item} />
</VirtualList>
```

---

## 6. 🏗️ Infrastructure Recommendations

### 6.1 CDN untuk Static Assets

**Apa itu CDN?**
Content Delivery Network - menyimpan copy file di server yang tersebar global. User di Indonesia load dari server Singapore, bukan US.

**Rekomendasi:**
- **Vercel** (built-in CDN untuk SvelteKit)
- **Cloudflare** (gratis, powerful)

### 6.2 Edge Functions

**Untuk Indonesia, gunakan Supabase region Singapore:**
- Latency: ~20-50ms vs ~200-300ms (US)

### 6.3 Database Connection Pooling

Supabase sudah menggunakan PgBouncer untuk connection pooling. Pastikan menggunakan pooler connection string:

```env
# Gunakan ini untuk production
DATABASE_URL=postgres://...pooler.supabase.com:6543/postgres
```

---

## 7. 📈 Monitoring & Profiling

### 7.1 Performance Metrics to Track

| Metric | Target | Tools |
|--------|--------|-------|
| First Contentful Paint (FCP) | < 1.8s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.8s | Lighthouse |
| API Response Time | < 200ms | Supabase Dashboard |
| Database Query Time | < 50ms | Supabase Logs |

### 7.2 Supabase Dashboard Monitoring

1. Buka Supabase Dashboard
2. Pergi ke **Reports** > **Database**
3. Lihat **Slow Queries** - optimasi query yang > 100ms
4. Lihat **Active Connections** - jangan melebihi limit

### 7.3 Browser DevTools

```javascript
// Ukur waktu fetch
console.time('fetchCats');
const cats = await fetchCats();
console.timeEnd('fetchCats'); // fetchCats: 123ms
```

---

## 📋 Implementation Checklist

### Immediate (Hari Ini):
- [ ] Jalankan SQL untuk database indexes
- [ ] Tambahkan `loading="lazy"` ke semua `<img>`
- [ ] Gunakan `Promise.all` untuk parallel requests

### Short-term (Minggu Ini):
- [ ] Implementasi image compression sebelum upload
- [ ] Selective field fetching di semua queries
- [ ] Setup in-memory cache untuk data statis

### Long-term (Bulan Depan):
- [ ] Responsive images dengan srcset
- [ ] Virtual list jika data > 100 items
- [ ] CDN setup (Cloudflare)
- [ ] Performance monitoring

---

## 📚 Glossary (Istilah Teknis)

| Term | Penjelasan |
|------|------------|
| **Index** | Struktur data untuk mempercepat pencarian di database |
| **N+1 Problem** | Bug performa dimana query berjalan dalam loop |
| **Pagination** | Membagi data menjadi halaman-halaman kecil |
| **Lazy Loading** | Load resource hanya saat dibutuhkan |
| **CDN** | Jaringan server global untuk serving static files |
| **Cache** | Menyimpan data agar tidak perlu fetch ulang |
| **SWR** | Stale-While-Revalidate - pattern caching |
| **TTL** | Time To Live - berapa lama cache valid |
| **Pooling** | Berbagi koneksi database untuk efisiensi |
| **FCP/LCP** | Metrics untuk mengukur loading speed |

---

*Dokumen ini dibuat pada: 26 Desember 2025*
*Oleh: Backend Performance Expert*
