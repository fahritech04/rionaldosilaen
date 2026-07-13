# Product Requirements Document (PRD) & Development Guidelines
## Project: Visualisasi Dashboard

### 1. Overview
Dashboard visualisasi data interaktif yang menampilkan performa vendor, sisa stok, dan analitik pengiriman. Dibangun menggunakan arsitektur web statis yang super ringan (Vanilla HTML, CSS, JS) agar dapat di-*deploy* langsung melalui GitHub Pages dengan performa maksimal.

### 2. Tech Stack
- **HTML5**: Struktur semantik dan aksesibilitas.
- **CSS3**: Vanilla CSS dengan Custom Properties (Variables), Flexbox/Grid modern, dan pendekatan Mobile-First.
- **JavaScript (ES6+)**: Logika UI, manajemen status (tema Dark/Light), dan manipulasi DOM secara efisien.
- **Library Tambahan**: Chart.js (via CDN) untuk rendering visualisasi data grafis.

### 3. Design System & UI/UX
- **Tipografi**: *Space Grotesk* (untuk teks utama/body) & *DM Serif Display* (untuk judul/heading).
- **Tema (Theming)**: Mendukung penuh peralihan *Dark Mode* dan *Light Mode*. Status tema harus disimpan secara lokal (*Local Storage*) agar persisten.
- **Estetika (Look & Feel)**: Menggunakan efek *Glassmorphism* yang dioptimalkan, bayangan elegan, kartu (cards) bersudut melengkung, dan transisi animasi mulus (*smooth entry animations*).
- **Responsivitas**: Tata letak wajib merespons dari ukuran smartphone terkecil hingga layar monitor besar (desktop) menggunakan `clamp()` dan grid dinamis.

### 4. Golden Rules for Developers & AI Agents (Wajib Dipatuhi!)
Aturan baku untuk setiap penambahan fitur atau modifikasi kode di masa depan:

1. **Read Before Write (Baca Sebelum Eksekusi)**
   - Wajib membaca, menelusuri, dan memahami seluruh isi kode yang sudah ada (terutama `script.js` dan `style.css`) sebelum merancang dan menulis kode baru. Jangan berasumsi.

2. **D.R.Y (Don't Repeat Yourself) & Code Reuse**
   - Dilarang keras melakukan duplikasi kode (hardcoding).
   - Jika sebuah elemen UI, logika manipulasi, atau konfigurasi data (seperti pengaturan opsi Chart) digunakan lebih dari satu kali, ia **wajib** dipisahkan menjadi fungsi tunggal (*Reusable Function*) atau objek terpusat.
   - Panggil fungsi tersebut, jangan meniru ulang baris kodenya.

3. **Clean Code & Data-Driven**
   - Strukturkan kode dengan pendekatan *Data-Driven*. Pisahkan antara Data (seperti Array/Objek konfigurasi) dan Eksekutor (*Loop function* yang mengeksekusi data tersebut).
   - Berikan komentar singkat yang informatif pada setiap blok fungsi utama.

4. **Lightweight & High Performance**
   - Prioritaskan *GPU Rendering* pada perangkat *mobile* (HP). 
   - Hindari animasi yang memicu proses cat-ulang (*repaint/reflow*) berat secara terus-menerus, seperti transisi warna/gambar latar yang masif.
   - Gunakan *Hardware Acceleration* (`will-change: transform, opacity`) dengan bijak khusus untuk elemen yang akan dianimasikan. Turunkan nilai *blur* (`backdrop-filter`) pada ukuran layar kecil.

5. **Vanilla Dependency**
   - Jaga kemurnian kode. Dilarang menginstal atau menyisipkan *framework* tambahan (seperti Tailwind, Bootstrap, React, jQuery) kecuali atas perintah eksplisit dari pemilik proyek. Semua harus bisa berjalan murni di peramban web dasar.
