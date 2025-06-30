// Exemplo de estrutura de dados para um User
const userModel = {
  id: null,        // number
  username: '',    // string
  role: '',        // 'common' | 'admin'
  // password não será exposto após o login
};

// Exemplo de payload de login
const loginPayload = {
  username: '', // string
  password: '', // string
};

// Exemplo de resposta de login
const loginResponse = {
  token: '', // string (JWT)
};

// Exemplo de payload para cadastro/deleção de usuário (apenas para Admin)
const userManagementPayload = {
  username: '', // string
  password: '', // string
  role: 'common', // 'common' | 'admin'
};