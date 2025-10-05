import { db } from '../../lib/firebase';
import { collection, addDoc, doc, setDoc, writeBatch } from 'firebase/firestore';

// Dados reais de fornecedores brasileiros
const SUPPLIERS_DATA = [
  {
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
    name: "Makro",
    website: "https://www.makro.com.br",
    cnpj: "47.508.411/0001-56",
    email: "atendimento@makro.com.br",
    phone: "(11) 4004-2525",
    categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Papelaria"],
    rating: 4.0,
    deliveryTime: "2-4 dias úteis",
    minOrder: 200,
    paymentTerms: ["À vista", "30 dias", "45 dias"],
    active: true
  },
  {
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
  },
  {
    name: "Mercado Livre",
    website: "https://www.mercadolivre.com.br",
    cnpj: "10.573.521/0001-91",
    email: "contato@mercadolivre.com.br",
    phone: "(11) 4130-5800",
    categories: ["Eletrônicos", "Casa", "Alimentos", "Papelaria"],
    rating: 4.0,
    deliveryTime: "1-5 dias úteis",
    minOrder: 30,
    paymentTerms: ["À vista", "Parcelado"],
    active: true
  },
  {
    name: "Magazine Luiza",
    website: "https://www.magazineluiza.com.br",
    cnpj: "47.960.950/0001-21",
    email: "sac@magazineluiza.com.br",
    phone: "4003-0555",
    categories: ["Eletrônicos", "Casa", "Higiene"],
    rating: 3.9,
    deliveryTime: "2-7 dias úteis",
    minOrder: 80,
    paymentTerms: ["À vista", "Parcelado"],
    active: true
  },
  {
    name: "Martins Atacado",
    website: "https://www.martins.com.br",
    cnpj: "33.041.260/0001-56",
    email: "vendas@martins.com.br",
    phone: "(38) 2101-9000",
    categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene"],
    rating: 4.1,
    deliveryTime: "3-5 dias úteis",
    minOrder: 300,
    paymentTerms: ["À vista", "28 dias", "35 dias", "42 dias"],
    active: true
  },
  {
    name: "Roldão Atacadista",
    website: "https://www.roldao.com.br",
    cnpj: "60.543.816/0001-93",
    email: "sac@roldao.com.br",
    phone: "(11) 2167-0000",
    categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene"],
    rating: 3.8,
    deliveryTime: "2-4 dias úteis",
    minOrder: 120,
    paymentTerms: ["À vista", "21 dias", "28 dias"],
    active: true
  },
  {
    name: "Alibaba Brasil",
    website: "https://portuguese.alibaba.com",
    cnpj: "18.986.382/0001-37",
    email: "brasil@alibaba.com",
    phone: "(11) 3090-1500",
    categories: ["Eletrônicos", "Casa", "Papelaria", "Alimentos"],
    rating: 3.7,
    deliveryTime: "7-15 dias úteis",
    minOrder: 500,
    paymentTerms: ["À vista", "Carta de crédito"],
    active: true
  },
  {
    name: "Carrefour Atacadão",
    website: "https://www.carrefour.com.br",
    cnpj: "45.543.915/0001-81",
    email: "atacadao@carrefour.com.br",
    phone: "(11) 3779-8500",
    categories: ["Alimentos", "Bebidas", "Limpeza", "Higiene", "Eletrônicos"],
    rating: 4.0,
    deliveryTime: "1-3 dias úteis",
    minOrder: 100,
    paymentTerms: ["À vista", "28 dias"],
    active: true
  }
];

