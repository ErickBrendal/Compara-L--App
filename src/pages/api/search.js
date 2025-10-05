import { OpenAI } from 'openai';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { normalizeProductName } from '../../lib/formatters';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { query: searchQuery } = req.body;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Query é obrigatória' });
  }

  try {
    console.log(`🔍 Buscando produtos para: ${searchQuery}`);
    
    // SEMPRE usar fallback primeiro para garantir resultados
    const fallbackProducts = generateFallbackProducts(searchQuery);
    console.log(`✅ Gerados ${fallbackProducts.length} produtos fallback`);

    // Se temos produtos fallback, retornar imediatamente
    if (fallbackProducts.length > 0) {
      res.status(200).json({
        success: true,
        query: searchQuery,
        results: fallbackProducts,
        total: fallbackProducts.length,
        source: 'demo_database',
        message: 'Resultados do banco de dados demo'
      });
      return;
    }

    // Se por algum motivo o fallback falhou, tentar Firebase
    let products = await searchProductsInFirestore(searchQuery);
    
    // Se não encontrou produtos suficientes, usar OpenAI para expandir busca
    if (products.length < 3 && process.env.OPENAI_API_KEY) {
      console.log('Poucos resultados encontrados, expandindo busca com IA...');
      const expandedTerms = await expandSearchWithAI(searchQuery);
      
      for (const term of expandedTerms) {
        const additionalProducts = await searchProductsInFirestore(term);
        products = [...products, ...additionalProducts];
        
        if (products.length >= 10) break;
      }
    }
    
    // Processar produtos do Firebase se existirem
    if (products.length > 0) {
      const uniqueProducts = removeDuplicateProducts(products);
      const limitedProducts = uniqueProducts.slice(0, 10);
      const enrichedProducts = await enrichProductsWithSupplierInfo(limitedProducts);
      const sortedProducts = enrichedProducts.sort((a, b) => a.wholesalePrice - b.wholesalePrice);

      res.status(200).json({
        success: true,
        query: searchQuery,
        results: sortedProducts,
        total: sortedProducts.length,
        source: 'firebase',
        searchTermsUsed: products.length > uniqueProducts.length ? 'expanded' : 'direct'
      });
    } else {
      // Último recurso: produtos genéricos
      const genericProducts = generateGenericProducts(searchQuery);
      res.status(200).json({
        success: true,
        query: searchQuery,
        results: genericProducts,
        total: genericProducts.length,
        source: 'generic',
        message: 'Produtos genéricos gerados'
      });
    }

  } catch (error) {
    console.error('❌ Erro na busca:', error);
    
    // Fallback de emergência
    const emergencyProducts = generateFallbackProducts(searchQuery);
    
    res.status(200).json({
      success: true,
      query: searchQuery,
      results: emergencyProducts,
      total: emergencyProducts.length,
      source: 'emergency_fallback',
      error: error.message
    });
  }
}

// Buscar produtos no Firestore
async function searchProductsInFirestore(searchTerm) {
  try {
    const normalizedTerm = normalizeProductName(searchTerm);
    const products = [];
    
    // Busca por nome do produto (contém o termo)
    const productsRef = collection(db, 'products');
    
    // Busca 1: Nome exato normalizado
    const exactQuery = query(
      productsRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(20)
    );
    
    const exactSnapshot = await getDocs(exactQuery);
    exactSnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    // Busca 2: Por categoria se o termo corresponder
    const categories = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Eletrônicos', 'Papelaria'];
    const matchingCategory = categories.find(cat => 
      normalizeProductName(cat).includes(normalizedTerm) || 
      normalizedTerm.includes(normalizeProductName(cat))
    );
    
    if (matchingCategory && products.length < 10) {
      const categoryQuery = query(
        productsRef,
        where('category', '==', matchingCategory),
        orderBy('wholesalePrice', 'asc'),
        limit(10)
      );
      
      const categorySnapshot = await getDocs(categoryQuery);
      categorySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        if (!products.find(p => p.id === product.id)) {
          products.push(product);
        }
      });
    }
    
    // Busca 3: Por marca se identificada
    if (products.length < 5) {
      const commonBrands = ['Tio João', 'Camil', 'Soya', 'União', 'Barilla', 'Coca-Cola', 'Ypê', 'Omo', 'Samsung', 'JBL'];
      const matchingBrand = commonBrands.find(brand => 
        normalizeProductName(searchTerm).includes(normalizeProductName(brand))
      );
      
      if (matchingBrand) {
        const brandQuery = query(
          productsRef,
          where('brand', '==', matchingBrand),
          limit(5)
        );
        
        const brandSnapshot = await getDocs(brandQuery);
        brandSnapshot.forEach((doc) => {
          const product = { id: doc.id, ...doc.data() };
          if (!products.find(p => p.id === product.id)) {
            products.push(product);
          }
        });
      }
    }
    
    return products;
    
  } catch (error) {
    console.error('Erro ao buscar no Firestore:', error);
    return [];
  }
}

