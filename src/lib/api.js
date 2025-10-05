import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchProducts = async (query) => {
  try {
    const response = await api.post('/search', { query });
    return response.data;
  } catch (error) {
    console.error('Erro na busca:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

export const getAIComparison = async (products) => {
  try {
    const response = await api.post('/ai-compare', { products });
    return response.data;
  } catch (error) {
    console.error('Erro na comparação IA:', error);
    throw error;
  }
};
