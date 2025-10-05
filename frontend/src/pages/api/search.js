import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }

    // Usar OpenAI para gerar dados de comparação de preços mais realistas
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em comparação de preços. 
            Gere dados realistas de produtos para comparação de preços no formato JSON.
            Retorne exatamente 4-6 produtos relacionados à busca do usuário.
            Cada produto deve ter: name, price (em R$), store, url (use # como placeholder), image (use /placeholder-product.jpg), rating (1-5), availability (true/false).
            Use preços brasileiros realistas e lojas conhecidas como Amazon, Mercado Livre, Magazine Luiza, Casas Bahia, etc.`
          },
          {
            role: "user",
            content: `Buscar produtos relacionados a: ${query}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;
      
      // Tentar parsear a resposta da IA como JSON
      let aiResults = [];
      try {
        aiResults = JSON.parse(aiResponse);
      } catch (parseError) {
        console.log('Erro ao parsear resposta da IA, usando fallback');
        throw parseError;
      }

      return res.status(200).json({
        success: true,
        results: aiResults,
        message: 'Resultados gerados com IA',
        source: 'openai'
      });

    } catch (aiError) {
      console.log('OpenAI indisponível, usando dados mock:', aiError.message);
      
      // Fallback com dados mock mais elaborados
      const mockResults = [
        {
          id: 1,
          name: `${query} - Modelo Premium`,
          price: 'R$ 299,90',
          store: 'Amazon',
          url: '#',
          image: '/placeholder-product.jpg',
          rating: 4.5,
          availability: true
        },
        {
          id: 2,
          name: `${query} - Versão Standard`,
          price: 'R$ 199,90',
          store: 'Mercado Livre',
          url: '#',
          image: '/placeholder-product.jpg',
          rating: 4.2,
          availability: true
        },
        {
          id: 3,
          name: `${query} - Edição Especial`,
          price: 'R$ 399,90',
          store: 'Magazine Luiza',
          url: '#',
          image: '/placeholder-product.jpg',
          rating: 4.8,
          availability: false
        },
        {
          id: 4,
          name: `${query} - Básico`,
          price: 'R$ 149,90',
          store: 'Casas Bahia',
          url: '#',
          image: '/placeholder-product.jpg',
          rating: 4.0,
          availability: true
        }
      ];
      
      return res.status(200).json({
        success: true,
        results: mockResults,
        message: 'Resultados de demonstração (IA offline)',
        source: 'mock'
      });
    }
  } catch (error) {
    console.error('Erro na API de search:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
