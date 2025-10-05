/**
 * Firebase Demo - Sistema que simula Firebase quando não configurado
 * Para demonstração sem necessidade de configurar Firebase real
 */

// Dados de demonstração em memória
let demoData = {
  suppliers: [],
  products: [],
  user_configurations: [],
  initialized: false
};

// Simular Firebase Firestore API
export const db = {
  // Simular collection
  collection: (name) => ({
    name,
    add: async (data) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const docWithId = { id, ...data };
      
      if (!demoData[name]) {
        demoData[name] = [];
      }
      
      demoData[name].push(docWithId);
      console.log(`[Firebase Demo] Adicionado à collection ${name}:`, docWithId);
      
      return { id };
    },
    get: async () => {
      const docs = demoData[name] || [];
      return {
        docs: docs.map(doc => ({
          id: doc.id,
          data: () => doc
        })),
        empty: docs.length === 0
      };
    }
  })
};

// Simular funções do Firebase
export const collection = (db, name) => db.collection(name);

export const addDoc = async (collectionRef, data) => {
  return await collectionRef.add(data);
};

export const getDocs = async (queryRef) => {
  if (queryRef.get) {
    return await queryRef.get();
  }
  
  // Se for uma query simples, retornar dados da collection
  const docs = demoData[queryRef.name] || [];
  return {
    docs: docs.map(doc => ({
      id: doc.id,
      data: () => doc
    })),
    empty: docs.length === 0,
    forEach: (callback) => {
      docs.forEach(doc => {
        callback({
          id: doc.id,
          data: () => doc
        });
      });
    }
  };
};

export const query = (collectionRef, ...constraints) => {
  // Simular query - retornar a própria collection por simplicidade
  return {
    ...collectionRef,
    constraints
  };
};

export const where = (field, operator, value) => ({ field, operator, value });
export const orderBy = (field, direction = 'asc') => ({ field, direction });
export const limit = (count) => ({ count });

export const doc = (db, collection, id) => ({
  collection,
  id,
  set: async (data) => {
    if (!demoData[collection]) {
      demoData[collection] = [];
    }
    
    const existingIndex = demoData[collection].findIndex(item => item.id === id);
    const docData = { id, ...data };
    
    if (existingIndex >= 0) {
      demoData[collection][existingIndex] = docData;
    } else {
      demoData[collection].push(docData);
    }
    
    console.log(`[Firebase Demo] Documento ${id} salvo na collection ${collection}`);
    return { id };
  }
});

export const setDoc = async (docRef, data) => {
  return await docRef.set(data);
};

export const writeBatch = (db) => ({
  set: (docRef, data) => {
    // Simular batch set
    console.log(`[Firebase Demo] Batch set para ${docRef.collection}/${docRef.id}`);
  },
  commit: async () => {
    console.log('[Firebase Demo] Batch commit executado');
    return true;
  }
});

