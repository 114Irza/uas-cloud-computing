const request = require('supertest');
const createApp = require('../src/app');

describe('GET /health - Integration Test', () => {
  test('mengembalikan status ok ketika database terkoneksi', async () => {
    const mockPool = { query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }) };
    const app = createApp(mockPool);

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('mengembalikan status error ketika database gagal terkoneksi', async () => {
    const mockPool = { query: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const app = createApp(mockPool);

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('error');
  });
});
