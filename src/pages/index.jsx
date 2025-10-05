import { useState } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import PriceCard from '../components/PriceCard';

export default function Home() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Compara-Lá App
          </h1>
          <p className="text-gray-300 text-lg">
            Comparador global de preços inteligente e automatizado
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => (
            <PriceCard key={index} data={item} />
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-12">
            <p>Faça uma busca para comparar preços</p>
          </div>
        )}
      </main>
    </div>
  );
}
