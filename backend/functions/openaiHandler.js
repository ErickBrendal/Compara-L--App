const fetch = require('node-fetch');

async function askOpenAI(prompt) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OPENAI_API_KEY não configurada, usando resposta mock');
      return JSON.stringify([
        {
          product: 'Produto Mock',
          description: 'Descrição gerada automaticamente',
          price: 29.90,
          supplier: 'Fornecedor Mock',
          stock: 100
        }
      ]);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em comparação de preços. Sempre retorne respostas em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    // Retornar resposta mock em caso de erro
    return JSON.stringify([
      {
        product: 'Produto Exemplo',
        description: 'Descrição do produto',
        price: 29.90,
        supplier: 'Fornecedor Exemplo',
        stock: 100
      }
    ]);
  }
}

module.exports = { askOpenAI };
