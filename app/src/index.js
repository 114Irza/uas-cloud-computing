require('dotenv').config();
const { pool, initDb } = require('./db');
const createApp = require('./app');

const PORT = process.env.APP_PORT || 3000;

async function start() {
  let retries = 10;
  // Retry loop -> menunggu database siap saat container baru pertama kali start
  while (retries > 0) {
    try {
      await initDb();
      console.log('Berhasil terkoneksi ke database & tabel siap.');
      break;
    } catch (err) {
      retries -= 1;
      console.log(`Menunggu database siap... (${retries} percobaan tersisa)`, err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const app = createApp(pool);
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

start();
