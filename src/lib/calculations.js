/**
 * Biblioteca de cálculos para margem de lucro e viabilidade
 */

// Configurações padrão de impostos brasileiros
export const DEFAULT_TAXES = {
  icms: 18, // %
  pis: 1.65, // %
  cofins: 7.6, // %
  ipi: 0, // % (varia por produto)
};

export const DEFAULT_OPERATIONAL_COSTS = 15; // % custos operacionais

/**
 * Calcula o custo total de um produto incluindo impostos e custos operacionais
 * @param {number} basePrice - Preço base do fornecedor
 * @param {number} quantity - Quantidade
 * @param {object} taxes - Impostos (icms, pis, cofins, ipi)
 * @param {number} operationalCosts - Custos operacionais em %
 * @param {number} freight - Valor do frete
 * @returns {object} Detalhamento dos custos
 */
export function calculateTotalCost(basePrice, quantity = 1, taxes = DEFAULT_TAXES, operationalCosts = DEFAULT_OPERATIONAL_COSTS, freight = 0) {
  const subtotal = basePrice * quantity;
  
  // Calcular impostos
  const icmsValue = (subtotal * taxes.icms) / 100;
  const pisValue = (subtotal * taxes.pis) / 100;
  const cofinsValue = (subtotal * taxes.cofins) / 100;
  const ipiValue = (subtotal * taxes.ipi) / 100;
  const totalTaxes = icmsValue + pisValue + cofinsValue + ipiValue;
  
  // Calcular custos operacionais
  const operationalValue = (subtotal * operationalCosts) / 100;
  
  // Custo total
  const totalCost = subtotal + totalTaxes + operationalValue + freight;
  
  return {
    subtotal,
    taxes: {
      icms: icmsValue,
      pis: pisValue,
      cofins: cofinsValue,
      ipi: ipiValue,
      total: totalTaxes
    },
    operationalCosts: operationalValue,
    freight,
    totalCost,
    costPerUnit: totalCost / quantity
  };
}

/**
 * Calcula o preço de venda sugerido com base na margem desejada
 * @param {number} totalCost - Custo total
 * @param {number} desiredMargin - Margem desejada em %
 * @returns {object} Detalhamento do preço de venda
 */
export function calculateSalePrice(totalCost, desiredMargin) {
  const salePrice = totalCost * (1 + desiredMargin / 100);
  const profit = salePrice - totalCost;
  const roi = (profit / totalCost) * 100;
  
  return {
    salePrice,
    profit,
    roi,
    margin: desiredMargin
  };
}

/**
 * Análise completa de viabilidade de um produto
 * @param {number} basePrice - Preço base do fornecedor
 * @param {number} quantity - Quantidade
 * @param {number} desiredMargin - Margem desejada em %
 * @param {object} options - Opções adicionais (impostos, custos, frete)
 * @returns {object} Análise completa
 */
export function analyzeProductViability(basePrice, quantity = 1, desiredMargin = 30, options = {}) {
  const {
    taxes = DEFAULT_TAXES,
    operationalCosts = DEFAULT_OPERATIONAL_COSTS,
    freight = 0,
    targetSalePrice = null
  } = options;
  
  // Calcular custos
  const costAnalysis = calculateTotalCost(basePrice, quantity, taxes, operationalCosts, freight);
  
  // Calcular preço de venda
  const priceAnalysis = calculateSalePrice(costAnalysis.totalCost, desiredMargin);
  
  // Determinar viabilidade
  let viability = 'high'; // green
  if (priceAnalysis.roi < 20) viability = 'medium'; // yellow
  if (priceAnalysis.roi < 10) viability = 'low'; // red
  
  // Se há preço alvo, comparar
  let targetComparison = null;
  if (targetSalePrice) {
    const targetProfit = targetSalePrice - costAnalysis.totalCost;
    const targetROI = (targetProfit / costAnalysis.totalCost) * 100;
    const targetMargin = ((targetSalePrice - costAnalysis.totalCost) / costAnalysis.totalCost) * 100;
    
    targetComparison = {
      targetPrice: targetSalePrice,
      targetProfit,
      targetROI,
      targetMargin,
      feasible: targetROI > 5 // Mínimo 5% ROI
    };
  }
  
  return {
    basePrice,
    quantity,
    costs: costAnalysis,
    pricing: priceAnalysis,
    viability,
    targetComparison,
    recommendations: generateRecommendations(priceAnalysis.roi, viability)
  };
}

/**
 * Gera recomendações baseadas na análise
 * @param {number} roi - ROI calculado
 * @param {string} viability - Nível de viabilidade
 * @returns {array} Lista de recomendações
 */
function generateRecommendations(roi, viability) {
  const recommendations = [];
  
  if (viability === 'low') {
    recommendations.push('⚠️ ROI baixo - considere negociar melhor preço com fornecedor');
    recommendations.push('💡 Avalie aumentar quantidade para reduzir custo unitário');
    recommendations.push('🔍 Busque fornecedores alternativos');
  } else if (viability === 'medium') {
    recommendations.push('⚡ ROI moderado - produto viável com cautela');
    recommendations.push('📈 Considere estratégias de marketing para justificar preço');
  } else {
    recommendations.push('✅ Excelente oportunidade de negócio');
    recommendations.push('🚀 ROI alto - produto muito viável para revenda');
  }
  
  if (roi > 50) {
    recommendations.push('💰 ROI excepcional - verifique se preços estão atualizados');
  }
  
  return recommendations;
}

/**
 * Compara múltiplos fornecedores para o mesmo produto
 * @param {array} suppliers - Lista de fornecedores com preços
 * @param {number} quantity - Quantidade desejada
 * @param {number} desiredMargin - Margem desejada
 * @returns {array} Fornecedores ordenados por viabilidade
 */
export function compareSuppliers(suppliers, quantity = 1, desiredMargin = 30) {
  return suppliers.map(supplier => {
    const analysis = analyzeProductViability(
      supplier.price,
      quantity,
      desiredMargin,
      {
        freight: supplier.freight || 0,
        taxes: supplier.taxes || DEFAULT_TAXES
      }
    );
    
    return {
      ...supplier,
      analysis,
      score: analysis.pricing.roi // Score baseado no ROI
    };
  }).sort((a, b) => b.score - a.score); // Ordenar por melhor ROI
}

/**
 * Calcula economia entre fornecedores
 * @param {array} suppliers - Lista de fornecedores analisados
 * @returns {object} Análise de economia
 */
export function calculateSavings(suppliers) {
  if (suppliers.length < 2) return null;
  
  const best = suppliers[0];
  const worst = suppliers[suppliers.length - 1];
  
  const savings = worst.analysis.costs.totalCost - best.analysis.costs.totalCost;
  const savingsPercentage = (savings / worst.analysis.costs.totalCost) * 100;
  
  return {
    bestSupplier: best.name,
    worstSupplier: worst.name,
    savings,
    savingsPercentage,
    bestPrice: best.analysis.costs.totalCost,
    worstPrice: worst.analysis.costs.totalCost
  };
}
