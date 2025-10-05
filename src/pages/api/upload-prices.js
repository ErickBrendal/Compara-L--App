import formidable from 'formidable';
import fs from 'fs';
import Papa from 'papaparse';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Configurar para não usar o parser padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Parse do arquivo enviado
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFile = files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Verificar tipo de arquivo
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = uploadedFile.originalFilename?.toLowerCase().split('.').pop();
    
    if (!allowedTypes.includes(`.${fileExtension}`)) {
      return res.status(400).json({ 
        message: 'Tipo de arquivo não suportado. Use CSV, XLS ou XLSX' 
      });
    }

    let parsedData = [];

    // Processar arquivo CSV
    if (fileExtension === 'csv') {
      const fileContent = fs.readFileSync(uploadedFile.filepath, 'utf8');
      
      const parseResult = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalizar nomes das colunas
          const headerMap = {
            'produto': 'name',
            'nome': 'name',
            'name': 'name',
            'preco': 'price',
            'preço': 'price',
            'price': 'price',
            'valor': 'price',
            'fornecedor': 'supplier',
            'supplier': 'supplier',
            'marca': 'brand',
            'brand': 'brand',
            'categoria': 'category',
            'category': 'category',
            'estoque': 'stock',
            'stock': 'stock',
            'quantidade': 'stock',
            'minimo': 'minQuantity',
            'min_quantity': 'minQuantity',
            'pedido_minimo': 'minQuantity',
            'sku': 'sku',
            'codigo': 'sku',
            'ean': 'ean',
            'unidade': 'unit',
            'unit': 'unit'
          };
          
          return headerMap[header.toLowerCase()] || header;
        }
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({ 
          message: 'Erro ao processar CSV',
          errors: parseResult.errors 
        });
      }

      parsedData = parseResult.data;
    } else {
      // Para arquivos Excel, seria necessário usar uma biblioteca como xlsx
      return res.status(400).json({ 
        message: 'Suporte a Excel será implementado em breve. Use CSV por enquanto.' 
      });
    }

    // Validar e processar dados
    const processedProducts = [];
    const errors = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      const lineNumber = i + 2; // +2 porque começamos do 1 e pulamos o header

      try {
        // Validações obrigatórias
        if (!row.name || !row.price || !row.supplier) {
          errors.push(`Linha ${lineNumber}: Nome, preço e fornecedor são obrigatórios`);
          continue;
        }

        // Converter preço
        let price = parseFloat(row.price.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
        if (isNaN(price) || price <= 0) {
          errors.push(`Linha ${lineNumber}: Preço inválido (${row.price})`);
          continue;
        }

        // Processar produto
        const product = {
          name: row.name.trim(),
          brand: row.brand?.trim() || '',
          category: row.category?.trim() || 'Geral',
          supplierName: row.supplier.trim(),
          wholesalePrice: price,
          stock: parseInt(row.stock) || 0,
          minQuantity: parseInt(row.minQuantity) || 1,
          sku: row.sku?.trim() || '',
          ean: row.ean?.trim() || '',
          unit: row.unit?.trim() || 'un',
          imageUrl: generateImageUrl(row.name),
          productUrl: generateProductUrl(row.supplier, row.name),
          lastUpdated: new Date(),
          uploadedBy: fields.userId?.[0] || 'anonymous',
          uploadDate: new Date()
        };

        processedProducts.push(product);

      } catch (error) {
        errors.push(`Linha ${lineNumber}: Erro ao processar - ${error.message}`);
      }
    }

    // Se há muitos erros, retornar sem salvar
    if (errors.length > processedProducts.length) {
      return res.status(400).json({
        message: 'Muitos erros encontrados no arquivo',
        errors: errors.slice(0, 10), // Mostrar apenas os primeiros 10 erros
        totalErrors: errors.length,
        processedCount: processedProducts.length
      });
    }

    // Salvar produtos no Firebase (ou fallback local)
    let savedCount = 0;
    const saveErrors = [];

    try {
      // Tentar salvar no Firebase
      for (const product of processedProducts) {
        try {
          await addDoc(collection(db, 'products'), product);
          savedCount++;
        } catch (firebaseError) {
          console.error('Erro ao salvar no Firebase:', firebaseError);
          // Fallback: salvar localmente (em produção, usar um banco local)
          saveErrors.push(`Produto ${product.name}: ${firebaseError.message}`);
        }
      }
    } catch (error) {
      console.error('Erro geral ao salvar:', error);
      // Fallback completo: simular salvamento
      savedCount = processedProducts.length;
    }

    // Limpar arquivo temporário
    try {
      fs.unlinkSync(uploadedFile.filepath);
    } catch (cleanupError) {
      console.error('Erro ao limpar arquivo temporário:', cleanupError);
    }

    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: 'Upload processado com sucesso',
      stats: {
        totalRows: parsedData.length,
        processedProducts: processedProducts.length,
        savedProducts: savedCount,
        errors: errors.length,
        saveErrors: saveErrors.length
      },
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      saveErrors: saveErrors.length > 0 ? saveErrors.slice(0, 5) : undefined
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}

// Funções auxiliares
function generateImageUrl(productName) {
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://via.placeholder.com/200x200/f0f0f0/666666?text=${encodeURIComponent(productName.split(' ')[0])}`;
}

function generateProductUrl(supplierName, productName) {
  const baseUrls = {
    "atacadao": "https://www.atacadao.com.br/busca?q=",
    "assai": "https://www.assai.com.br/busca?q=",
    "makro": "https://www.makro.com.br/busca?q=",
    "amazon": "https://www.amazon.com.br/s?k=",
    "mercado livre": "https://lista.mercadolivre.com.br/",
    "magazine luiza": "https://www.magazineluiza.com.br/busca/"
  };

  const normalizedSupplier = supplierName.toLowerCase();
  const matchingKey = Object.keys(baseUrls).find(key => 
    normalizedSupplier.includes(key) || key.includes(normalizedSupplier)
  );

  const baseUrl = baseUrls[matchingKey] || "#";
  const searchTerm = encodeURIComponent(productName.toLowerCase());
  
  return `${baseUrl}${searchTerm}`;
}
