const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { searchHandler } = require('./searchHandler');
const { uploadHandler } = require('./uploadHandler');

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => {
  res.json({
    message: 'Compara-Lá API - Backend',
    version: '1.0.0',
    status: 'online'
  });
});

app.post('/search', searchHandler);
app.post('/upload', uploadHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Exportar como Firebase Function
exports.api = functions.https.onRequest(app);

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}