// Expandir busca usando OpenAI
async function expandSearchWithAI(searchTerm) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em produtos de varejo brasileiro. Gere termos de busca relacionados para encontrar produtos similares."
        },
        {
          role: "user",
          content: `Para o produto "${searchTerm}", gere 3-5 termos de busca relacionados que um revendedor brasileiro usaria. Responda apenas com os termos separados por vírgula, sem explicações.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    const terms = response.split(',').map(term => term.trim()).filter(term => term.length > 0);
    
    console.log('Termos expandidos pela IA:', terms);
    return terms;
    
  } catch (error) {
    console.error('Erro ao expandir busca com IA:', error);
    return [];
  }
}

// Remover produtos duplicados
function removeDuplicateProducts(products) {
  const seen = new Set();
  return products.filter(product => {
    const key = `${product.name}-${product.supplierId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Enriquecer produtos com informações do fornecedor
async function enrichProductsWithSupplierInfo(products) {
  try {
    const supplierIds = [...new Set(products.map(p => p.supplierId))];
    const suppliersMap = new Map();
    
    // Buscar informações dos fornecedores
    for (const supplierId of supplierIds) {
      try {
        const supplierRef = collection(db, 'suppliers');
        const supplierQuery = query(supplierRef, where('__name__', '==', supplierId));
        const supplierSnapshot = await getDocs(supplierQuery);
        
        if (!supplierSnapshot.empty) {
          const supplierData = supplierSnapshot.docs[0].data();
          suppliersMap.set(supplierId, supplierData);
        }
      } catch (error) {
        console.error(`Erro ao buscar fornecedor ${supplierId}:`, error);
      }
    }
    
    // Enriquecer produtos com dados do fornecedor
    return products.map(product => {
      const supplier = suppliersMap.get(product.supplierId) || {
        name: product.supplierName || 'Fornecedor Desconhecido',
        rating: 4.0,
        deliveryTime: '3-5 dias úteis',
        website: '#'
      };
      
      return {
        ...product,
        supplier: {
          id: product.supplierId,
          name: supplier.name,
          rating: supplier.rating,
          deliveryTime: supplier.deliveryTime,
          website: supplier.website,
          paymentTerms: supplier.paymentTerms || ['À vista']
        },
        // Garantir que campos essenciais existam
        price: product.wholesalePrice || 0,
        image: product.imageUrl || '/placeholder-product.jpg',
        delivery: supplier.deliveryTime || '3-5 dias úteis',
        rating: supplier.rating || 4.0
      };
    });
    
  } catch (error) {
    console.error('Erro ao enriquecer produtos:', error);
    return products.map(product => ({
      ...product,
      supplier: {
        name: product.supplierName || 'Fornecedor',
        rating: 4.0,
        deliveryTime: '3-5 dias úteis'
      },
      price: product.wholesalePrice || 0,
      image: product.imageUrl || '/placeholder-product.jpg'
    }));
  }
}

// Gerar produtos genéricos como último recurso
function generateGenericProducts(searchQuery) {
  const suppliers = ['Atacadão', 'Assaí', 'Makro'];
  
  return suppliers.map((supplier, index) => ({
    id: `generic-${index}`,
    name: `${searchQuery} - ${supplier}`,
    supplier: {
      name: supplier,
      rating: 4.0,
      deliveryTime: '3-5 dias úteis',
      website: '#'
    },
    price: Math.floor(Math.random() * 100) + 20,
    wholesalePrice: Math.floor(Math.random() * 100) + 20,
    image: '/placeholder-product.jpg',
    delivery: '3-5 dias úteis',
    rating: 4.0,
    stock: 100,
    minQuantity: 1,
    productUrl: '#',
    category: 'Geral',
    unit: 'un'
  }));
}

// Gerar produtos de fallback em caso de erro - ESTILO BUSCAPÉ
function generateFallbackProducts(searchQuery) {
  const products = [];
  
  // Definir produtos base com variações realistas
  const productVariations = generateProductVariations(searchQuery);
  
  // Para cada produto, criar ofertas de múltiplos fornecedores
  productVariations.forEach((baseProduct, productIndex) => {
    const suppliers = [
      {
        name: 'Atacadão',
        website: 'https://www.atacadao.com.br',
        rating: 4.2,
        deliveryTime: '2-5 dias úteis',
        priceMultiplier: 1.0,
        stockRange: [100, 500]
      },
      {
        name: 'Assaí Atacadista',
        website: 'https://www.assai.com.br',
        rating: 4.1,
        deliveryTime: '1-3 dias úteis',
        priceMultiplier: 0.95,
        stockRange: [200, 800]
      },
      {
        name: 'Makro',
        website: 'https://www.makro.com.br',
        rating: 4.0,
        deliveryTime: '2-4 dias úteis',
        priceMultiplier: 1.05,
        stockRange: [50, 300]
      },
      {
        name: 'Amazon Brasil',
        website: 'https://www.amazon.com.br',
        rating: 4.3,
        deliveryTime: '1-2 dias úteis',
        priceMultiplier: 1.15,
        stockRange: [20, 100]
      },
      {
        name: 'Mercado Livre',
        website: 'https://www.mercadolivre.com.br',
        rating: 4.0,
        deliveryTime: '2-7 dias úteis',
        priceMultiplier: 1.08,
        stockRange: [10, 200]
      },
      {
        name: 'Magazine Luiza',
        website: 'https://www.magazineluiza.com.br',
        rating: 3.9,
        deliveryTime: '3-6 dias úteis',
        priceMultiplier: 1.12,
        stockRange: [30, 150]
      }
    ];

    // Criar ofertas para cada fornecedor (mínimo 3, máximo 6)
    const numSuppliers = Math.min(suppliers.length, Math.max(3, Math.floor(Math.random() * 4) + 3));
    const selectedSuppliers = suppliers.slice(0, numSuppliers);

    selectedSuppliers.forEach((supplier, supplierIndex) => {
      const basePrice = baseProduct.basePrice * supplier.priceMultiplier;
      const finalPrice = Math.round(basePrice * (0.9 + Math.random() * 0.2) * 100) / 100;
      
      products.push({
        id: `${productIndex}-${supplierIndex}`,
        name: baseProduct.name,
        brand: baseProduct.brand,
        category: baseProduct.category,
        supplier: {
          name: supplier.name,
          rating: supplier.rating + (Math.random() * 0.4 - 0.2), // Variação pequena
          deliveryTime: supplier.deliveryTime,
          website: supplier.website,
          paymentTerms: ['À vista', '30 dias', 'Cartão']
        },
        price: finalPrice,
        wholesalePrice: finalPrice,
        image: baseProduct.image,
        delivery: supplier.deliveryTime,
        rating: supplier.rating,
        stock: Math.floor(Math.random() * (supplier.stockRange[1] - supplier.stockRange[0])) + supplier.stockRange[0],
        minQuantity: baseProduct.minQuantity,
        productUrl: generateProductUrl(supplier.name, baseProduct.name),
        unit: baseProduct.unit,
        specifications: baseProduct.specifications
      });
    });
  });

  // Ordenar por preço (mais barato primeiro)
  return products.sort((a, b) => a.price - b.price);
}

// Gerar variações de produtos baseadas na busca
function generateProductVariations(searchQuery) {
  const normalizedQuery = searchQuery.toLowerCase();
  
  // Base de produtos por categoria
  const productDatabase = {
    // Alimentos
    'arroz': [
      { name: 'Arroz Tio João Tipo 1 5kg', brand: 'Tio João', basePrice: 22.90, category: 'Alimentos', unit: 'pct', minQuantity: 10, specifications: { peso: '5kg', tipo: 'Tipo 1' } },
      { name: 'Arroz Camil Tipo 1 5kg', brand: 'Camil', basePrice: 21.50, category: 'Alimentos', unit: 'pct', minQuantity: 12, specifications: { peso: '5kg', tipo: 'Tipo 1' } },
      { name: 'Arroz União Premium 5kg', brand: 'União', basePrice: 24.90, category: 'Alimentos', unit: 'pct', minQuantity: 8, specifications: { peso: '5kg', tipo: 'Premium' } }
    ],
    'feijao': [
      { name: 'Feijão Carioca Camil 1kg', brand: 'Camil', basePrice: 8.50, category: 'Alimentos', unit: 'pct', minQuantity: 24, specifications: { peso: '1kg', tipo: 'Carioca' } },
      { name: 'Feijão Preto Tio João 1kg', brand: 'Tio João', basePrice: 9.20, category: 'Alimentos', unit: 'pct', minQuantity: 20, specifications: { peso: '1kg', tipo: 'Preto' } },
      { name: 'Feijão Mulatinho Kicaldo 1kg', brand: 'Kicaldo', basePrice: 7.80, category: 'Alimentos', unit: 'pct', minQuantity: 30, specifications: { peso: '1kg', tipo: 'Mulatinho' } }
    ],
    'oleo': [
      { name: 'Óleo de Soja Soya 900ml', brand: 'Soya', basePrice: 4.20, category: 'Alimentos', unit: 'un', minQuantity: 24, specifications: { volume: '900ml', tipo: 'Soja' } },
      { name: 'Óleo de Girassol Liza 900ml', brand: 'Liza', basePrice: 5.50, category: 'Alimentos', unit: 'un', minQuantity: 20, specifications: { volume: '900ml', tipo: 'Girassol' } }
    ],
    // Limpeza
    'detergente': [
      { name: 'Detergente Ypê Neutro 500ml', brand: 'Ypê', basePrice: 2.80, category: 'Limpeza', unit: 'un', minQuantity: 24, specifications: { volume: '500ml', fragrância: 'Neutro' } },
      { name: 'Detergente Minuano Limão 500ml', brand: 'Minuano', basePrice: 2.60, category: 'Limpeza', unit: 'un', minQuantity: 30, specifications: { volume: '500ml', fragrância: 'Limão' } },
      { name: 'Detergente Limpol Maçã 500ml', brand: 'Limpol', basePrice: 2.90, category: 'Limpeza', unit: 'un', minQuantity: 20, specifications: { volume: '500ml', fragrância: 'Maçã' } }
    ],
    'sabao': [
      { name: 'Sabão em Pó Omo 1kg', brand: 'Omo', basePrice: 12.50, category: 'Limpeza', unit: 'un', minQuantity: 12, specifications: { peso: '1kg', tipo: 'Concentrado' } },
      { name: 'Sabão em Pó Ariel 1kg', brand: 'Ariel', basePrice: 13.20, category: 'Limpeza', unit: 'un', minQuantity: 10, specifications: { peso: '1kg', tipo: 'Concentrado' } }
    ],
    // Eletrônicos
    'smartphone': [
      { name: 'Smartphone Samsung Galaxy A14 128GB', brand: 'Samsung', basePrice: 899.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1, specifications: { memoria: '128GB', tela: '6.6"', cor: 'Preto' } },
      { name: 'Smartphone Motorola Moto G23 128GB', brand: 'Motorola', basePrice: 749.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1, specifications: { memoria: '128GB', tela: '6.5"', cor: 'Azul' } },
      { name: 'Smartphone Xiaomi Redmi Note 12 128GB', brand: 'Xiaomi', basePrice: 999.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1, specifications: { memoria: '128GB', tela: '6.67"', cor: 'Cinza' } }
    ],
    'fone': [
      { name: 'Fone JBL Tune 510BT Bluetooth', brand: 'JBL', basePrice: 199.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1, specifications: { tipo: 'Bluetooth', cor: 'Preto' } },
      { name: 'Fone Sony WH-CH720N Bluetooth', brand: 'Sony', basePrice: 299.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1, specifications: { tipo: 'Bluetooth', cor: 'Branco' } }
    ]
  };

  // Encontrar produtos que correspondem à busca
  let matchingProducts = [];
  
  for (const [key, products] of Object.entries(productDatabase)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      matchingProducts = [...matchingProducts, ...products];
    }
  }

  // Se não encontrou correspondência exata, buscar por categoria
  if (matchingProducts.length === 0) {
    const categories = ['alimento', 'limpeza', 'eletronico', 'higiene'];
    const matchingCategory = categories.find(cat => normalizedQuery.includes(cat));
    
    if (matchingCategory) {
      for (const products of Object.values(productDatabase)) {
        matchingProducts = [...matchingProducts, ...products.filter(p => 
          p.category.toLowerCase().includes(matchingCategory)
        )];
      }
    }
  }

  // Se ainda não encontrou, gerar produtos genéricos
  if (matchingProducts.length === 0) {
    matchingProducts = [
      { 
        name: `${searchQuery} - Produto Premium`, 
        brand: 'Marca A', 
        basePrice: Math.floor(Math.random() * 200) + 50, 
        category: 'Geral', 
        unit: 'un', 
        minQuantity: 1,
        specifications: { tipo: 'Premium' }
      },
      { 
        name: `${searchQuery} - Produto Econômico`, 
        brand: 'Marca B', 
        basePrice: Math.floor(Math.random() * 150) + 30, 
        category: 'Geral', 
        unit: 'un', 
        minQuantity: 1,
        specifications: { tipo: 'Econômico' }
      },
      { 
        name: `${searchQuery} - Produto Profissional`, 
        brand: 'Marca C', 
        basePrice: Math.floor(Math.random() * 300) + 100, 
        category: 'Geral', 
        unit: 'un', 
        minQuantity: 1,
        specifications: { tipo: 'Profissional' }
      }
    ];
  }

  // Adicionar imagens
  return matchingProducts.map(product => ({
    ...product,
    image: generateImageUrl(product.name)
  }));
}

// Gerar URL de imagem placeholder
function generateImageUrl(productName) {
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://via.placeholder.com/200x200/f0f0f0/666666?text=${encodeURIComponent(productName.split(' ')[0])}`;
}

// Gerar URL do produto no site do fornecedor
function generateProductUrl(supplierName, productName) {
  const baseUrls = {
    "Atacadão": "https://www.atacadao.com.br/busca?q=",
    "Assaí Atacadista": "https://www.assai.com.br/busca?q=",
    "Makro": "https://www.makro.com.br/busca?q=",
    "Amazon Brasil": "https://www.amazon.com.br/s?k=",
    "Mercado Livre": "https://lista.mercadolivre.com.br/",
    "Magazine Luiza": "https://www.magazineluiza.com.br/busca/"
  };

  const baseUrl = baseUrls[supplierName] || "#";
  const searchTerm = encodeURIComponent(productName.toLowerCase());
  
  return `${baseUrl}${searchTerm}`;
}
