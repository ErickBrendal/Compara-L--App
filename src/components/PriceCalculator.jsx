import React, { useState, useEffect } from 'react';
import { analyzeProductViability } from '../lib/calculations';
import { formatCurrency, formatPercentage, formatViability } from '../lib/formatters';

const PriceCalculator = ({ 
  basePrice, 
  minQuantity = 1, 
  supplierName = '',
  onAnalysisChange = null 
}) => {
  const [quantity, setQuantity] = useState(minQuantity);
  const [desiredMargin, setDesiredMargin] = useState(30);
  const [freight, setFreight] = useState(0);
  const [taxes, setTaxes] = useState({
    icms: 18,
    pis: 1.65,
    cofins: 7.6,
    ipi: 0
  });
  const [operationalCosts, setOperationalCosts] = useState(15);
  const [analysis, setAnalysis] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Recalcular sempre que os inputs mudarem
  useEffect(() => {
    if (basePrice > 0) {
      const newAnalysis = analyzeProductViability(
        basePrice,
        quantity,
        desiredMargin,
        {
          taxes,
          operationalCosts,
          freight
        }
      );
      setAnalysis(newAnalysis);
      
      // Notificar componente pai se callback fornecido
      if (onAnalysisChange) {
        onAnalysisChange(newAnalysis);
      }
    }
  }, [basePrice, quantity, desiredMargin, taxes, operationalCosts, freight, onAnalysisChange]);

  if (!basePrice || basePrice <= 0) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-500">Preço não disponível para cálculo</p>
      </div>
    );
  }

  const viabilityConfig = analysis ? formatViability(analysis.viability) : null;

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          💰 Calculadora de Margem
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvanced ? 'Ocultar' : 'Avançado'}
        </button>
      </div>

      {/* Inputs Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade
          </label>
          <input
            type="number"
            min={minQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(minQuantity, parseInt(e.target.value) || minQuantity))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {minQuantity > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Mínimo: {minQuantity} unidades
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Margem Desejada (%)
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={desiredMargin}
            onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frete (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={freight}
            onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Configurações Avançadas */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-gray-700">Impostos (%)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">ICMS</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={taxes.icms}
                onChange={(e) => setTaxes({...taxes, icms: parseFloat(e.target.value) || 0})}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">PIS</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={taxes.pis}
                onChange={(e) => setTaxes({...taxes, pis: parseFloat(e.target.value) || 0})}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">COFINS</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={taxes.cofins}
                onChange={(e) => setTaxes({...taxes, cofins: parseFloat(e.target.value) || 0})}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">IPI</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={taxes.ipi}
                onChange={(e) => setTaxes({...taxes, ipi: parseFloat(e.target.value) || 0})}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custos Operacionais (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={operationalCosts}
              onChange={(e) => setOperationalCosts(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Inclui: aluguel, funcionários, marketing, etc.
            </p>
          </div>
        </div>
      )}

      {/* Resultados */}
      {analysis && (
        <div className="border-t pt-4 space-y-4">
          {/* Status de Viabilidade */}
          <div className={`p-3 rounded-lg ${viabilityConfig.bgColor}`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{viabilityConfig.icon}</span>
              <span className={`font-semibold ${viabilityConfig.color}`}>
                {viabilityConfig.label}
              </span>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">💸 Custos</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Preço base ({quantity}x):</span>
                  <span>{formatCurrency(analysis.costs.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impostos:</span>
                  <span>{formatCurrency(analysis.costs.taxes.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custos operacionais:</span>
                  <span>{formatCurrency(analysis.costs.operationalCosts)}</span>
                </div>
                {freight > 0 && (
                  <div className="flex justify-between">
                    <span>Frete:</span>
                    <span>{formatCurrency(analysis.costs.freight)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>Custo Total:</span>
                  <span>{formatCurrency(analysis.costs.totalCost)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">💰 Venda</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Preço sugerido:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(analysis.pricing.salePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lucro total:</span>
                  <span className="text-green-600">
                    {formatCurrency(analysis.pricing.profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lucro por unidade:</span>
                  <span className="text-green-600">
                    {formatCurrency(analysis.pricing.profit / quantity)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1">
                  <span>ROI:</span>
                  <span className="text-blue-600">
                    {formatPercentage(analysis.pricing.roi)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendações */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Recomendações</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Resumo por Unidade */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Custo/Unidade</div>
                <div className="font-semibold">
                  {formatCurrency(analysis.costs.costPerUnit)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Venda/Unidade</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(analysis.pricing.salePrice / quantity)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Lucro/Unidade</div>
                <div className="font-semibold text-blue-600">
                  {formatCurrency(analysis.pricing.profit / quantity)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
