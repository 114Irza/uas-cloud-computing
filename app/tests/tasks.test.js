const request = require('supertest');
const createApp = require('../src/app');

function buildMockPool() {
  return {
    query: jest.fn(),
  };
}

describe('CRUD /tasks - Integration Test', () => {
  test('POST /tasks membuat data baru', async () => {
    const mockPool = buildMockPool();
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'Belajar Compose', completed: false }],
    });
    const app = createApp(mockPool);

    const res = await request(app).post('/tasks').send({ title: 'Belajar Compose' });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Belajar Compose');
  });

  test('POST /tasks menolak title kosong (validasi)', async () => {
    const mockPool = buildMockPool();
    const app = createApp(mockPool);

    const res = await request(app).post('/tasks').send({ title: '' });

    expect(res.statusCode).toBe(400);
  });

  test('GET /tasks mengembalikan daftar task', async () => {
    const mockPool = buildMockPool();
    mockPool.query.mockResolvedValueOnce({
      rows: [{ id: 1, title: 'Belajar Compose', completed: false }],
    });
    const app = createApp(mockPool);

    const res = await request(app).get('/tasks');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /tasks/:id mengembalikan 404 jika tidak ditemukan', async () => {
    const mockPool = buildMockPool();
    mockPool.query.mockResolvedValueOnce({ rows: [] });
    const app = createApp(mockPool);

    const res = await request(app).get('/tasks/999');

    expect(res.statusCode).toBe(404);
  });

  test('DELETE /tasks/:id menghapus data', async () => {
    const mockPool = buildMockPool();
    mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1, title: 'Belajar Compose' }] });
    const app = createApp(mockPool);

    const res = await request(app).delete('/tasks/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/berhasil dihapus/);
  });
});
