# 🐱 Kocheng Jalanan - Project Summary

Peta interaktif untuk melacak dan menampilkan informasi kucing jalanan di Indonesia.

---

## 📋 Tech Stack

| Teknologi | Versi | Keterangan |
|-----------|-------|------------|
| **SvelteKit** | 2.49.1 | Framework utama |
| **Svelte 5** | 5.45.6 | UI dengan runes ($state, $effect, $derived) |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.1.17 | Styling |
| **Leaflet.js** | 1.9.4 | Peta interaktif |
| **Supabase** | 2.89.0 | Backend (Auth, Database, Storage) |
| **Three.js** | 0.182.0 | 3D graphics |
| **Lottie** | 5.13.0 | Animasi |

---

## 🗂️ Struktur Project

```
kochengjalanan/
├── src/
│   ├── lib/
│   │   ├── components/         # Komponen UI
│   │   │   ├── Map.svelte           # Peta utama dengan marker kucing
│   │   │   ├── CatPopup.svelte      # Popup info kucing
│   │   │   ├── FilterBar.svelte     # Filter status kesehatan
│   │   │   ├── LocationPicker.svelte # Picker lokasi untuk admin
│   │   │   ├── Navbar.svelte        # Navigation bar
│   │   │   ├── Sidebar.svelte       # Sidebar admin
│   │   │   ├── CatIcon.svelte       # Icon kucing custom
│   │   │   └── ...
│   │   ├── stores/             # State management
│   │   │   └── cats.ts              # Store data kucing
│   │   ├── types/              # TypeScript types
│   │   │   └── supabase.ts          # Tipe data Cat, CatInsert
│   │   ├── utils/              # Helper functions
│   │   │   └── storage.ts           # Upload gambar
│   │   └── supabase.ts         # Supabase client
│   │
│   └── routes/
│       ├── +page.svelte        # Homepage (Peta)
│       ├── cats/
│       │   └── [id]/+page.svelte    # Detail kucing
│       ├── admin/
│       │   ├── login/+page.svelte   # Login admin
│       │   └── (dashboard)/
│       │       ├── +page.svelte     # Dashboard admin
│       │       └── cats/
│       │           ├── add/+page.svelte   # Tambah kucing
│       │           └── [id]/+page.svelte  # Edit kucing
│       └── api/                # API routes
│
├── supabase/
│   └── schema.sql              # Database schema
│
└── static/                     # Static assets
```

---

## ✨ Fitur Utama

### 🗺️ **Halaman Utama (Peta)**
- Peta interaktif dengan marker kucing
- Marker dengan warna berbeda berdasarkan status kesehatan:
  - 🟢 Hijau = Sehat
  - 🟡 Kuning = Sakit
  - 🔴 Merah = Kritis
- **Filter** kucing berdasarkan status
- **Popup** info kucing saat marker diklik
- **Tombol "Lokasi Saya"** - Mencari kucing terdekat berdasarkan lokasi user
- **Marker lokasi user** - Titik biru dengan animasi ping

### 📄 **Halaman Detail Kucing**
- Foto kucing (carousel jika lebih dari 1)
- Informasi lengkap: nama, gender, umur, warna, status steril
- Status kesehatan dengan badge berwarna
- Lokasi dengan koordinat
- Link ke Google Maps

### 🔐 **Admin Panel**
- **Login** dengan Supabase Auth
- **Dashboard** dengan statistik
- **Kelola Kucing**:
  - Tambah kucing baru
  - Edit data kucing
  - Hapus kucing
  - Upload foto
- **Location Picker** dengan search dan map click

---

## 🗄️ Database Schema (Supabase)

### Tabel `cats`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary key |
| name | TEXT | Nama kucing |
| description | TEXT | Deskripsi |
| latitude | DOUBLE | Koordinat lat |
| longitude | DOUBLE | Koordinat lng |
| location_name | TEXT | Nama lokasi |
| location_landmark | TEXT | Patokan |
| photos | TEXT[] | Array URL foto |
| thumbnail_url | TEXT | URL thumbnail |
| health_status | TEXT | sehat/sakit/kritis |
| health_notes | TEXT | Catatan kesehatan |
| gender | TEXT | jantan/betina/unknown |
| color | TEXT | Warna bulu |
| age_estimate | TEXT | kitten/dewasa/senior |
| is_neutered | BOOLEAN | Sudah steril? |
| is_active | BOOLEAN | Aktif/soft delete |
| created_at | TIMESTAMPTZ | Waktu dibuat |
| updated_at | TIMESTAMPTZ | Waktu diupdate |

### Tabel `admins`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | FK ke auth.users |
| email | TEXT | Email admin |
| created_at | TIMESTAMPTZ | Waktu dibuat |

### Row Level Security (RLS)
- ✅ Semua orang bisa **read** kucing aktif
- 🔐 Hanya admin yang bisa **insert/update/delete**

---

## 🎨 Design System

### Warna Utama
- **Primary Gradient**: `#fcef04` (kuning) → `#dc419b` (pink)
- **Background**: Slate-50
- **Text**: Slate-700, Slate-400

### Komponen UI
- **Rounded corners**: `rounded-2xl`, `rounded-3xl`
- **Shadows**: Minimal, clean (shadow-sm, ring-1)
- **Animasi**: Smooth transitions, ping effect pada marker
- **Style**: Modern, minimalis, "gemoy" (cute)

---

## 🚀 Menjalankan Project

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build production
npm run build
```

### Environment Variables
Buat file `.env.local`:
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📝 Catatan Developer

### Svelte 5 Runes
Project ini menggunakan Svelte 5 runes:
- `$state()` - Reactive state
- `$derived()` - Computed values
- `$effect()` - Side effects
- `$props()` - Component props

### Reaktivitas $effect
Di `$effect`, variabel reaktif harus diakses **di awal** effect (sebelum early return) agar Svelte bisa tracking dependency dengan benar.

```javascript
$effect(() => {
    // ✅ Akses variabel di awal
    const trigger = flyToTrigger;
    const location = userLocation;
    
    if (!map) return; // Early return setelah akses
    
    // ... logic
});
```

---

## 📅 Last Updated
24 Desember 2025
