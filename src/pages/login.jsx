import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { login, register } from '../lib/auth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (isLogin) {
        result = login(email, password);
      } else {
        result = register(email, password, name);
      }
      
      if (result.success) {
        console.log('Usuário autenticado:', result.user);
        router.push('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  const fillDemoAccount = (type) => {
    if (type === 'admin') {
      setEmail('admin@comparala.com');
      setPassword('123456');
    } else {
      setEmail('vendedor@comparala.com');
      setPassword('123456');
    }
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Compara-Lá App
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Faça login na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Contas de demonstração */}
        <div className="bg-blue-900/30 p-4 rounded-lg mb-6">
          <h3 className="text-white font-medium mb-3 text-center">🔑 Contas Demo</h3>
          <div className="space-y-2">
            <button
              onClick={() => fillDemoAccount('admin')}
              className="w-full text-left bg-blue-800/50 hover:bg-blue-700/50 p-2 rounded text-sm text-gray-300 transition-colors"
            >
              👨‍💼 Admin: admin@comparala.com
            </button>
            <button
              onClick={() => fillDemoAccount('vendedor')}
              className="w-full text-left bg-green-800/50 hover:bg-green-700/50 p-2 rounded text-sm text-gray-300 transition-colors"
            >
              🛒 Vendedor: vendedor@comparala.com
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-gray-300 mb-2">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome completo"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isLogin ? "••••••••" : "Mínimo 6 caracteres"}
              required
            />
            {!isLogin && (
              <p className="mt-1 text-xs text-gray-400">
                A senha deve ter pelo menos 6 caracteres
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Entrando...' : 'Criando conta...'}
              </div>
            ) : (
              isLogin ? '🔑 Entrar' : '✨ Criar Conta'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {isLogin ? 'Não tem conta?' : 'Já tem uma conta?'}
          <button
            onClick={toggleMode}
            className="ml-1 text-blue-400 hover:text-blue-300 hover:underline"
          >
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </p>
      </div>
    </div>
  );
}
