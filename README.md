# PHANTOM TRACKER // All-Out Routine & Habit System

Web dashboard habit & routine tracker sebagai *source of truth* terpusat yang terintegrasi dengan popup Quickshell (Arch Linux) dan iOS Widget (Scriptable). Didesain dengan estetika **Neo-Brutalism Persona 5** (Crimson Red `#ff1744`, Phantom Black `#08080a`, Comic Yellow `#ffe600`), ditenagai oleh **Hono (Node.js)** backend, **Drizzle ORM + PostgreSQL** (dengan local JSON fallback), serta **React + Vite** frontend yang responsif di HP, tablet, dan desktop.

---

## Fitur Utama

- **Neo-Brutalism Persona 5 Aesthetic:** Kontras tinggi, hard offset shadows, border tegas, badge miring, dan ikon vektor SVG presisi.
- **Habit Streak Contribution Grid:** Heat map visual ala GitHub / Habitkit dengan intensitas merah gradasi, touch-friendly swipe di mobile, dan koreksi riwayat manual per sel.
- **To-Do Missions List:** Dikelompokkan berdasarkan "Hari Ini", "Kemarin", "Sebelumnya", dengan badge sumber (`POPUP FORCE HABIT` vs `WEB`).
- **iOS Widget (Scriptable Companion):** Endpoint `GET /api/widgets/today` siap pakai beserta script JavaScript untuk aplikasi Scriptable di iOS Home Screen.
- **Mobile-First & Touch-Friendly:** Fixed bottom navigation bar di HP, single-hand touch ergonomics, full-width check button.
- **Lightweight & Fast:** Menggunakan framework Hono pada Node.js runtime tanpa ketergantungan Bun (kompatibel penuh dengan home server ThinkPad X200).

---

## Tech Stack

- **Backend:** Hono (`@hono/node-server`) + Drizzle ORM + PostgreSQL (`postgres.js`) + Local File Store Fallback
- **Frontend:** React 18 + TypeScript + Vite + Custom Neo-Brutalist CSS System + Lucide Icons + date-fns
- **Port:** Default `5050`

---

## Cara Menjalankan

### 1. Local Development
```bash
# Install dependencies
npm install

# Jalankan server API & Frontend (Hono + Static / Dev)
npm run dev:server
```
Buka browser di `http://localhost:5050`.

### 2. Docker Compose Deployment (Home Server / Tailscale)
```bash
docker compose up -d --build
```
Aplikasi berjalan di port `5050` dan PostgreSQL internal di port `5435`.

---

## API Endpoints

- `GET /api/health` — Health check
- `GET /api/habits` — List active habits + streaks
- `GET /api/habits/:id` — Habit detail + 365-day grid
- `POST /api/habits` — Create new habit
- `PATCH /api/habits/:id` — Update habit
- `DELETE /api/habits/:id` — Delete habit
- `POST /api/habits/:id/checkins` — Toggle check-in on date `YYYY-MM-DD`
- `GET /api/todos` — List to-do items
- `POST /api/todos` — Create to-do (`source: "popup"` or `"web"`)
- `PATCH /api/todos/:id` — Toggle done / edit title
- `DELETE /api/todos/:id` — Delete to-do
- `GET /api/widgets/today` — Summary payload for iOS Scriptable Widget

---

## Panduan iOS Widget (Scriptable)

1. Unduh aplikasi **Scriptable** dari iOS App Store di iPhone.
2. Salin seluruh isi file [`scripts/ios-widget-scriptable.js`](./scripts/ios-widget-scriptable.js).
3. Buat script baru di Scriptable dan paste kodenya.
4. Ganti `SERVER_URL` dengan alamat IP Tailscale/LAN home server Anda (misal `http://100.x.x.x:5050/api/widgets/today`).
5. Pasang widget Scriptable di Home Screen iPhone (pilih ukuran Medium atau Large).
