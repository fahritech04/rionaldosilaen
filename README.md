# Visualisasi Data Pengadaan

Proyek ini merupakan dashboard interaktif berbasis web yang dikembangkan sebagai bagian dari Tugas Akhir / Skripsi oleh:

- **Nama**: RIONALDO FRANSISKUS SILAEN
- **NIM**: 1203220032
- **Perguruan Tinggi**: Universitas Telkom
- **Program Studi**: Sarjana - Teknik Logistik

## Deskripsi Proyek

Dashboard ini dibuat untuk memvisualisasikan data pengadaan dan manajemen stok secara lebih intuitif melalui beberapa modul utama, yaitu Dashboard Utama, Quality Control, FIFO, dan MRP. Proyek ini menampilkan analisis performa vendor, kualitas material, pergerakan stok gudang, serta kebutuhan pengadaan dalam bentuk visual yang mudah dipahami.

## Fitur Utama

- **Tema Dinamis**: Mendukung mode gelap dan terang dengan toggle tema.
- **Responsif**: Tampilan adaptif untuk desktop, tablet, dan mobile.
- **Visualisasi Data Interaktif**: Menggunakan Chart.js untuk menampilkan grafik VPI, performa pengiriman, jumlah pesanan/return, serta MRP/FIFO.
- **Tabel Detail**: Menyajikan data riwayat vendor, log inspeksi QC, log pergerakan FIFO, dan tabel MRP secara terstruktur.
- **Filter dan Navigasi**: Tersedia navigasi antar section serta filter material pada bagian FIFO.
- **Web-Based Dashboard**: Dibangun dengan teknologi web dasar agar ringan, cepat, dan mudah dideploy.

## Struktur Proyek

- **index.html**: Struktur utama halaman dashboard.
- **assets/css/style.css**: Styling UI dengan nuansa modern dan glassmorphism.
- **assets/js/script.js**: Logika tampilan, tema, chart, tabel, serta integrasi data.
- **data/**: Folder data pendukung untuk visualisasi.
- **code.gs**: Script Google Apps Script yang digunakan untuk mengelola data backend.

## Tech Stack

Proyek ini dibangun tanpa framework besar, dengan stack utama sebagai berikut:

- **HTML5**
- **CSS3 (Vanilla)**
- **JavaScript (ES6+)**
- **Chart.js**
- **Google Apps Script**

## Cara Menjalankan Secara Lokal

1. Clone repository ini ke komputer Anda.
2. Buka folder proyek.
3. Jalankan file **index.html** melalui browser, atau gunakan Live Server pada editor Anda untuk pengalaman yang lebih nyaman.

## Sumber Data dari Spreadsheet Google

Ya, dashboard ini mengambil datanya dari Google Spreadsheet melalui Google Apps Script. Alurnya adalah sebagai berikut:

1. Buat atau siapkan Google Spreadsheet yang berisi beberapa sheet sesuai kebutuhan, misalnya:
   - **IMPLEMENTASI AQL**
   - **IMPLEMENTASI FIFO**
   - **IMPLEMENTASI MRP**
   - **DATA RIWAYAT VENDOR**
2. Buka spreadsheet tersebut, lalu pilih menu **Extensions > Apps Script**.
3. Tempelkan kode yang ada pada file **code.gs** ke editor Apps Script.
4. Simpan project Apps Script, lalu lakukan deploy dengan memilih **Deploy > New deployment**.
5. Pilih jenis deployment **Web app**.
6. Atur konfigurasi deployment:
   - **Execute as**: Me
   - **Who has access**: Anyone
7. Setelah deployment berhasil, salin URL web app yang dihasilkan.
8. Tempel URL tersebut ke file **assets/js/script.js** pada variabel **WEB_APP_URL**.
9. Jalankan ulang dashboard, lalu aplikasi akan memanggil URL Apps Script menggunakan fetch untuk mengambil data JSON dari spreadsheet.

Secara teknis, frontend akan menjalankan request ke URL Apps Script, lalu Apps Script akan membaca data dari spreadsheet menggunakan fungsi **SpreadsheetApp** dan mengembalikannya dalam format JSON. Setelah itu, file **assets/js/script.js** akan menampilkan data tersebut ke dalam grafik dan tabel dashboard.

> Jadi, dashboard tidak membaca spreadsheet secara langsung dari browser, tetapi melalui server-side Google Apps Script sebagai jembatan penghubung.

## Live Demo

Proyek ini dapat diakses secara live melalui tautan berikut:
**[https://rionaldosilaen.web.id](https://rionaldosilaen.web.id)**
