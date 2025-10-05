/**
 * Sistema de autenticação simples usando localStorage
 * Para demonstração - em produção usar Firebase Auth ou similar
 */

// Simular usuários cadastrados
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@comparala.com',
    password: '123456',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: '2',
    email: 'vendedor@comparala.com',
    password: '123456',
    name: 'Vendedor Demo',
    role: 'user'
  }
];

/**
 * Fazer login
 */
export function login(email, password) {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    };
    
    // Salvar no localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('comparala_user', JSON.stringify(userSession));
    }
    
    return { success: true, user: userSession };
  }
  
  return { success: false, error: 'Email ou senha incorretos' };
}

/**
 * Criar conta
 */
export function register(email, password, name) {
  // Verificar se email já existe
  const existingUser = DEMO_USERS.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: 'Email já cadastrado' };
  }
  
  // Validações básicas
  if (!email || !password || !name) {
    return { success: false, error: 'Todos os campos são obrigatórios' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }
  
  if (!email.includes('@')) {
    return { success: false, error: 'Email inválido' };
  }
  
  // Criar novo usuário
  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    name,
    role: 'user'
  };
  
  // Em uma aplicação real, salvaria no banco de dados
  DEMO_USERS.push(newUser);
  
  // Fazer login automático
  const userSession = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    loginTime: new Date().toISOString()
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('comparala_user', JSON.stringify(userSession));
  }
  
  return { success: true, user: userSession };
}

/**
 * Fazer logout
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('comparala_user');
  }
  return { success: true };
}

/**
 * Obter usuário atual
 */
export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('comparala_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
        localStorage.removeItem('comparala_user');
      }
    }
  }
  return null;
}

/**
 * Verificar se está logado
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Hook para usar autenticação em componentes React
 */
export function useAuth() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);
  
  const loginUser = (email, password) => {
    const result = login(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };
  
  const registerUser = (email, password, name) => {
    const result = register(email, password, name);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };
  
  const logoutUser = () => {
    logout();
    setUser(null);
  };
  
  return {
    user,
    loading,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    isAuthenticated: !!user
  };
}
