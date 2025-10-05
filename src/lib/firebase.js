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
  
  // Importar sistema demo
  if (typeof window !== 'undefined') {
    import('./firebase-demo').then(firebaseDemo => {
      db = firebaseDemo.db;
    });
  } else {
    // Para ambiente servidor
    const firebaseDemo = require('./firebase-demo');
    db = firebaseDemo.db;
  }
}

// Sistema demo inline para garantir funcionamento
const demoData = {
  suppliers: [
    {
      id: 'sup1',
      name: "Atacadão",
      website: "https://www.atacadao.com.br",
      rating: 4.2,
      deliveryTime: "2-5 dias úteis",
      paymentTerms: ["À vista", "28 dias"]
    },
    {
      id: 'sup2',
      name: "Assaí Atacadista", 
      website: "https://www.assai.com.br",
      rating: 4.1,
      deliveryTime: "1-3 dias úteis",
      paymentTerms: ["À vista", "21 dias"]
    },
    {
      id: 'sup3',
      name: "Amazon Brasil",
      website: "https://www.amazon.com.br", 
      rating: 4.3,
      deliveryTime: "1-2 dias úteis",
      paymentTerms: ["À vista", "Cartão"]
    }
  ],
  products: [
    {
      id: 'prod1',
      name: "Arroz Tio João Tipo 1 5kg",
      brand: "Tio João",
      category: "Alimentos",
      supplierId: 'sup1',
      supplierName: "Atacadão",
      wholesalePrice: 22.90,
      stock: 500,
      minQuantity: 10,
      unit: "pct",
      productUrl: "https://www.atacadao.com.br/busca?q=arroz+tio+joao",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Arroz"
    },
    {
      id: 'prod2',
      name: "Arroz Tio João Tipo 1 5kg",
      brand: "Tio João", 
      category: "Alimentos",
      supplierId: 'sup2',
      supplierName: "Assaí Atacadista",
      wholesalePrice: 21.50,
      stock: 800,
      minQuantity: 12,
      unit: "pct",
      productUrl: "https://www.assai.com.br/busca?q=arroz+tio+joao",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Arroz"
    },
    {
      id: 'prod3',
      name: "Smartphone Samsung Galaxy A14 128GB",
      brand: "Samsung",
      category: "Eletrônicos", 
      supplierId: 'sup3',
      supplierName: "Amazon Brasil",
      wholesalePrice: 899.00,
      stock: 50,
      minQuantity: 1,
      unit: "un",
      productUrl: "https://www.amazon.com.br/s?k=samsung+galaxy+a14",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Samsung"
    },
    {
      id: 'prod4',
      name: "Detergente Ypê Neutro 500ml",
      brand: "Ypê",
      category: "Limpeza",
      supplierId: 'sup1', 
      supplierName: "Atacadão",
      wholesalePrice: 2.80,
      stock: 800,
      minQuantity: 24,
      unit: "un",
      productUrl: "https://www.atacadao.com.br/busca?q=detergente+ype",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Detergente"
    },
    {
      id: 'prod5',
      name: "Feijão Carioca Camil 1kg",
      brand: "Camil",
      category: "Alimentos",
      supplierId: 'sup2',
      supplierName: "Assaí Atacadista", 
      wholesalePrice: 8.50,
      stock: 900,
      minQuantity: 24,
      unit: "pct",
      productUrl: "https://www.assai.com.br/busca?q=feijao+camil",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Feijão"
    }
  ]
};

// DB demo inline
if (!db) {
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

// Funções de busca
export const searchProducts = async (searchTerm) => {
  console.log(`🔍 Buscando produtos para: "${searchTerm}"`);
  
  const normalizedTerm = searchTerm.toLowerCase();
  const matchingProducts = demoData.products.filter(product => 
    product.name.toLowerCase().includes(normalizedTerm) ||
    product.brand.toLowerCase().includes(normalizedTerm) ||
    product.category.toLowerCase().includes(normalizedTerm) ||
    product.supplierName.toLowerCase().includes(normalizedTerm)
  );
  
  // Enriquecer com dados do fornecedor
  const enrichedProducts = matchingProducts.map(product => {
    const supplier = demoData.suppliers.find(s => s.id === product.supplierId);
    return {
      ...product,
      supplier: supplier || {
        name: product.supplierName,
        rating: 4.0,
        deliveryTime: "3-5 dias úteis"
      },
      price: product.wholesalePrice,
      image: product.imageUrl,
      delivery: supplier?.deliveryTime || "3-5 dias úteis",
      rating: supplier?.rating || 4.0
    };
  });
  
  console.log(`✅ Encontrados ${enrichedProducts.length} produtos`);
  return enrichedProducts;
};

export const getSupplierById = async (supplierId) => {
  return demoData.suppliers.find(s => s.id === supplierId) || null;
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

console.log('🚀 Sistema de dados inicializado:', {
  demo: isUsingDemo,
  products: demoData.products.length,
  suppliers: demoData.suppliers.length
});
