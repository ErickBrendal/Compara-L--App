import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query) => {
    setLoading(true);
    setSearchQuery(query);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        console.error('Erro na busca:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erro ao buscar:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductBuy = (product) => {
    // Analytics ou tracking de cliques
    console.log('Produto clicado:', product.name, 'Fornecedor:', product.supplier?.name);
  };

  const handlePopulateDatabase = async () => {
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(`✅ Banco de dados populado com sucesso!\n\n📊 Estatísticas:\n• ${data.stats.suppliers} fornecedores\n• ${data.stats.products} produtos\n• ${data.stats.categories} categorias`);
      } else {
        alert('❌ Erro ao popular banco: ' + data.message);
      }
    } catch (error) {
      alert('❌ Erro: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Compara-Lá App
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Comparador global de preços inteligente e automatizado
          </p>
          
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">Buscando produtos...</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Resultados para "{searchQuery}" ({searchResults.length})
              </h2>
              
              {/* Botão para popular banco de dados */}
              <button
                onClick={handlePopulateDatabase}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                🌱 Popular Banco
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((product, index) => (
                <ProductCard 
                  key={product.id || index} 
                  product={product}
                  onBuyClick={handleProductBuy}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Pronto para comparar preços?
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Digite o nome de um produto acima para encontrar os melhores preços de fornecedores brasileiros
              </p>
              
              <div className="bg-blue-900/50 p-4 rounded-lg text-left mb-6">
                <h4 className="text-white font-medium mb-2">💡 Exemplos de busca:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• "Arroz 5kg" - encontre arroz de diferentes marcas</li>
                  <li>• "Smartphone Samsung" - compare celulares</li>
                  <li>• "Detergente" - produtos de limpeza</li>
                  <li>• "Papel A4" - material de escritório</li>
                </ul>
              </div>

              {/* Botão para popular banco na tela inicial */}
              <button
                onClick={handlePopulateDatabase}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                🌱 Popular Banco de Dados
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Clique para adicionar produtos reais de fornecedores brasileiros
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