// Inicializar dados de demonstração
export const initializeDemoData = () => {
  if (demoData.initialized) return;
  
  console.log('[Firebase Demo] Inicializando dados de demonstração...');
  
  // Dados de fornecedores
  const suppliers = [
    {
      id: 'sup1',
      name: "Atacadão",
      website: "https://www.atacadao.com.br",
      cnpj: "75.315.333/0001-09",
      email: "contato@atacadao.com.br",
      phone: "(11) 3003-8888",
      categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene"],
      rating: 4.2,
      deliveryTime: "2-5 dias úteis",
      minOrder: 100,
      paymentTerms: ["À vista", "28 dias", "35 dias"],
      active: true
    },
    {
      id: 'sup2',
      name: "Assaí Atacadista",
      website: "https://www.assai.com.br",
      cnpj: "47.508.411/0001-56",
      email: "sac@assai.com.br",
      phone: "(11) 2103-8000",
      categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Eletrônicos"],
      rating: 4.1,
      deliveryTime: "1-3 dias úteis",
      minOrder: 150,
      paymentTerms: ["À vista", "21 dias", "28 dias"],
      active: true
    },
    {
      id: 'sup3',
      name: "Amazon Brasil",
      website: "https://www.amazon.com.br",
      cnpj: "15.436.940/0001-03",
      email: "atendimento@amazon.com.br",
      phone: "0800-727-3322",
      categories: ["Eletrônicos", "Casa", "Papelaria", "Higiene"],
      rating: 4.3,
      deliveryTime: "1-2 dias úteis",
      minOrder: 50,
      paymentTerms: ["À vista", "Cartão"],
      active: true
    }
  ];

  // Dados de produtos
  const products = [
    {
      id: 'prod1',
      name: "Arroz Tio João Tipo 1 5kg",
      brand: "Tio João",
      category: "Alimentos",
      sku: "ARR-TJ-5KG",
      ean: "7896036097014",
      unit: "pct",
      specifications: { peso: "5kg", tipo: "Tipo 1" },
      supplierId: 'sup1',
      supplierName: "Atacadão",
      wholesalePrice: 22.90,
      stock: 500,
      minQuantity: 10,
      productUrl: "https://www.atacadao.com.br/busca?q=arroz+tio+joao",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Arroz",
      lastUpdated: new Date()
    },
    {
      id: 'prod2',
      name: "Arroz Tio João Tipo 1 5kg",
      brand: "Tio João",
      category: "Alimentos",
      sku: "ARR-TJ-5KG",
      ean: "7896036097014",
      unit: "pct",
      specifications: { peso: "5kg", tipo: "Tipo 1" },
      supplierId: 'sup2',
      supplierName: "Assaí Atacadista",
      wholesalePrice: 21.50,
      stock: 800,
      minQuantity: 12,
      productUrl: "https://www.assai.com.br/busca?q=arroz+tio+joao",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Arroz",
      lastUpdated: new Date()
    },
    {
      id: 'prod3',
      name: "Smartphone Samsung Galaxy A14 128GB",
      brand: "Samsung",
      category: "Eletrônicos",
      sku: "CEL-SAM-A14-128",
      ean: "8806094665017",
      unit: "un",
      specifications: { memoria: "128GB", tela: "6.6\"", cor: "Preto" },
      supplierId: 'sup3',
      supplierName: "Amazon Brasil",
      wholesalePrice: 899.00,
      stock: 50,
      minQuantity: 1,
      productUrl: "https://www.amazon.com.br/s?k=samsung+galaxy+a14",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Samsung",
      lastUpdated: new Date()
    },
    {
      id: 'prod4',
      name: "Detergente Ypê Neutro 500ml",
      brand: "Ypê",
      category: "Limpeza",
      sku: "DET-YPE-500ML",
      ean: "7896098900116",
      unit: "un",
      specifications: { volume: "500ml", fragrância: "Neutro" },
      supplierId: 'sup1',
      supplierName: "Atacadão",
      wholesalePrice: 2.80,
      stock: 800,
      minQuantity: 24,
      productUrl: "https://www.atacadao.com.br/busca?q=detergente+ype",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Detergente",
      lastUpdated: new Date()
    },
    {
      id: 'prod5',
      name: "Feijão Carioca Camil 1kg",
      brand: "Camil",
      category: "Alimentos",
      sku: "FEI-CAM-1KG",
      ean: "7896006711014",
      unit: "pct",
      specifications: { peso: "1kg", tipo: "Carioca" },
      supplierId: 'sup2',
      supplierName: "Assaí Atacadista",
      wholesalePrice: 8.50,
      stock: 900,
      minQuantity: 24,
      productUrl: "https://www.assai.com.br/busca?q=feijao+camil",
      imageUrl: "https://via.placeholder.com/200x200/f0f0f0/666666?text=Feijão",
      lastUpdated: new Date()
    }
  ];

  // Inicializar dados
  demoData.suppliers = suppliers;
  demoData.products = products;
  demoData.user_configurations = [];
  demoData.initialized = true;
  
  console.log('[Firebase Demo] Dados inicializados:', {
    suppliers: suppliers.length,
    products: products.length
  });
};

// Função para buscar produtos (simular busca no Firestore)
export const searchProducts = async (searchTerm) => {
  initializeDemoData();
  
  const normalizedTerm = searchTerm.toLowerCase();
  const matchingProducts = demoData.products.filter(product => 
    product.name.toLowerCase().includes(normalizedTerm) ||
    product.brand.toLowerCase().includes(normalizedTerm) ||
    product.category.toLowerCase().includes(normalizedTerm) ||
    product.supplierName.toLowerCase().includes(normalizedTerm)
  );
  
  console.log(`[Firebase Demo] Busca por "${searchTerm}" encontrou ${matchingProducts.length} produtos`);
  return matchingProducts;
};

// Função para obter fornecedor por ID
export const getSupplierById = async (supplierId) => {
  initializeDemoData();
  
  const supplier = demoData.suppliers.find(s => s.id === supplierId);
  return supplier || null;
};

// Inicializar automaticamente
initializeDemoData();
