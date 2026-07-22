const { Pool } = require('pg');

// Konfigurasi pool diambil dari environment variable (.env)
// DATABASE_URL contoh: postgresql://user:password@db:5432/uasdb
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Membuat tabel jika belum ada (idempotent, aman dipanggil berkali-kali)
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      kategori VARCHAR(50) DEFAULT 'Individu',
      nama VARCHAR(100),
      nim VARCHAR(50),
      jurusan VARCHAR(100),
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) DEFAULT 'Individu';
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS nama VARCHAR(100);
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS nim VARCHAR(50);
    ALTER TABLE tasks ADD COLUMN IF NOT EXISTS jurusan VARCHAR(100);
  `);
}

module.exports = { pool, initDb };