// Produtos reais com preços de mercado
const PRODUCTS_DATA = [
  // Alimentos
  {
    name: "Arroz Tio João Tipo 1 5kg",
    brand: "Tio João",
    category: "Alimentos",
    sku: "ARR-TJ-5KG",
    ean: "7896036097014",
    unit: "pct",
    specifications: { peso: "5kg", tipo: "Tipo 1" },
    suppliers: [
      { supplierName: "Atacadão", price: 22.90, stock: 500, minQuantity: 10 },
      { supplierName: "Assaí Atacadista", price: 21.50, stock: 800, minQuantity: 12 },
      { supplierName: "Makro", price: 23.80, stock: 300, minQuantity: 15 },
      { supplierName: "Martins Atacado", price: 20.90, stock: 1000, minQuantity: 20 },
      { supplierName: "Roldão Atacadista", price: 22.30, stock: 400, minQuantity: 10 }
    ]
  },
  {
    name: "Feijão Carioca Camil 1kg",
    brand: "Camil",
    category: "Alimentos",
    sku: "FEI-CAM-1KG",
    ean: "7896006711014",
    unit: "pct",
    specifications: { peso: "1kg", tipo: "Carioca" },
    suppliers: [
      { supplierName: "Atacadão", price: 8.90, stock: 600, minQuantity: 20 },
      { supplierName: "Assaí Atacadista", price: 8.50, stock: 900, minQuantity: 24 },
      { supplierName: "Makro", price: 9.20, stock: 400, minQuantity: 30 },
      { supplierName: "Martins Atacado", price: 8.20, stock: 1200, minQuantity: 40 },
      { supplierName: "Carrefour Atacadão", price: 8.70, stock: 500, minQuantity: 20 }
    ]
  },
  {
    name: "Óleo de Soja Soya 900ml",
    brand: "Soya",
    category: "Alimentos",
    sku: "OLE-SOY-900ML",
    ean: "7891000100127",
    unit: "un",
    specifications: { volume: "900ml", tipo: "Refinado" },
    suppliers: [
      { supplierName: "Atacadão", price: 4.50, stock: 800, minQuantity: 24 },
      { supplierName: "Assaí Atacadista", price: 4.20, stock: 1000, minQuantity: 30 },
      { supplierName: "Makro", price: 4.80, stock: 600, minQuantity: 36 },
      { supplierName: "Roldão Atacadista", price: 4.30, stock: 700, minQuantity: 24 }
    ]
  },
  {
    name: "Açúcar Cristal União 1kg",
    brand: "União",
    category: "Alimentos",
    sku: "ACU-UNI-1KG",
    ean: "7891910000135",
    unit: "pct",
    specifications: { peso: "1kg", tipo: "Cristal" },
    suppliers: [
      { supplierName: "Atacadão", price: 3.80, stock: 1000, minQuantity: 30 },
      { supplierName: "Assaí Atacadista", price: 3.60, stock: 1200, minQuantity: 40 },
      { supplierName: "Makro", price: 4.00, stock: 800, minQuantity: 50 },
      { supplierName: "Martins Atacado", price: 3.50, stock: 1500, minQuantity: 60 }
    ]
  },
  {
    name: "Macarrão Espaguete Barilla 500g",
    brand: "Barilla",
    category: "Alimentos",
    sku: "MAC-BAR-500G",
    ean: "8076809513920",
    unit: "pct",
    specifications: { peso: "500g", formato: "Espaguete" },
    suppliers: [
      { supplierName: "Atacadão", price: 5.90, stock: 400, minQuantity: 20 },
      { supplierName: "Amazon Brasil", price: 6.50, stock: 200, minQuantity: 12 },
      { supplierName: "Mercado Livre", price: 6.20, stock: 150, minQuantity: 10 },
      { supplierName: "Magazine Luiza", price: 6.80, stock: 100, minQuantity: 6 }
    ]
  },

  // Bebidas
  {
    name: "Refrigerante Coca-Cola 2L",
    brand: "Coca-Cola",
    category: "Bebidas",
    sku: "REF-COC-2L",
    ean: "7894900011517",
    unit: "un",
    specifications: { volume: "2L", tipo: "Original" },
    suppliers: [
      { supplierName: "Atacadão", price: 6.50, stock: 500, minQuantity: 12 },
      { supplierName: "Assaí Atacadista", price: 6.20, stock: 800, minQuantity: 15 },
      { supplierName: "Makro", price: 6.80, stock: 400, minQuantity: 18 },
      { supplierName: "Carrefour Atacadão", price: 6.30, stock: 600, minQuantity: 12 }
    ]
  },
  {
    name: "Água Mineral Crystal 500ml",
    brand: "Crystal",
    category: "Bebidas",
    sku: "AGU-CRY-500ML",
    ean: "7891991010016",
    unit: "un",
    specifications: { volume: "500ml", tipo: "Sem gás" },
    suppliers: [
      { supplierName: "Atacadão", price: 1.20, stock: 2000, minQuantity: 50 },
      { supplierName: "Assaí Atacadista", price: 1.10, stock: 2500, minQuantity: 60 },
      { supplierName: "Makro", price: 1.30, stock: 1500, minQuantity: 72 },
      { supplierName: "Roldão Atacadista", price: 1.15, stock: 1800, minQuantity: 50 }
    ]
  },

  // Limpeza
  {
    name: "Detergente Ypê Neutro 500ml",
    brand: "Ypê",
    category: "Limpeza",
    sku: "DET-YPE-500ML",
    ean: "7896098900116",
    unit: "un",
    specifications: { volume: "500ml", fragrância: "Neutro" },
    suppliers: [
      { supplierName: "Atacadão", price: 2.80, stock: 800, minQuantity: 24 },
      { supplierName: "Assaí Atacadista", price: 2.60, stock: 1000, minQuantity: 30 },
      { supplierName: "Makro", price: 3.00, stock: 600, minQuantity: 36 },
      { supplierName: "Martins Atacado", price: 2.50, stock: 1200, minQuantity: 48 }
    ]
  },
  {
    name: "Sabão em Pó Omo 1kg",
    brand: "Omo",
    category: "Limpeza",
    sku: "SAB-OMO-1KG",
    ean: "7891150001015",
    unit: "cx",
    specifications: { peso: "1kg", tipo: "Concentrado" },
    suppliers: [
      { supplierName: "Atacadão", price: 12.90, stock: 400, minQuantity: 12 },
      { supplierName: "Assaí Atacadista", price: 12.50, stock: 600, minQuantity: 15 },
      { supplierName: "Amazon Brasil", price: 14.20, stock: 200, minQuantity: 6 },
      { supplierName: "Mercado Livre", price: 13.80, stock: 150, minQuantity: 5 }
    ]
  },

  // Higiene
  {
    name: "Papel Higiênico Neve Folha Dupla 12un",
    brand: "Neve",
    category: "Higiene",
    sku: "PAP-NEV-12UN",
    ean: "7896024726014",
    unit: "pct",
    specifications: { folhas: "Dupla", unidades: "12 rolos" },
    suppliers: [
      { supplierName: "Atacadão", price: 18.90, stock: 300, minQuantity: 6 },
      { supplierName: "Assaí Atacadista", price: 17.80, stock: 500, minQuantity: 8 },
      { supplierName: "Makro", price: 19.50, stock: 250, minQuantity: 10 },
      { supplierName: "Amazon Brasil", price: 21.00, stock: 100, minQuantity: 3 }
    ]
  },
  {
    name: "Shampoo Seda Reconstrução 325ml",
    brand: "Seda",
    category: "Higiene",
    sku: "SHA-SED-325ML",
    ean: "7891150056015",
    unit: "un",
    specifications: { volume: "325ml", tipo: "Reconstrução" },
    suppliers: [
      { supplierName: "Atacadão", price: 8.50, stock: 200, minQuantity: 12 },
      { supplierName: "Amazon Brasil", price: 9.20, stock: 150, minQuantity: 6 },
      { supplierName: "Mercado Livre", price: 8.90, stock: 100, minQuantity: 5 },
      { supplierName: "Magazine Luiza", price: 9.50, stock: 80, minQuantity: 4 }
    ]
  },

  // Eletrônicos
  {
    name: "Smartphone Samsung Galaxy A14 128GB",
    brand: "Samsung",
    category: "Eletrônicos",
    sku: "CEL-SAM-A14-128",
    ean: "8806094665017",
    unit: "un",
    specifications: { memoria: "128GB", tela: "6.6\"", cor: "Preto" },
    suppliers: [
      { supplierName: "Amazon Brasil", price: 899.00, stock: 50, minQuantity: 1 },
      { supplierName: "Mercado Livre", price: 920.00, stock: 30, minQuantity: 1 },
      { supplierName: "Magazine Luiza", price: 949.00, stock: 25, minQuantity: 1 },
      { supplierName: "Alibaba Brasil", price: 850.00, stock: 100, minQuantity: 5 }
    ]
  },
  {
    name: "Fone de Ouvido JBL Tune 510BT",
    brand: "JBL",
    category: "Eletrônicos",
    sku: "FON-JBL-510BT",
    ean: "6925281982019",
    unit: "un",
    specifications: { tipo: "Bluetooth", cor: "Preto", bateria: "40h" },
    suppliers: [
      { supplierName: "Amazon Brasil", price: 189.00, stock: 80, minQuantity: 2 },
      { supplierName: "Mercado Livre", price: 199.00, stock: 60, minQuantity: 1 },
      { supplierName: "Magazine Luiza", price: 209.00, stock: 40, minQuantity: 1 },
      { supplierName: "Alibaba Brasil", price: 165.00, stock: 200, minQuantity: 10 }
    ]
  },

  // Papelaria
  {
    name: "Papel A4 Chamex 500 folhas",
    brand: "Chamex",
    category: "Papelaria",
    sku: "PAP-CHA-A4-500",
    ean: "7891000100014",
    unit: "pct",
    specifications: { tamanho: "A4", folhas: "500", gramatura: "75g/m²" },
    suppliers: [
      { supplierName: "Amazon Brasil", price: 24.90, stock: 200, minQuantity: 5 },
      { supplierName: "Mercado Livre", price: 26.50, stock: 150, minQuantity: 3 },
      { supplierName: "Magazine Luiza", price: 27.90, stock: 100, minQuantity: 2 },
      { supplierName: "Makro", price: 23.50, stock: 300, minQuantity: 10 }
    ]
  },
  {
    name: "Caneta Esferográfica BIC Cristal Azul",
    brand: "BIC",
    category: "Papelaria",
    sku: "CAN-BIC-CRIS-AZ",
    ean: "070330334014",
    unit: "un",
    specifications: { cor: "Azul", tipo: "Esferográfica", ponta: "1.0mm" },
    suppliers: [
      { supplierName: "Amazon Brasil", price: 1.20, stock: 1000, minQuantity: 50 },
      { supplierName: "Mercado Livre", price: 1.30, stock: 800, minQuantity: 25 },
      { supplierName: "Makro", price: 1.10, stock: 1500, minQuantity: 100 },
      { supplierName: "Alibaba Brasil", price: 0.95, stock: 5000, minQuantity: 500 }
    ]
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    console.log('Iniciando seed do banco de dados...');
    
    // Usar batch para operações em lote
    const batch = writeBatch(db);
    const suppliersMap = new Map();

    // 1. Inserir fornecedores
    console.log('Inserindo fornecedores...');
    for (const supplierData of SUPPLIERS_DATA) {
      const supplierRef = doc(collection(db, 'suppliers'));
      const supplierWithId = {
        ...supplierData,
        createdAt: new Date()
      };
      
      batch.set(supplierRef, supplierWithId);
      suppliersMap.set(supplierData.name, supplierRef.id);
    }

    // Executar batch de fornecedores
    await batch.commit();
    console.log(`${SUPPLIERS_DATA.length} fornecedores inseridos`);

    // 2. Inserir produtos
    console.log('Inserindo produtos...');
    let productCount = 0;
    
    for (const productData of PRODUCTS_DATA) {
      const { suppliers, ...baseProduct } = productData;
      
      // Para cada fornecedor do produto
      for (const supplierInfo of suppliers) {
        const supplierId = suppliersMap.get(supplierInfo.supplierName);
        if (!supplierId) {
          console.warn(`Fornecedor não encontrado: ${supplierInfo.supplierName}`);
          continue;
        }

        const productRef = doc(collection(db, 'products'));
        const productDoc = {
          ...baseProduct,
          supplierId,
          supplierName: supplierInfo.supplierName,
          wholesalePrice: supplierInfo.price,
          minQuantity: supplierInfo.minQuantity,
          stock: supplierInfo.stock,
          productUrl: generateProductUrl(supplierInfo.supplierName, baseProduct.name),
          imageUrl: generateImageUrl(baseProduct.name),
          lastUpdated: new Date()
        };

        // Usar addDoc para produtos individuais
        await addDoc(collection(db, 'products'), productDoc);
        productCount++;
      }
    }

    console.log(`${productCount} produtos inseridos`);

    // 3. Criar configurações padrão do usuário
    const defaultConfigRef = doc(db, 'user_configurations', 'default');
    await setDoc(defaultConfigRef, {
      defaultMargin: 30,
      taxes: {
        icms: 18,
        pis: 1.65,
        cofins: 7.6,
        ipi: 0
      },
      operationalCosts: 15,
      favoriteSuppliers: [],
      savedSearches: [],
      createdAt: new Date()
    });

    console.log('Seed concluído com sucesso!');
    
    res.status(200).json({
      success: true,
      message: 'Banco de dados populado com sucesso',
      stats: {
        suppliers: SUPPLIERS_DATA.length,
        products: productCount,
        categories: [...new Set(PRODUCTS_DATA.map(p => p.category))].length
      }
    });

  } catch (error) {
    console.error('Erro no seed:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao popular banco de dados',
      error: error.message
    });
  }
}

