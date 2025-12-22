Buatkan aplikasi web "Kocheng Jalanan" menggunakan SvelteKit, Supabase, dan Tailwind CSS.
## Deskripsi Aplikasi
Website peta interaktif untuk menampilkan lokasi kucing jalanan. "Kocheng" adalah bahasa Jawa untuk kucing. Terdapat 2 bagian utama:
1. Frontend Public - User umum melihat peta dengan icon kucing
2. Admin Dashboard - Admin mengelola data kucing dan menentukan lokasi via peta
## Tech Stack
- Framework: SvelteKit
- Database & Backend: Supabase (PostgreSQL + Auth + Storage)
- Styling: Tailwind CSS
- Map: Leaflet.js dengan OpenStreetMap tiles
---
## BAGIAN 1: FRONTEND PUBLIC
### Halaman
- "/" : Halaman utama berupa peta full screen dengan icon kucing
### Fitur
- Header dengan logo/text "Kocheng Jalanan" 
- Tampilkan peta interaktif menggunakan Leaflet.js
- Fetch data kucing dari tabel "cats" di Supabase (hanya yang is_active = true)
- Render marker icon kucing di peta berdasarkan koordinat latitude dan longitude dari database
- Icon marker menggunakan gambar kucing custom
- Warna icon berbeda berdasarkan health_status:
  - Hijau: sehat
  - Kuning: perlu perhatian  
  - Merah: sakit/kritis
- Klik icon marker akan menampilkan popup berisi:
  - Foto kucing (thumbnail)
  - Nama kucing
  - Lokasi (nama jalan + landmark)
  - Status kesehatan
  - Deskripsi singkat
