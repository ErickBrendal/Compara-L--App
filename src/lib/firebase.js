// Sistema híbrido: Firebase real + fallback demo
let db, isUsingDemo = false;

try {
  // Verificar se as variáveis de ambiente do Firebase estão configuradas corretamente
  const hasRealFirebaseConfig = 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('Demo') &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('demo-key');

  if (hasRealFirebaseConfig && typeof window !== 'undefined') {
    // Usar Firebase real
    const { initializeApp } = require('firebase/app');
    const { getFirestore } = require('firebase/firestore');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    console.log('🔥 Firebase real configurado');
  } else {
    throw new Error('Firebase não configurado ou em ambiente servidor, usando sistema demo');
  }
} catch (error) {
  // Fallback para sistema demo
  console.log('⚠️ Usando sistema demo:', error.message);
  isUsingDemo = true;
  
  // DB demo inline
  db = {
    collection: (name) => ({
      name,
      add: async (data) => {
        const id = Date.now().toString();
        console.log(`[Demo] Adicionado à ${name}:`, data);
        return { id };
      }
    })
  };
}

// Função para buscar produtos (simular busca no Firestore) - ESTILO BUSCAPÉ
export const searchProducts = async (searchTerm) => {
  console.log(`🔍 Buscando produtos para: "${searchTerm}"`);
  
  // Usar a mesma lógica da API para gerar produtos com múltiplos fornecedores
  const products = generateBuscapeStyleProducts(searchTerm);
  
  console.log(`✅ Encontrados ${products.length} produtos de ${new Set(products.map(p => p.supplier.name)).size} fornecedores diferentes`);
  return products;
};

