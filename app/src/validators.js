/**
 * Validasi input untuk task.
 * Fungsi ini sengaja dibuat pure function (tanpa dependency DB)
 * agar mudah diuji dengan automated testing.
 */
function validateTask(data) {
  if (!data) {
    return { valid: false, error: 'Data request tidak boleh kosong.' };
  }
  // Auto-fill title from nama if title is not provided
  if (!data.title && data.nama && typeof data.nama === 'string' && data.nama.trim().length > 0) {
    data.title = `${data.nama.trim()}${data.nim ? ' (' + data.nim.trim() + ')' : ''}`;
  }
  if (typeof data.title !== 'string' || data.title.trim().length === 0) {
    return { valid: false, error: 'Field "title" atau "nama" wajib diisi dan berupa string non-kosong.' };
  }
  if (data.title.length > 255) {
    return { valid: false, error: 'Field "title" maksimal 255 karakter.' };
  }
  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    return { valid: false, error: 'Field "completed" harus bertipe boolean.' };
  }
  return { valid: true, error: null };
}

module.exports = { validateTask };
