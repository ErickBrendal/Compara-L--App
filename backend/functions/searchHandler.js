const { askOpenAI } = require('./openaiHandler');

async function searchHandler(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    console.log(`Buscando: ${query}`);

    // Buscar com IA
    const aiPrompt = `Você é um assistente de comparação de preços. 
    O usuário está buscando por: "${query}".
    Retorne uma lista de 3 produtos similares com preços realistas no formato JSON:
    [
      {
        "product": "nome do produto",
        "description": "descrição breve",
        "price": preço_numerico,
        "oldPrice": preço_anterior_opcional,
        "supplier": "fornecedor",
        "stock": quantidade_em_estoque
      }
    ]`;

    const aiResponse = await askOpenAI(aiPrompt);
    
    // Parse da resposta da IA
    let results = [];
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', parseError);
    }

    // Se a IA não retornar resultados válidos, usar mock
    if (results.length === 0) {
      results = [
        {
          product: `${query} - Produto 1`,
          description: 'Produto de alta qualidade',
          price: 29.90,
          oldPrice: 39.90,
          supplier: 'Fornecedor A',
          stock: 150
        },
        {
          product: `${query} - Produto 2`,
          description: 'Melhor custo-benefício',
          price: 25.50,
          supplier: 'Fornecedor B',
          stock: 200
        },
        {
          product: `${query} - Produto 3`,
          description: 'Produto premium',
          price: 35.00,
          oldPrice: 45.00,
          supplier: 'Fornecedor C',
          stock: 80
        }
      ];
    }

    res.json({ results, query });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro ao processar busca', details: error.message });
  }
}

module.exports = { searchHandler };
