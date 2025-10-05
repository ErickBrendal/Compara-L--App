import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { getCurrentUser } from '../lib/auth';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const user = getCurrentUser();
      if (user) {
        formData.append('userId', user.id);
      }

      const response = await fetch('/api/upload-prices', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      setResult({
        success: false,
        message: 'Erro ao enviar arquivo: ' + error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `nome,preco,fornecedor,marca,categoria,estoque,minimo,sku,ean,unidade
Arroz Tio João 5kg,22.90,Atacadão,Tio João,Alimentos,500,10,ARR-TJ-5KG,7896036097014,pct
Feijão Carioca 1kg,8.50,Assaí,Camil,Alimentos,300,20,FEI-CAM-1KG,7896006711014,pct
Óleo de Soja 900ml,4.20,Makro,Soya,Alimentos,200,24,OLE-SOY-900ML,7891000100127,un
Detergente Neutro 500ml,2.60,Martins,Ypê,Limpeza,800,30,DET-YPE-500ML,7896098900116,un`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-precos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            📊 Upload de Planilha de Preços
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Área de Upload */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Enviar Arquivo
              </h2>

              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-blue-400 bg-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                />
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-white font-medium">Clique para selecionar</span>
                  <span className="text-gray-400"> ou arraste um arquivo aqui</span>
                </label>
                
                <p className="text-gray-400 text-sm mt-2">
                  CSV, XLS ou XLSX até 10MB
                </p>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">📄 {file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  '📤 Enviar Arquivo'
                )}
              </button>
            </div>

            {/* Instruções e Template */}
            <div className="space-y-6">
              {/* Template */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  📋 Template
                </h2>
                <p className="text-gray-300 mb-4">
                  Baixe o template para organizar seus dados corretamente:
                </p>
                <button
                  onClick={downloadTemplate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200"
                >
                  ⬇️ Baixar Template CSV
                </button>
              </div>

              {/* Instruções */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  📖 Como usar
                </h2>
                <div className="space-y-3 text-gray-300 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Baixe o template CSV acima</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Preencha com seus produtos e preços</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Salve como CSV ou mantenha Excel</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Faça upload do arquivo aqui</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-900/30 rounded">
                  <h4 className="text-blue-300 font-medium mb-2">📝 Colunas obrigatórias:</h4>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• <strong>nome</strong> - Nome do produto</li>
                    <li>• <strong>preco</strong> - Preço de venda</li>
                    <li>• <strong>fornecedor</strong> - Nome do fornecedor</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado do Upload */}
          {result && (
            <div className="mt-8">
              <div className={`p-6 rounded-lg ${
                result.success 
                  ? 'bg-green-900/50 border border-green-500' 
                  : 'bg-red-900/50 border border-red-500'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 ${
                  result.success ? 'text-green-200' : 'text-red-200'
                }`}>
                  {result.success ? '✅ Upload Concluído!' : '❌ Erro no Upload'}
                </h3>
                
                <p className={`mb-4 ${
                  result.success ? 'text-green-300' : 'text-red-300'
                }`}>
                  {result.message}
                </p>

                {result.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-white">
                        {result.stats.totalRows}
                      </div>
                      <div className="text-sm text-gray-400">Linhas lidas</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-green-400">
                        {result.stats.processedProducts}
                      </div>
                      <div className="text-sm text-gray-400">Processados</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-blue-400">
                        {result.stats.savedProducts}
                      </div>
                      <div className="text-sm text-gray-400">Salvos</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded">
                      <div className="text-2xl font-bold text-red-400">
                        {result.stats.errors}
                      </div>
                      <div className="text-sm text-gray-400">Erros</div>
                    </div>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="bg-red-900/30 p-4 rounded">
                    <h4 className="text-red-300 font-medium mb-2">Erros encontrados:</h4>
                    <ul className="text-sm text-red-200 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
