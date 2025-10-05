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
    console.log(`Buscando produtos para: ${searchQuery}`);
    
    // 1. Buscar produtos no Firestore
    let products = await searchProductsInFirestore(searchQuery);
    
    // 2. Se não encontrou produtos suficientes, usar OpenAI para expandir busca
    if (products.length < 3 && process.env.OPENAI_API_KEY) {
      console.log('Poucos resultados encontrados, expandindo busca com IA...');
      const expandedTerms = await expandSearchWithAI(searchQuery);
      
      for (const term of expandedTerms) {
        const additionalProducts = await searchProductsInFirestore(term);
        products = [...products, ...additionalProducts];
        
        if (products.length >= 10) break; // Limitar resultados
      }
    }
    
    // 3. Remover duplicatas e limitar resultados
    const uniqueProducts = removeDuplicateProducts(products);
    const limitedProducts = uniqueProducts.slice(0, 10);
    
    // 4. Buscar informações dos fornecedores
    const enrichedProducts = await enrichProductsWithSupplierInfo(limitedProducts);
    
    // 5. Ordenar por melhor preço
    const sortedProducts = enrichedProducts.sort((a, b) => a.wholesalePrice - b.wholesalePrice);

    console.log(`Encontrados ${sortedProducts.length} produtos`);

    res.status(200).json({
      success: true,
      query: searchQuery,
      results: sortedProducts,
      total: sortedProducts.length,
      searchTermsUsed: products.length > uniqueProducts.length ? 'expanded' : 'direct'
    });

  } catch (error) {
    console.error('Erro na busca:', error);
    
    // Fallback para dados mock se houver erro
    const fallbackProducts = generateFallbackProducts(searchQuery);
    
    res.status(200).json({
      success: true,
      query: searchQuery,
      results: fallbackProducts,
      total: fallbackProducts.length,
      fallback: true,
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

// Gerar produtos de fallback em caso de erro
function generateFallbackProducts(searchQuery) {
  const suppliers = ['Atacadão', 'Assaí', 'Makro', 'Amazon Brasil', 'Mercado Livre'];
  
  return suppliers.map((supplier, index) => ({
    id: `fallback-${index}`,
    name: `${searchQuery} - ${supplier}`,
    supplier: {
      name: supplier,
      rating: 4.0 + (Math.random() * 0.8),
      deliveryTime: `${2 + index}-${4 + index} dias úteis`,
      website: '#'
    },
    price: Math.floor(Math.random() * 500) + 50,
    wholesalePrice: Math.floor(Math.random() * 500) + 50,
    image: '/placeholder-product.jpg',
    delivery: `${2 + index}-${4 + index} dias úteis`,
    rating: 4.0 + (Math.random() * 0.8),
    stock: Math.floor(Math.random() * 100) + 10,
    minQuantity: Math.floor(Math.random() * 10) + 1,
    productUrl: '#',
    category: 'Geral',
    unit: 'un'
  }));
}
