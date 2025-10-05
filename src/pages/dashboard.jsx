import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChartView from '../components/ChartView';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Simular dados de histórico
    const mockHistory = [
      { id: 1, product: 'Arroz 5kg', searches: 15, avgPrice: 28.50 },
      { id: 2, product: 'Óleo de Soja 900ml', searches: 12, avgPrice: 7.89 },
      { id: 3, product: 'Feijão Preto 1kg', searches: 10, avgPrice: 8.99 },
    ];
    setHistory(mockHistory);

    const mockChartData = [
      { name: 'Jan', price: 25.00 },
      { name: 'Fev', price: 26.50 },
      { name: 'Mar', price: 28.00 },
      { name: 'Abr', price: 27.50 },
      { name: 'Mai', price: 28.50 },
    ];
    setChartData(mockChartData);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Histórico de Buscas
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-gray-300">Produto</th>
                  <th className="py-3 px-4 text-gray-300">Buscas</th>
                  <th className="py-3 px-4 text-gray-300">Preço Médio</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4 text-white">{item.product}</td>
                    <td className="py-3 px-4 text-gray-300">{item.searches}</td>
                    <td className="py-3 px-4 text-green-400">
                      R$ {item.avgPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Variação de Preços
          </h2>
          <ChartView data={chartData} />
        </div>
      </main>
    </div>
  );
}
