import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro no upload:', error);
      setResult({ error: 'Erro ao processar arquivo' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Upload de Planilhas</h1>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-3 text-lg">
                Selecione um arquivo (.csv ou .xlsx)
              </label>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {file && (
              <div className="text-gray-300">
                <p>Arquivo selecionado: <span className="text-white font-semibold">{file.name}</span></p>
                <p className="text-sm text-gray-400">Tamanho: {(file.size / 1024).toFixed(2)} KB</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processando...' : 'Fazer Upload'}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Resultado:</h3>
              {result.error ? (
                <p className="text-red-400">{result.error}</p>
              ) : (
                <div className="text-gray-300">
                  <p>Arquivo processado com sucesso!</p>
                  <p className="text-sm mt-2">Linhas processadas: {result.rows || 0}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
