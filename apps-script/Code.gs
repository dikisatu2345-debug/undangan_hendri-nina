/**
 * Backend ucapan & RSVP undangan Hendri & Nina.
 * Data disimpan di Google Sheet (tidak perlu database / server).
 * Cara pasang: lihat README.md bagian "Mengaktifkan Ucapan & RSVP".
 */
var SHEET_NAME = 'Ucapan';
var HEADERS = ['Waktu', 'Nama', 'Kehadiran', 'Ucapan', 'Sembunyikan (isi x)'];
var MAX_TAMPIL = 100;   // jumlah ucapan terbaru yang dikirim ke halaman
var STATUS_OK = ['Insya Allah hadir', 'Mohon maaf, belum bisa hadir', 'Masih ragu'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Hindari "formula injection" di Google Sheet (teks yang diawali = + - @)
function clean_(v, max) {
  v = String(v == null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

// Menampilkan ucapan (hanya yang ada isi ucapan & tidak disembunyikan), terbaru di atas
function doGet(e) {
  var rows = sheet_().getDataRange().getValues().slice(1);
  var items = [];
  for (var i = rows.length - 1; i >= 0 && items.length < MAX_TAMPIL; i--) {
    var r = rows[i];
    if (!r[1] || !r[3]) continue;
    if (String(r[4]).toLowerCase() === 'x') continue;
    items.push({ t: new Date(r[0]).getTime(), n: r[1], s: r[2], m: r[3] });
  }
  return json_({ ok: true, items: items });
}

// Menerima RSVP / ucapan baru
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true });          // honeypot: bot terdeteksi
    var n = clean_(d.n, 60), m = clean_(d.m, 500);
    var s = STATUS_OK.indexOf(d.s) >= 0 ? d.s : '';
    if (!n) return json_({ ok: false, error: 'nama kosong' });
    sheet_().appendRow([new Date(), n, s, m, '']);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