- Filter kucing berdasarkan status: Semua, Sehat, Sakit, Butuh Perhatian
- Responsive design untuk mobile
- Footer dengan credit "Kocheng Jalanan © 2025"
---
## BAGIAN 2: ADMIN DASHBOARD
### Halaman
- "/admin/login" : Login admin
- "/admin" : Dashboard home dengan statistik
- "/admin/cats" : List semua kucing dalam bentuk tabel
- "/admin/cats/add" : Form tambah kucing baru
- "/admin/cats/[id]" : Form edit kucing berdasarkan ID
### Fitur Login
- Halaman login dengan judul "Kocheng Jalanan - Admin"
- Autentikasi menggunakan Supabase Auth (email + password)
- Protect semua route /admin/* agar hanya bisa diakses setelah login
- Redirect ke login jika belum authenticated
### Fitur Dashboard Home
- Header "Dashboard Kocheng Jalanan"
- Tampilkan statistik: total kucing, jumlah sehat, jumlah sakit, jumlah butuh perhatian
- Tampilkan list kucing terbaru yang ditambahkan
- Welcome message dengan nama admin yang login
### Fitur List Kucing
- Tabel berisi semua data kucing
- Kolom: Foto, Nama, Lokasi, Status Kesehatan, Tanggal Ditambahkan, Aksi
- Aksi: Edit dan Hapus
- Search berdasarkan nama kucing
- Pagination
### Fitur Tambah Kucing
Form input dengan field:
- Nama kucing (required)
- Deskripsi
- Location Picker: Peta interaktif untuk memilih lokasi
  - User bisa klik di peta untuk menempatkan marker
  - Marker bisa di-drag untuk memindahkan posisi
  - Tampilkan koordinat latitude dan longitude yang terpilih
  - Tombol "Gunakan Lokasi Saya" untuk geolocation
- Nama jalan/alamat
- Landmark/patokan
- Jenis kelamin (dropdown: Jantan, Betina, Tidak Diketahui)
- Warna bulu
- Perkiraan usia (dropdown: Kitten, Dewasa, Senior)
- Status kesehatan (dropdown: Sehat, Sakit, Kritis)
- Catatan kesehatan
- Status steril (checkbox)
- Upload foto (multiple, simpan ke Supabase Storage)
### Fitur Edit Kucing
- Load data kucing berdasarkan ID
- Form sama seperti tambah kucing
- Location picker menampilkan marker di posisi yang sudah tersimpan
- Marker bisa di-drag untuk update lokasi
- Bisa hapus dan tambah foto
### Fitur Hapus Kucing
- Soft delete dengan mengubah is_active menjadi false
- Konfirmasi sebelum hapus dengan pesan "Yakin ingin menghapus data kocheng ini?"
---
## DATABASE SCHEMA (Supabase)
### Tabel: cats
- id: UUID, primary key, default uuid_generate_v4()
- name: TEXT, not null
- description: TEXT
- latitude: DECIMAL(10,8), not null
- longitude: DECIMAL(11,8), not null
- location_name: TEXT
- location_landmark: TEXT
- gender: TEXT (jantan/betina/unknown)
- color: TEXT
- age_estimate: TEXT (kitten/dewasa/senior)
- health_status: TEXT, default 'sehat' (sehat/sakit/kritis)
- health_notes: TEXT
- is_neutered: BOOLEAN, default false
- photos: TEXT[] (array URL foto)
- thumbnail_url: TEXT
- is_active: BOOLEAN, default true
- added_by: UUID (foreign key ke admins)
- created_at: TIMESTAMPTZ, default now()
- updated_at: TIMESTAMPTZ, default now()
### Tabel: admins
- id: UUID, primary key
- user_id: UUID (foreign key ke auth.users)
- name: TEXT
- email: TEXT, unique
- role: TEXT, default 'admin'
- created_at: TIMESTAMPTZ, default now()
### Row Level Security
- Tabel cats: 
  - SELECT: public bisa akses jika is_active = true
  - INSERT, UPDATE, DELETE: hanya user yang ada di tabel admins
- Tabel admins:
  - Hanya authenticated user yang bisa akses
### Storage Bucket
- Buat bucket "kocheng-photos" untuk menyimpan foto kucing
- Policy: public bisa read, authenticated bisa upload
---
## STRUKTUR FOLDER
src/ ├── lib/ │ ├── components/ │ │ ├── Map.svelte (komponen peta reusable) │ │ ├── CatMarker.svelte │ │ ├── CatPopup.svelte │ │ ├── LocationPicker.svelte (untuk admin pilih lokasi) │ │ ├── ImageUploader.svelte │ │ ├── CatForm.svelte │ │ ├── CatTable.svelte │ │ ├── FilterBar.svelte │ │ ├── Sidebar.svelte (admin) │ │ └── StatsCard.svelte │ ├── stores/ │ │ ├── cats.js │ │ └── auth.js │ └── supabaseClient.js ├── routes/ │ ├── +page.svelte (frontend public - peta) │ ├── +layout.svelte │ └── admin/ │ ├── +layout.svelte (layout admin dengan sidebar) │ ├── +page.svelte (dashboard) │ ├── login/+page.svelte │ └── cats/ │ ├── +page.svelte (list) │ ├── add/+page.svelte │ └── [id]/+page.svelte (edit) ├── app.css (tailwind imports) └── app.html

---
## DESIGN GUIDELINES
### Frontend Public
- Clean dan minimalis dengan sentuhan lokal Indonesia
- Header dengan text "Kocheng Jalanan" menggunakan font yang friendly
- Peta mengambil hampir seluruh layar
- Filter bar di bagian atas peta
- Popup detail kucing dengan design card yang rounded
- Warna dominan: warm tones (orange #F97316, cream #FEF3C7, coklat muda)
- Icon dan emoji kucing 🐱 untuk touch visual
### Admin Dashboard
- Layout: Sidebar di kiri, content di kanan
- Logo/text "Kocheng Jalanan Admin" di sidebar
- Sidebar berisi menu navigasi:
  - Dashboard
  - Kelola Kocheng
  - Tambah Kocheng
  - Pengaturan
  - Logout
- Warna profesional: slate/gray dengan aksen orange
- Form input clean dengan label yang jelas
- Tabel dengan zebra striping
- Button dengan hover effects
- Indonesian text untuk semua label dan button
---
## TEXT CONTENT (Bahasa Indonesia)
### Frontend Public
- Title: "Kocheng Jalanan - Peta Kucing Jalanan"
- Filter: "Semua Kocheng", "Sehat", "Sakit", "Butuh Perhatian"
- Popup: "Lokasi", "Status Kesehatan", "Lihat Detail"
### Admin Dashboard
- Login: "Masuk ke Dashboard Admin", "Email", "Password", "Masuk"
- Dashboard: "Selamat Datang", "Total Kocheng", "Sehat", "Sakit", "Butuh Perhatian"
- Form: "Tambah Kocheng Baru", "Nama Kocheng", "Deskripsi", "Pilih Lokasi di Peta", "Simpan", "Batal"
- Table: "Daftar Kocheng", "Nama", "Lokasi", "Status", "Aksi", "Edit", "Hapus"
- Confirmation: "Yakin ingin menghapus data kocheng ini?"
---
## FLOW APLIKASI
### User Public
Buka website "Kocheng Jalanan" → Lihat peta dengan icon kucing → Klik icon → Lihat detail di popup → Bisa filter berdasarkan status
### Admin
Login → Masuk dashboard "Kocheng Jalanan" → Lihat statistik → Ke halaman "Kelola Kocheng" → Tambah/Edit/Hapus kucing → Saat tambah/edit, pilih lokasi di peta dengan klik atau drag marker → Upload foto → Submit → Data tersimpan → Icon otomatis muncul di frontend public
---
## ADDITIONAL FEATURES
### Icon Kucing Custom
- Gunakan emoji 🐱 atau icon SVG kucing
- Warna berbeda untuk status yang berbeda:
  - 🟢 Hijau untuk sehat
  - 🟡 Kuning untuk perlu perhatian
  - 🔴 Merah untuk sakit/kritis
### Mobile Responsive
- Peta tetap full width di mobile
- Filter sebagai dropdown di mobile
- Popup detail menggunakan bottom sheet di mobile
- Admin dashboard sidebar menjadi hamburger menu di mobile
### Error Handling
- Toast notification untuk sukses/error
- Loading state saat fetch data
- Empty state jika belum ada data kucing
- Validation message di form