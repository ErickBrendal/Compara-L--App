import React, { useState } from 'react';
import PriceCalculator from './PriceCalculator';
import { formatCurrency, formatDeliveryTime, formatPaymentTerms } from '../lib/formatters';

const ProductCard = ({ product, onBuyClick = null }) => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleBuyClick = () => {
    if (product.productUrl && product.productUrl !== '#') {
      window.open(product.productUrl, '_blank');
    }
    
    if (onBuyClick) {
      onBuyClick(product);
    }
  };

  const handleAnalysisChange = (newAnalysis) => {
    setAnalysis(newAnalysis);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header do Card */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          {/* Imagem do Produto */}
          <div className="flex-shrink-0">
            <img
              src={product.image || product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>
          
          {/* Informações Básicas */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.name}
            </h3>
            
            {product.brand && (
              <p className="text-sm text-gray-600 mb-1">
                Marca: <span className="font-medium">{product.brand}</span>
              </p>
            )}
            
            {product.category && (
              <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {product.category}
              </span>
            )}
          </div>
          
          {/* Preço Principal */}
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(product.price || product.wholesalePrice)}
            </div>
            {product.unit && (
              <div className="text-sm text-gray-500">
                por {product.unit}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informações do Fornecedor */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium text-gray-900">
                {product.supplier?.name || product.supplierName || 'Fornecedor'}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center">
                  {renderStars(product.supplier?.rating || product.rating || 4.0)}
                  <span className="ml-1">
                    ({(product.supplier?.rating || product.rating || 4.0).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-600">
            <div>📦 {formatDeliveryTime(product.supplier?.deliveryTime || product.delivery)}</div>
            {product.stock && (
              <div className={`${product.stock > 50 ? 'text-green-600' : product.stock > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                Estoque: {product.stock}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhes Adicionais */}
      <div className="px-4 py-3 space-y-2">
        {product.minQuantity && product.minQuantity > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pedido mínimo:</span>
            <span className="font-medium">{product.minQuantity} unidades</span>
          </div>
        )}
        
        {product.supplier?.paymentTerms && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pagamento:</span>
            <span className="font-medium">
              {formatPaymentTerms(product.supplier.paymentTerms)}
            </span>
          </div>
        )}
        
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="text-sm">
            <span className="text-gray-600">Especificações:</span>
            <div className="mt-1 space-y-1">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500 capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={handleBuyClick}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🛒 Comprar no {product.supplier?.name || product.supplierName || 'Fornecedor'}
          </button>
          
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`px-4 py-2 rounded-lg border transition-colors font-medium ${
              showCalculator 
                ? 'bg-green-100 text-green-700 border-green-300' 
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            💰 {showCalculator ? 'Ocultar' : 'Calcular'}
          </button>
        </div>

        {/* Resumo da Análise */}
        {analysis && !showCalculator && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-gray-600">Custo Total</div>
                <div className="font-semibold">
                  {formatCurrency(analysis.costs.totalCost)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Preço Sugerido</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(analysis.pricing.salePrice)}
                </div>
              </div>
              <div>
                <div className="text-gray-600">ROI</div>
                <div className="font-semibold text-blue-600">
                  {analysis.pricing.roi.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculadora de Preços */}
      {showCalculator && (
        <div className="border-t border-gray-100">
          <PriceCalculator
            basePrice={product.price || product.wholesalePrice}
            minQuantity={product.minQuantity || 1}
            supplierName={product.supplier?.name || product.supplierName}
            onAnalysisChange={handleAnalysisChange}
          />
        </div>
      )}
    </div>
  );
};

export default ProductCard;
