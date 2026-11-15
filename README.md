# Undangan Pernikahan Hendri & Nina

Website undangan statis (HTML + CSS + JS). Tidak butuh server atau database.

## Isi folder
- `index.html`, `style.css`, `script.js` - halaman undangan
- `gambar-*.jpg/png`, `og-image.jpg`, `musik.mp3` - aset
- `apps-script/Code.gs` - backend opsional untuk menampilkan ucapan (Google Sheet)

## Link per tamu
Tambahkan nama tamu di akhir link dengan `?to=`:

```
https://domain-anda/index.html?to=Bapak%20Budi%20%26%20Keluarga
```

Spasi ditulis `%20`, tanda `&` ditulis `%26`. Nama otomatis tampil di sampul dan terisi di form RSVP.

## Mengaktifkan Ucapan & RSVP (Google Sheet)
Tanpa langkah ini, tombol WhatsApp tetap berfungsi, hanya daftar ucapan tidak tampil.

1. Buka https://sheets.google.com, buat Spreadsheet baru (nama bebas).
2. Menu **Ekstensi > Apps Script**. Hapus isi bawaan, lalu tempel seluruh isi `apps-script/Code.gs`. Simpan.
3. Klik **Deploy > Deployment baru > jenis: Aplikasi web**.
   - Jalankan sebagai: **Saya**
   - Siapa yang memiliki akses: **Siapa saja**
4. Klik **Deploy**, setujui izin yang diminta, lalu salin **URL aplikasi web** (berakhiran `/exec`).
5. Buka `script.js`, cari `var GB_URL='';`, isi dengan URL tadi:
   `var GB_URL='https://script.google.com/macros/s/XXXX/exec';`
6. Upload ulang `script.js`. Selesai.

Setiap RSVP/ucapan masuk ke sheet **Ucapan** (Waktu, Nama, Kehadiran, Ucapan). Untuk menyembunyikan ucapan yang tidak pantas, isi huruf `x` di kolom **Sembunyikan**. Setelah mengubah `Code.gs` di kemudian hari, buat **Deployment baru** agar perubahan berlaku.

## Hosting di Vercel
1. Upload folder ini ke GitHub (atau pakai Vercel CLI: `vercel --prod` di dalam folder).
2. Di vercel.com pilih **Add New > Project**, impor repositori, lalu **Deploy**. Framework pilih **Other**, tanpa build command.
3. `.vercelignore` sudah menyembunyikan `apps-script/` dan `README.md` dari situs publik.
4. Setiap kali `script.js` atau file lain diubah dan di-push, Vercel otomatis memperbarui situs.

## Preview WhatsApp
`og:image` dan `og:url` di `index.html` sudah mengarah ke https://undanganhendri-nina.vercel.app/. Jika domain berubah, ganti kedua baris itu. Setelah deploy, coba kirim link ke diri sendiri. Jika preview lama masih muncul, tambahkan `?v=2` di akhir link.
