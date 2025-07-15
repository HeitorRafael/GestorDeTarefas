// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Para fazer requisições HTTP
import { useNavigate } from 'react-router-dom'; // Para redirecionar após login/logout

// Crie o contexto de autenticação
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Armazena informações do usuário (id, username, role)
  const [token, setToken] = useState(localStorage.getItem('token') || null); // Armazena o JWT
  const [loading, setLoading] = useState(true); // Estado para indicar se está carregando a autenticação
  const navigate = useNavigate(); // Hook para navegação

  // URL base do seu backend
  const API_URL = 'http://localhost:5000/api/auth';

  // Efeito para verificar o token ao carregar a aplicação
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        // Axios interceptor para adicionar o token em todas as requisições
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          // Em um sistema mais robusto, você faria uma rota /api/auth/me para validar o token e obter dados do usuário
          // Por enquanto, vamos extrair os dados do token (requer decodificação no frontend ou confiança no JWT)
          // Para este MVP, vamos simular a extração do payload do token, mas o ideal seria uma rota de backend.
          // Você pode instalar `jwt-decode` para isso: npm install jwt-decode
          // const decoded = jwtDecode(token);
          // setUser({ id: decoded.user.id, username: decoded.user.username, role: decoded.user.role });

          // Por enquanto, apenas um placeholder para o usuário logado
          // Em um projeto real, você faria uma chamada para /api/auth/me para obter os detalhes do usuário
          // para ter certeza de que o token é válido e obter os dados mais recentes.
          // Para fins de MVP e agilidade, vamos usar um hack:
          // O token JWT é composto por header.payload.signature.
          // O payload é base64 encodado. Vamos decodificá-lo grosseiramente aqui para simular.
          const payloadBase64 = token.split('.')[1];
          const decodedPayload = JSON.parse(atob(payloadBase64)); // atob decodifica base64
          setUser(decodedPayload.user); // Assume que o payload tem uma chave 'user'

        } catch (error) {
          console.error('Token inválido ou expirado:', error);
          setToken(null);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
          setUser(null);
          navigate('/login'); // Redireciona para login se o token for inválido
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token, navigate]);

  // Função de Login
  const login = async (username, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken); // Armazena o token no localStorage
      axios.defaults.headers.common['x-auth-token'] = newToken; // Define o cabeçalho padrão
      
      // Decodifica o token para obter os dados do usuário (MVP)
      const payloadBase64 = newToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      setUser(decodedPayload.user);

      // Redireciona para o dashboard ou rota apropriada
      if (decodedPayload.user.role === 'admin') {
        navigate('/time-tracking');
      } else {
        navigate('/dashboard');
      }
      return true; // Sucesso
    } catch (err) {
      console.error('Erro de login:', err.response ? err.response.data.msg : err.message);
      setToken(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setUser(null);
      return err.response ? err.response.data.msg : 'Erro desconhecido ao tentar logar.'; // Retorna a mensagem de erro
    }
  };

  // Função de Logout
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token']; // Remove o cabeçalho
    setUser(null);
    navigate('/login'); // Redireciona para a tela de login
  };

  // Valor do contexto
  const authContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user, // Booleano para verificar se está autenticado
    isAdmin: user && user.role === 'admin', // Booleano para verificar se é admin
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);