# PRD: Habit & Routine Tracker — Web Dashboard

## 1. Ringkasan

Web dashboard sebagai *source of truth* untuk sistem habit/routine tracker. Menampilkan streak habit dalam bentuk grid ala GitHub contribution graph (referensi: Habitkit), dan daftar to-do yang bisa di-check baik dari desktop maupun HP (mobile web). To-do item utamanya dibuat dari popup "force habit" Quickshell saat menyalakan laptop di hari itu (Arch + niri + Noctalia); web ini berfungsi sebagai konsumen, tempat checking-off harian, dan monitoring progres visual.

**Bukan bagian dari scope ini:** Quickshell popup itu sendiri, detection unlock event di OS, sync/offline queue di client laptop, serta native mobile app (cukup mobile-responsive web). Web ini murni backend API + dashboard web (desktop & mobile-friendly).

## 2. Masalah & Tujuan

- Ingin membangun rutinitas to-do harian dengan momen **"force habit" saat pertama kali menyalakan/unlock laptop di hari itu** (ditangani popup Quickshell di desktop).
- Butuh fleksibilitas untuk **melihat dan check-off to-do list dari HP** saat sedang mobile / tidak di depan laptop.
- Butuh cara untuk *melihat progres* habit dari waktu ke waktu secara visual — bukan cuma angka, tapi pola konsistensi (gap, streak length) seperti commit graph.
- To-do yang ditulis di popup laptop harus tersinkronisasi ke backend sehingga bisa dicek/dikelola dari mana saja (desktop web & mobile web).

## 3. User & Akses

- Single user (Zharfan) untuk versi awal. Tidak perlu multi-user/auth kompleks di MVP — tapi API tetap didesain dengan `user_id` supaya mudah di-extend nanti.
- Akses dashboard dari laptop dan HP melalui jaringan lokal / Tailscale ke home server.

## 4. Scope Fitur

### 4.1 Habit Streak View (prioritas utama)
- Tampilkan daftar habit yang di-track.
- Tiap habit punya grid visual ala GitHub contribution graph: satu sel = satu hari, warna/intensitas menunjukkan check-in (done/tidak, atau intensitas jika habit punya "count").
- Menampilkan current streak (hari berturut-turut) dan longest streak per habit.
- Klik/tap sel di grid → toggle check-in untuk tanggal tersebut (memungkinkan koreksi manual dari desktop maupun HP).

### 4.2 To-Do List (Desktop & Mobile Checking)
- **Sumber Utama:** Input dibuat melalui popup force-habit Quickshell saat laptop baru dinyalakan. (Web tetap menyediakan tombol tambah manual sebagai opsi/fallback).
- **Checking-off:** Checkbox / touch-friendly tap untuk menandai to-do selesai langsung dari HP atau desktop web.
- **Grouping:** Berdasarkan tanggal dibuat (misal "Hari ini", "Kemarin", atau by-date).
- **Auto-archive/Collapse:** To-do yang sudah selesai tidak menumpuk terus di view utama (auto-collapse/archive setelah N hari).

### 4.3 Mobile-Responsive Experience
- Antarmuka web dioptimalkan untuk layar HP (mobile-friendly layout, touch target yang nyaman untuk check-off to-do & habit check-in).
- Cepat diakses via browser HP (atau Add to Home Screen / PWA minimal).

### 4.4 Habit Management (CRUD dasar)
- Tambah/edit/nonaktifkan habit (nama, deskripsi opsional, tipe: boolean check atau count-based).
- Tidak perlu fitur canggih (kategori, reminder kompleks, dsb) di MVP.

### 4.5 iOS Widget Readiness (API Support)
- Backend menyediakan endpoint ringkas (*widget-friendly endpoint*) yang menyajikan data to-do hari ini dan status/streak habit dalam satu payload ringan.
- Memungkinkan integrasi widget iOS di masa depan / fase lanjutan menggunakan **Scriptable** (JavaScript widget di iOS), **iOS Shortcuts**, ataupun native WidgetKit tanpa perlu query berulang-ulang.

## 5. Out of Scope (MVP)

