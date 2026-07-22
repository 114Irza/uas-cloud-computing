const express = require('express');
const path = require('path');
const createTasksRouter = require('./routes/tasks');

function createApp(pool) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));

  // Health check endpoint -> dipakai Docker HEALTHCHECK & GitHub Actions
  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(503).json({ status: 'error', database: 'disconnected', detail: err.message });
    }
  });

  app.get('/', (req, res) => {
    res.json({ message: 'UAS Cloud Computing API is running', endpoints: ['/health', '/tasks'] });
  });

  app.use('/tasks', createTasksRouter(pool));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
  });

  return app;
}

module.exports = createApp;