// Funções auxiliares para gerar URLs
function generateProductUrl(supplierName, productName) {
  const baseUrls = {
    "Atacadão": "https://www.atacadao.com.br/busca?q=",
    "Assaí Atacadista": "https://www.assai.com.br/busca?q=",
    "Makro": "https://www.makro.com.br/busca?q=",
    "Amazon Brasil": "https://www.amazon.com.br/s?k=",
    "Mercado Livre": "https://lista.mercadolivre.com.br/",
    "Magazine Luiza": "https://www.magazineluiza.com.br/busca/",
    "Martins Atacado": "https://www.martins.com.br/busca?q=",
    "Roldão Atacadista": "https://www.roldao.com.br/busca?q=",
    "Alibaba Brasil": "https://portuguese.alibaba.com/trade/search?SearchText=",
    "Carrefour Atacadão": "https://www.carrefour.com.br/busca?q="
  };

  const baseUrl = baseUrls[supplierName] || "#";
  const searchTerm = encodeURIComponent(productName.toLowerCase());
  
  return `${baseUrl}${searchTerm}`;
}

function generateImageUrl(productName) {
  // Gerar URL de placeholder baseada no nome do produto
  const cleanName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `https://via.placeholder.com/200x200/f0f0f0/666666?text=${encodeURIComponent(productName.split(' ')[0])}`;
}
