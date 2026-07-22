const express = require('express');
const { validateTask } = require('../validators');

// Router menerima `pool` lewat parameter agar mudah di-mock saat testing
function createTasksRouter(pool) {
  const router = express.Router();

  // CREATE - tambah data
  router.post('/', async (req, res) => {
    const { valid, error } = validateTask(req.body);
    if (!valid) return res.status(400).json({ error });

    try {
      const {
        title,
        kategori = 'Individu',
        nama = '',
        nim = '',
        jurusan = '',
        completed = false
      } = req.body;
      const result = await pool.query(
        'INSERT INTO tasks (title, kategori, nama, nim, jurusan, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, kategori, nama, nim, jurusan, completed]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Gagal menyimpan data', detail: err.message });
    }
  });

  // READ - tampilkan semua data
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Gagal mengambil data', detail: err.message });
    }
  });

  // READ - tampilkan satu data
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task tidak ditemukan' });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Gagal mengambil data', detail: err.message });
    }
  });

  // UPDATE - ubah data
  router.put('/:id', async (req, res) => {
    try {
      const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
      if (existing.rows.length === 0) return res.status(404).json({ error: 'Task tidak ditemukan' });

      const current = existing.rows[0];
      const newTitle = req.body.title !== undefined ? req.body.title : current.title;
      const newKategori = req.body.kategori !== undefined ? req.body.kategori : current.kategori;
      const newNama = req.body.nama !== undefined ? req.body.nama : current.nama;
      const newNim = req.body.nim !== undefined ? req.body.nim : current.nim;
      const newJurusan = req.body.jurusan !== undefined ? req.body.jurusan : current.jurusan;
      const newCompleted = req.body.completed !== undefined ? req.body.completed : current.completed;

      const payloadToValidate = {
        title: newTitle,
        kategori: newKategori,
        nama: newNama,
        nim: newNim,
        jurusan: newJurusan,
        completed: newCompleted
      };

      const { valid, error } = validateTask(payloadToValidate);
      if (!valid) return res.status(400).json({ error });

      const result = await pool.query(
        'UPDATE tasks SET title = $1, kategori = $2, nama = $3, nim = $4, jurusan = $5, completed = $6 WHERE id = $7 RETURNING *',
        [newTitle, newKategori, newNama, newNim, newJurusan, newCompleted, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Gagal memperbarui data', detail: err.message });
    }
  });

  // DELETE - hapus data
  router.delete('/:id', async (req, res) => {
    try {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Task tidak ditemukan' });
      res.json({ message: 'Task berhasil dihapus', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: 'Gagal menghapus data', detail: err.message });
    }
  });

  return router;
}

module.exports = createTasksRouter;