// Gerar produtos estilo Buscapé com múltiplos fornecedores
function generateBuscapeStyleProducts(searchQuery) {
  const products = [];
  const normalizedQuery = searchQuery.toLowerCase();
  
  // Base de produtos por categoria (mesmo da API)
  const productDatabase = {
    'arroz': [
      { name: 'Arroz Tio João Tipo 1 5kg', brand: 'Tio João', basePrice: 22.90, category: 'Alimentos', unit: 'pct', minQuantity: 10 },
      { name: 'Arroz Camil Tipo 1 5kg', brand: 'Camil', basePrice: 21.50, category: 'Alimentos', unit: 'pct', minQuantity: 12 },
      { name: 'Arroz União Premium 5kg', brand: 'União', basePrice: 24.90, category: 'Alimentos', unit: 'pct', minQuantity: 8 }
    ],
    'feijao': [
      { name: 'Feijão Carioca Camil 1kg', brand: 'Camil', basePrice: 8.50, category: 'Alimentos', unit: 'pct', minQuantity: 24 },
      { name: 'Feijão Preto Tio João 1kg', brand: 'Tio João', basePrice: 9.20, category: 'Alimentos', unit: 'pct', minQuantity: 20 },
      { name: 'Feijão Mulatinho Kicaldo 1kg', brand: 'Kicaldo', basePrice: 7.80, category: 'Alimentos', unit: 'pct', minQuantity: 30 }
    ],
    'detergente': [
      { name: 'Detergente Ypê Neutro 500ml', brand: 'Ypê', basePrice: 2.80, category: 'Limpeza', unit: 'un', minQuantity: 24 },
      { name: 'Detergente Minuano Limão 500ml', brand: 'Minuano', basePrice: 2.60, category: 'Limpeza', unit: 'un', minQuantity: 30 },
      { name: 'Detergente Limpol Maçã 500ml', brand: 'Limpol', basePrice: 2.90, category: 'Limpeza', unit: 'un', minQuantity: 20 }
    ],
    'smartphone': [
      { name: 'Smartphone Samsung Galaxy A14 128GB', brand: 'Samsung', basePrice: 899.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1 },
      { name: 'Smartphone Motorola Moto G23 128GB', brand: 'Motorola', basePrice: 749.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1 },
      { name: 'Smartphone Xiaomi Redmi Note 12 128GB', brand: 'Xiaomi', basePrice: 999.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1 }
    ],
    'oleo': [
      { name: 'Óleo de Soja Soya 900ml', brand: 'Soya', basePrice: 4.20, category: 'Alimentos', unit: 'un', minQuantity: 24 },
      { name: 'Óleo de Girassol Liza 900ml', brand: 'Liza', basePrice: 5.50, category: 'Alimentos', unit: 'un', minQuantity: 20 }
    ],
    'sabao': [
      { name: 'Sabão em Pó Omo 1kg', brand: 'Omo', basePrice: 12.50, category: 'Limpeza', unit: 'un', minQuantity: 12 },
      { name: 'Sabão em Pó Ariel 1kg', brand: 'Ariel', basePrice: 13.20, category: 'Limpeza', unit: 'un', minQuantity: 10 }
    ],
    'fone': [
      { name: 'Fone JBL Tune 510BT Bluetooth', brand: 'JBL', basePrice: 199.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1 },
      { name: 'Fone Sony WH-CH720N Bluetooth', brand: 'Sony', basePrice: 299.00, category: 'Eletrônicos', unit: 'un', minQuantity: 1 }
    ]
  };

  // Fornecedores com características diferentes
  const suppliers = [
    { name: 'Atacadão', rating: 4.2, deliveryTime: '2-5 dias úteis', priceMultiplier: 1.0, website: 'https://www.atacadao.com.br' },
    { name: 'Assaí Atacadista', rating: 4.1, deliveryTime: '1-3 dias úteis', priceMultiplier: 0.95, website: 'https://www.assai.com.br' },
    { name: 'Makro', rating: 4.0, deliveryTime: '2-4 dias úteis', priceMultiplier: 1.05, website: 'https://www.makro.com.br' },
    { name: 'Amazon Brasil', rating: 4.3, deliveryTime: '1-2 dias úteis', priceMultiplier: 1.15, website: 'https://www.amazon.com.br' },
    { name: 'Mercado Livre', rating: 4.0, deliveryTime: '2-7 dias úteis', priceMultiplier: 1.08, website: 'https://www.mercadolivre.com.br' },
    { name: 'Magazine Luiza', rating: 3.9, deliveryTime: '3-6 dias úteis', priceMultiplier: 1.12, website: 'https://www.magazineluiza.com.br' }
  ];

  // Encontrar produtos que correspondem à busca
  let matchingProducts = [];
  for (const [key, productList] of Object.entries(productDatabase)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      matchingProducts = [...matchingProducts, ...productList];
    }
  }

  // Se não encontrou, gerar produtos genéricos
  if (matchingProducts.length === 0) {
    matchingProducts = [
      { name: `${searchQuery} - Produto Premium`, brand: 'Marca A', basePrice: Math.floor(Math.random() * 200) + 50, category: 'Geral', unit: 'un', minQuantity: 1 },
      { name: `${searchQuery} - Produto Econômico`, brand: 'Marca B', basePrice: Math.floor(Math.random() * 150) + 30, category: 'Geral', unit: 'un', minQuantity: 1 }
    ];
  }

  // Para cada produto, criar ofertas de múltiplos fornecedores
  matchingProducts.forEach((baseProduct, productIndex) => {
    // Selecionar 3-6 fornecedores aleatoriamente
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
          id: `sup-${supplierIndex}`,
          name: supplier.name,
          rating: supplier.rating + (Math.random() * 0.4 - 0.2),
          deliveryTime: supplier.deliveryTime,
          website: supplier.website,
          paymentTerms: ['À vista', '30 dias', 'Cartão']
        },
        price: finalPrice,
        wholesalePrice: finalPrice,
        image: `https://via.placeholder.com/200x200/f0f0f0/666666?text=${encodeURIComponent(baseProduct.name.split(' ')[0])}`,
        delivery: supplier.deliveryTime,
        rating: supplier.rating,
        stock: Math.floor(Math.random() * 500) + 50,
        minQuantity: baseProduct.minQuantity,
        productUrl: generateProductUrl(supplier.name, baseProduct.name),
        unit: baseProduct.unit
      });
    });
  });

  // Ordenar por preço (mais barato primeiro)
  return products.sort((a, b) => a.price - b.price);
}

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

export const getSupplierById = async (supplierId) => {
  return null; // Não usado no sistema demo
};

// Exportar db e status
export { db, isUsingDemo };

// Funções do Firebase (mock para compatibilidade)
export const collection = (db, name) => db.collection(name);
export const addDoc = async (collectionRef, data) => collectionRef.add(data);
export const getDocs = async () => ({ docs: [], empty: true });
export const query = () => ({});
export const where = () => ({});
export const orderBy = () => ({});
export const limit = () => ({});
export const doc = () => ({});
export const setDoc = async () => ({});
export const writeBatch = () => ({ 
  set: () => {}, 
  commit: async () => ({}) 
});

console.log('🚀 Sistema de dados inicializado (Estilo Buscapé):', {
  demo: isUsingDemo,
  fornecedores: 6,
  categorias: 'Alimentos, Limpeza, Eletrônicos'
});