- Native mobile app (Android/iOS apk/ipa) — gunakan responsive mobile web (PWA).
- Pembuatan widget iOS native/Scriptable lengkap (fokus MVP adalah menyediakan **Widget-ready API**; script/app widget client dikembangkan bertahap).
- Push notification / reminder di HP (fokus checking dan tracking).
- Multi-user & auth kompleks (cukup proteksi via network/Tailscale atau basic API token).
- Analytics lanjutan (korelasi antar habit, AI insight, dsb).
- Popup Quickshell & mekanisme unlock-trigger di Linux OS (project terpisah di client laptop).

## 6. Kontrak API (draft)

Web app, popup Quickshell, dan iOS Widget mengonsumsi backend API yang sama:

```
GET    /api/habits                    → list habit + ringkasan streak
GET    /api/habits/:id/checkins       → checkin history (untuk render grid)
POST   /api/habits/:id/checkins       → toggle checkin tanggal tertentu
POST   /api/habits                    → buat habit baru
PATCH  /api/habits/:id                → edit/nonaktifkan habit

GET    /api/todos                     → list todo (filter tanggal/status)
POST   /api/todos                     → buat todo (dipakai oleh popup Quickshell / fallback web)
PATCH  /api/todos/:id                 → toggle status selesai (check-off dari HP/desktop)

GET    /api/widgets/today             → payload ringkas untuk iOS Widget (Scriptable/Shortcuts):
                                         - todos: list todo hari ini & status is_done
                                         - habits: list habit aktif + streak + status check-in hari ini + mini history
```

Streak (current/longest) dihitung server-side dari tabel checkin untuk menghindari drift dan memudahkan koreksi manual dari grid.

## 7. Data Model (draft)

```
habits (id, user_id, name, description, type[boolean|count], is_active, created_at)
habit_checkins (id, habit_id, checked_at DATE, value INT DEFAULT 1, created_at)
todos (id, user_id, title, source[popup|web], is_done, created_at, done_at)
```

`habit_checkins.checked_at` bertipe DATE (bukan timestamp) agar 1 hari = 1 sel grid tanpa kerancuan timezone/jam.

## 8. Pertimbangan Teknis

- **Backend:** **Hono** (menggunakan Node.js runtime / `@hono/node-server`) + **Drizzle ORM** + **PostgreSQL**.
  - *Alasan:* Home server (ThinkPad X200) memiliki keterbatasan kompatibilitas instruksi CPU pada Bun runtime, sedangkan Node.js + Hono berjalan stabil, sangat ringan, cepat (*low overhead*), dan memiliki developer experience modern berbasis TypeScript.
- **Frontend:** Responsive Web App (Next.js / Vite + React dengan CSS modern) dengan layout desktop dan mobile yang dioptimalkan untuk touch interaction.
- **Grid contribution-style:** Custom SVG / CSS grid responsif yang tetap rapi dilihat di layar mobile (scroll horizontal atau adaptif) dan desktop.
- **iOS Widget Integration:** Karena backend diakses via Tailscale / LAN, widget iOS paling praktis dan powerful dibuat menggunakan aplikasi **Scriptable** (menjalankan JavaScript lokal di iOS untuk fetch `/api/widgets/today` dan merender native iOS widget medium/large).
- **Deployment:** Dockerized di home server (ThinkPad X200) diakses via Tailscale.

## 9. Open Questions / Detail Lanjutan

1. **Frontend Architecture:** Apakah backend Hono dibuat terpisah (standalone API) dengan frontend Vite/Next.js, atau monorepo?
2. **Mobile Grid View:** Di layar HP, apakah grid streak ditampilkan 3-6 bulan terakhir dengan scroll horizontal, atau compact mini-dots?
3. **Todo Auto-archive:** Berapa hari to-do yang sudah `is_done = true` tetap tampil sebelum masuk tab arsip/tersembunyi (misal: 1 hari / hanya hari ini)?
4. **iOS Widget Implementation:** Apakah untuk widget iOS di awal menggunakan script **Scriptable** (sangat cepat di-setup tanpa Apple Developer Account/Xcode) atau native Swift?