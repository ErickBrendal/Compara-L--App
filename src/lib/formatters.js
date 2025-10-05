/**
 * Biblioteca de formatação para valores, datas e textos
 */

/**
 * Formata valor monetário em Real brasileiro
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado (ex: R$ 1.234,56)
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata porcentagem
 * @param {number} value - Valor em decimal ou percentual
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Porcentagem formatada (ex: 15,5%)
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata número com separadores de milhares
 * @param {number} value - Número a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Número formatado (ex: 1.234,56)
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formata data em formato brasileiro
 * @param {Date|string} date - Data a ser formatada
 * @param {boolean} includeTime - Se deve incluir horário
 * @returns {string} Data formatada (ex: 05/10/2025 ou 05/10/2025 14:30)
 */
export function formatDate(date, includeTime = false) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (includeTime) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} CNPJ formatado (ex: 12.345.678/0001-90)
 */
export function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return cnpj;
  
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Formata telefone brasileiro
 * @param {string} phone - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Normaliza nome de produto para busca
 * @param {string} productName - Nome do produto
 * @returns {string} Nome normalizado
 */
export function normalizeProductName(productName) {
  if (!productName) return '';
  
  return productName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

/**
 * Extrai informações de quantidade e unidade do nome do produto
 * @param {string} productName - Nome do produto
 * @returns {object} Informações extraídas
 */
export function extractProductInfo(productName) {
  if (!productName) return { name: '', quantity: null, unit: null };
  
  // Padrões comuns: "5kg", "1L", "500ml", "12un", "1cx"
  const patterns = [
    /(\d+(?:,\d+)?)\s*(kg|g|l|ml|un|cx|pct|dz)/gi,
    /(\d+(?:,\d+)?)\s*(quilos?|gramas?|litros?|mililitros?|unidades?|caixas?|pacotes?|dúzias?)/gi
  ];
  
  let quantity = null;
  let unit = null;
  let cleanName = productName;
  
  for (const pattern of patterns) {
    const match = productName.match(pattern);
    if (match) {
      const [fullMatch, qty, unitMatch] = match[0].match(/(\d+(?:,\d+)?)\s*(.+)/);
      quantity = parseFloat(qty.replace(',', '.'));
      unit = normalizeUnit(unitMatch);
      cleanName = productName.replace(fullMatch, '').trim();
      break;
    }
  }
  
  return {
    name: cleanName,
    quantity,
    unit,
    originalName: productName
  };
}

/**
 * Normaliza unidades de medida
 * @param {string} unit - Unidade a ser normalizada
 * @returns {string} Unidade normalizada
 */
function normalizeUnit(unit) {
  const unitMap = {
    'kg': 'kg',
    'quilos': 'kg',
    'quilo': 'kg',
    'g': 'g',
    'gramas': 'g',
    'grama': 'g',
    'l': 'L',
    'litros': 'L',
    'litro': 'L',
    'ml': 'ml',
    'mililitros': 'ml',
    'mililitro': 'ml',
    'un': 'un',
    'unidades': 'un',
    'unidade': 'un',
    'cx': 'cx',
    'caixas': 'cx',
    'caixa': 'cx',
    'pct': 'pct',
    'pacotes': 'pct',
    'pacote': 'pct',
    'dz': 'dz',
    'dúzias': 'dz',
    'dúzia': 'dz'
  };
  
  return unitMap[unit.toLowerCase()] || unit;
}

/**
 * Formata status de viabilidade
 * @param {string} viability - Nível de viabilidade (high, medium, low)
 * @returns {object} Configuração de exibição
 */
export function formatViability(viability) {
  const configs = {
    high: {
      label: 'Alta Viabilidade',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: '✅'
    },
    medium: {
      label: 'Viabilidade Moderada',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: '⚠️'
    },
    low: {
      label: 'Baixa Viabilidade',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: '❌'
    }
  };
  
  return configs[viability] || configs.medium;
}

/**
 * Formata tempo de entrega
 * @param {string|number} deliveryTime - Tempo em dias ou string
 * @returns {string} Tempo formatado
 */
export function formatDeliveryTime(deliveryTime) {
  if (!deliveryTime) return 'Não informado';
  
  if (typeof deliveryTime === 'number') {
    if (deliveryTime === 1) return '1 dia útil';
    return `${deliveryTime} dias úteis`;
  }
  
  return deliveryTime;
}

/**
 * Formata condições de pagamento
 * @param {array} paymentTerms - Array de condições
 * @returns {string} Condições formatadas
 */
export function formatPaymentTerms(paymentTerms) {
  if (!paymentTerms || paymentTerms.length === 0) {
    return 'À vista';
  }
  
  return paymentTerms.join(', ');
}

/**
 * Trunca texto com reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}
