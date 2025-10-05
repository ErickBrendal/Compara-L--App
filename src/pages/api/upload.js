import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const form = formidable({
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Tipo de arquivo não suportado. Use CSV ou XLSX.' 
      });
    }

    let data = [];

    if (file.mimetype === 'text/csv') {
      // Processar CSV
      data = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(file.filepath)
          .pipe(csv())
          .on('data', (row) => results.push(row))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else {
      // Processar XLSX
      const workbook = XLSX.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    }

    // Limpar arquivo temporário
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: 'Arquivo processado com sucesso',
      data: data.slice(0, 100), // Limitar a 100 registros para demo
      total: data.length,
      filename: file.originalFilename
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar arquivo',
      details: error.message 
    });
  }
}
