# UAS Cloud Computing — Task Manager REST API (Multi-Container: Docker + Compose + CI/CD)

Aplikasi REST API sederhana untuk mengelola daftar tugas (Task Manager), dibangun dengan
arsitektur multi-container: **Aplikasi (Node.js/Express)** ↔ **Database (PostgreSQL)**,
dikelola dengan **Docker Compose**, dan diuji otomatis melalui **GitHub Actions CI/CD**.

## Arsitektur

```
Pengguna → [App: Node.js/Express, port 3000] → [DB: PostgreSQL, port 5432]
                        │
                        └──> [Adminer: DB Viewer, port 8080] (bonus)
Volume persistent: pgdata  |  Network: uas_network (bridge)
```

## Struktur Folder

```
uas-cloud-computing/
├── app/
│   ├── src/
│   │   ├── app.js            # Factory Express app (endpoint /, /health, /tasks)
│   │   ├── index.js          # Entry point, koneksi DB, start server
│   │   ├── db.js             # Koneksi pool PostgreSQL + init tabel
│   │   ├── validators.js     # Fungsi validasi input (pure function)
│   │   └── routes/
│   │       └── tasks.js      # CRUD routes /tasks
│   ├── tests/
│   │   ├── validators.test.js
│   │   ├── health.test.js
│   │   └── tasks.test.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .github/workflows/ci-cd.yml
└── README.md
```

---

## A. PERSIAPAN AWAL (dilakukan sekali saja)

1. **Install Docker Desktop** (Windows/Mac) atau Docker Engine (Linux)
   https://www.docker.com/products/docker-desktop/
   Cek dengan:
   ```bash
   docker --version
   docker compose version
   ```
2. **Install Git**: https://git-scm.com/downloads
3. **Buat akun GitHub** (jika belum punya): https://github.com
4. **(Opsional untuk development lokal tanpa Docker)** Install Node.js LTS versi 20:
   https://nodejs.org

---

## B. MENJALANKAN PROJECT DARI AWAL

### 1. Salin file environment
```bash
cp .env.example .env
```
Buka `.env`, sesuaikan password jika perlu. **Jangan pernah commit file `.env` ke Git.**

### 2. Build dan jalankan seluruh container
```bash
docker compose up -d --build
```
Perintah ini akan:
- Build image aplikasi dari `app/Dockerfile`
- Menarik image `postgres:16-alpine` dan `adminer`
- Menjalankan 3 container: `uas_app`, `uas_db`, `uas_adminer`
- Membuat volume `pgdata` (persistent) dan network `uas_network`

### 3. Cek status container
```bash
docker compose ps
```
Semua service harus berstatus `Up` / `healthy`.

### 4. Cek log jika ada masalah
```bash
docker compose logs -f app
docker compose logs -f db
```

### 5. Uji aplikasi
```bash
curl http://localhost:3000/
curl http://localhost:3000/health

# Tambah data
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar Docker Compose"}'

# Lihat semua data
curl http://localhost:3000/tasks

# Update data (ganti :id sesuai hasil di atas)
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Belajar Docker Compose","completed":true}'

# Hapus data
curl -X DELETE http://localhost:3000/tasks/1
```
Bisa juga diuji lewat browser/Postman, atau buka Adminer di `http://localhost:8080`
(System: PostgreSQL, Server: db, Username/Password: sesuai `.env`, Database: uasdb).

---

## C. MEMBUKTIKAN PERSISTENT VOLUME (Komponen Wajib #4)

```bash
# 1. Tambahkan beberapa data lewat curl/Postman (lihat langkah B.5)

# 2. Matikan container TANPA menghapus volume
docker compose down

# 3. Nyalakan kembali
docker compose up -d

# 4. Cek data masih ada
curl http://localhost:3000/tasks
```
Jika data masih muncul, itu membuktikan volume `pgdata` bekerja.

Untuk membuktikan sebaliknya (data hilang jika volume dihapus):
```bash
docker compose down -v   # -v akan menghapus volume
docker compose up -d
curl http://localhost:3000/tasks   # akan kosong lagi
```

---

