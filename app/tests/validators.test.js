const { validateTask } = require('../src/validators');

describe('validateTask - Unit Test', () => {
  test('menolak jika title kosong', () => {
    const result = validateTask({ title: '' });
    expect(result.valid).toBe(false);
  });

  test('menolak jika title tidak dikirim', () => {
    const result = validateTask({});
    expect(result.valid).toBe(false);
  });

  test('menerima jika title valid', () => {
    const result = validateTask({ title: 'Belajar Docker' });
    expect(result.valid).toBe(true);
  });

  test('menolak jika completed bukan boolean', () => {
    const result = validateTask({ title: 'Test', completed: 'ya' });
    expect(result.valid).toBe(false);
  });

  test('menolak jika title lebih dari 255 karakter', () => {
    const result = validateTask({ title: 'a'.repeat(256) });
    expect(result.valid).toBe(false);
  });
});
