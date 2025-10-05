const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configurar multer para upload
const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.xlsx') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .csv e .xlsx são permitidos'));
    }
  }
});

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

function parseXLSX(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

async function uploadHandler(req, res) {
  const uploadMiddleware = upload.single('file');

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    try {
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();

      let data = [];

      if (ext === '.csv') {
        data = await parseCSV(filePath);
      } else if (ext === '.xlsx') {
        data = parseXLSX(filePath);
      }

      // Limpar arquivo temporário
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        rows: data.length,
        columns: data.length > 0 ? Object.keys(data[0]) : [],
        preview: data.slice(0, 5),
        message: 'Arquivo processado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      res.status(500).json({ error: 'Erro ao processar arquivo', details: error.message });
    }
  });
}

module.exports = { uploadHandler };