## D. HEALTH CHECK & SIMULASI KETAHANAN LAYANAN (Komponen Wajib #5)

```bash
# Lihat status health dari semua service
docker compose ps

# Simulasi kegagalan: hentikan paksa container app
docker kill uas_app

# Karena restart: unless-stopped, Docker akan otomatis menjalankannya kembali
docker compose ps
docker compose logs app --tail=20
```
Perhatikan perubahan status `health: starting` → `healthy` pada `docker compose ps`.
Ini membuktikan restart policy dan health check bekerja.

---

## E. AUTOMATED TESTING (Komponen Wajib #6)

Dijalankan secara lokal (tanpa perlu Docker, karena database di-mock):
```bash
cd app
npm install
npm test
```
Output yang diharapkan: 3 test suite, 12 test, semua **PASS**
(unit test validasi input, integration test `/health`, integration test CRUD `/tasks`).

---

## F. CI/CD DENGAN GITHUB ACTIONS (Komponen Wajib #7)

### 1. Inisialisasi Git dan push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit: aplikasi, docker, compose, testing, CI/CD"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```
Buka tab **Actions** di GitHub — workflow `CI/CD Pipeline - UAS Cloud Computing` akan
otomatis berjalan (checkout → install dependency → automated test → docker build).

### 2. Membuktikan pipeline GAGAL lalu BERHASIL (wajib dilampirkan)
Contoh termudah, rusak salah satu test dengan sengaja:
```bash
# Edit app/tests/validators.test.js, ubah salah satu expect(...).toBe(true) jadi .toBe(false)
git add .
git commit -m "test: simulasi pipeline gagal"
git push
```
Screenshot/link workflow run yang **merah (failed)** di tab Actions.

Lalu perbaiki kembali:
```bash
# Kembalikan expect(...) ke kondisi semula
git add .
git commit -m "fix: perbaikan test agar pipeline berhasil"
git push
```
Screenshot/link workflow run yang **hijau (success)**.

---

## G. NILAI TAMBAHAN (opsional, tambahan poin kualitas)

- **Adminer** sudah termasuk di `docker-compose.yml` sebagai service ketiga (port 8080).
- **Push image ke registry**: aktifkan bagian yang di-comment pada
  `.github/workflows/ci-cd.yml` (login ke GHCR, lalu build-push dengan tag `${{ github.sha }}`).
- **GitHub Secrets**: jika push ke registry privat/berbayar, simpan kredensial di
  `Settings → Secrets and variables → Actions`, jangan pernah hardcode di kode/workflow.
- **Reverse proxy/Nginx atau replika aplikasi**: bisa ditambahkan sebagai service baru di
  `docker-compose.yml` sesuai kebutuhan pengembangan lanjutan.

---

## H. TROUBLESHOOTING UMUM

| Gejala | Penyebab Umum | Solusi |
|---|---|---|
| `port is already allocated` | Port 3000/5432/8080 sudah dipakai proses lain | Ganti port di `.env` atau matikan proses yang memakai port tsb |
| App container restart terus | DB belum siap saat app start | Sudah ditangani lewat `depends_on: condition: service_healthy` + retry loop di `index.js` |
| `password authentication failed` | `.env` tidak sesuai / belum di-copy | Pastikan `cp .env.example .env` sudah dilakukan dan isinya konsisten |
| Data hilang setelah `docker compose down` | Menjalankan `down -v` (menghapus volume) | Gunakan `docker compose down` saja (tanpa `-v`) untuk mempertahankan data |
| `npm test` gagal karena module not found | `node_modules` belum terinstall | Jalankan `npm install` di dalam folder `app/` |
| Workflow GitHub Actions gagal di step build | Dockerfile path salah / typo | Pastikan struktur folder sama persis seperti di repo ini |

---

## I. PERINTAH RINGKAS (CHEAT SHEET)

```bash
docker compose up -d --build     # build & jalankan semua service
docker compose ps                # cek status & health
docker compose logs -f app       # lihat log aplikasi realtime
docker compose down              # hentikan (data tetap ada)
docker compose down -v           # hentikan + hapus volume (data hilang)
docker --version
docker compose version
```
