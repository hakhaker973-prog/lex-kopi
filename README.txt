LEX KOPI — WEBSITE UMKM
=======================

ISI FILE
- index.html : struktur halaman website
- style.css  : desain minimalis kekinian dan tampilan responsif
- script.js  : katalog, pencarian, filter, keranjang, hitung total, dan WhatsApp

CARA MENJALANKAN
1. Ekstrak file ZIP ke satu folder.
2. Buka folder tersebut.
3. Klik dua kali index.html atau buka file index.html melalui browser (Chrome, Edge, Firefox).
4. Koneksi internet diperlukan untuk membuka font Google dan untuk proses pemesanan WhatsApp. Katalog dan keranjang berjalan secara lokal tanpa database.

PENTING — ATUR NOMOR WHATSAPP
1. Buka file script.js dengan editor teks (Notepad, VS Code, atau editor kode di HP).
2. Cari baris:
   const WHATSAPP_NUMBER = "6281234567890";
3. Ganti 6281234567890 dengan nomor WhatsApp LEX KOPI yang aktif.
   Gunakan kode negara, tanpa tanda +, spasi, atau tanda hubung.
   Contoh format Indonesia: 628xxxxxxxxxx
4. Simpan file lalu muat ulang index.html.

FITUR
- Katalog contoh 10 menu dan harga yang bisa diedit.
- Pencarian nama/deskripsi menu.
- Filter kategori Coffee, Non-Coffee, dan Snack.
- Tambah/kurangi jumlah produk di keranjang.
- Total harga dihitung otomatis.
- Form nama, jenis pesanan, dan catatan.
- Membuka WhatsApp dengan pesan pesanan yang sudah dirangkum.

CATATAN
- Nama menu, deskripsi, dan harga pada proyek ini adalah contoh; sesuaikan dengan menu dan harga asli LEX KOPI.
- Website ini adalah website statis: tidak memerlukan instalasi, server, atau database untuk dijalankan di perangkat sendiri.
- Tombol WhatsApp baru dapat digunakan setelah nomor WhatsApp yang benar diatur. Pelanggan tetap harus menekan tombol Kirim di WhatsApp.
- Untuk dibagikan sebagai tautan internet, unggah folder ini ke layanan hosting statis seperti GitHub Pages atau Netlify. File ZIP ini belum otomatis terbit di internet.
