# MaxiMundi - Sistema de Gestão de Tempo

<div align="center">

![MaxiMundi Logo](https://img.shields.io/badge/MaxiMundi-Time%20Management-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.11.0-0081CB?style=flat&logo=mui)](https://mui.com/)

*Sistema profissional para controle e relatório de tempo de trabalho*

</div>

## 📖 Sobre o Projeto

MaxiMundi é uma solução completa para gestão de tempo corporativo, desenvolvida com tecnologias modernas para oferecer uma experiência intuitiva e eficiente no controle de horas trabalhadas.

### ✨ Principais Funcionalidades

- **⏱️ Controle de Tempo em Tempo Real**
  - Cronômetro integrado para registro de atividades
  - Start/stop automático com validação
  - Histórico completo de entradas de tempo

- **📊 Dashboard Administrativo**
  - Relatórios mensais e semanais
  - Filtros por cliente, usuário e período
  - Estatísticas detalhadas de produtividade
  - Visualização em tabelas responsivas

- **👥 Gestão de Usuários**
  - Sistema de autenticação JWT
  - Níveis de acesso (Admin/Comum)
  - Gerenciamento completo de perfis

- **🏢 Gerenciamento de Clientes e Tarefas**
  - CRUD completo de clientes
  - Organização por tarefas específicas
  - Vinculação automática tempo-cliente-tarefa

- **🎨 Interface Moderna**
  - Design responsivo para desktop e mobile
  - Tema escuro/claro automático
  - Animações suaves e microinterações
  - Material Design UI

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Interface do usuário
- **Material-UI 5.11.0** - Componentes e design system
- **React Router Dom 6.30.1** - Roteamento
- **Axios 1.10.0** - Cliente HTTP
- **Date-fns** - Manipulação de datas

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5.1.0** - Framework web
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

### DevOps & Infraestrutura
- **CORS** - Cross-origin resource sharing
- **dotenv** - Variáveis de ambiente
- **Nodemon** - Development server

## 🚀 Instalação e Configuração

### 💡 **Para Empresa Pequena (até 10 funcionários)**
**👉 [Guia GRATUITO - Setup Local](SETUP-EMPRESA-PEQUENA.md)**
- ✅ 100% gratuito para sempre
- ✅ Setup em 30 minutos
- ✅ Funciona em qualquer computador

### Para Desenvolvimento

### Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL (versão 12 ou superior)
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/maximundi.git
cd maximundi
```

### 2. Configuração do Backend
```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações de banco
```

### 3. Configuração do Frontend
```bash
cd ../frontend
npm install
```

### 4. Inicialização do Banco de Dados
O sistema criará automaticamente as tabelas e dados iniciais na primeira execução.

### 5. Execução
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 👤 Credenciais Padrão

- **Admin**: `admin` / `admin123`
- **Usuário Comum**: `user1` / `senha123`

## 📁 Estrutura do Projeto

```
maximundi/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações de banco e inicialização
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Autenticação e validações
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   └── app.js          # Aplicação principal
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── contexts/        # Contexts do React
    │   ├── pages/          # Páginas da aplicação
    │   ├── config/         # Configurações e temas
    │   └── App.js          # Componente principal
    └── package.json
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (.env)
```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maximundi
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# Servidor
PORT=5000
NODE_ENV=production
```

## 📊 Funcionalidades por Perfil

### 👨‍💼 Administrador
- Visualização de todos os relatórios
- Gestão completa de usuários
- Gerenciamento de clientes e tarefas
- Filtros avançados por período e usuário
- Dashboard com estatísticas completas

### 👤 Usuário Comum
- Registro de tempo personal
- Visualização do próprio histórico
- Seleção de cliente e tarefa
- Interface simplificada de time-tracking

## 🛡️ Segurança

- Autenticação JWT com tokens seguros
- Middleware de verificação de roles
- Criptografia de senhas com bcrypt
- Validação de entrada em todas as rotas
- Proteção contra ataques CORS

## 📱 Responsividade

O sistema é totalmente responsivo, adaptando-se perfeitamente a:
- 💻 Desktop (1200px+)
- 📱 Tablet (768px - 1199px)
- 📱 Mobile (320px - 767px)

## 🎨 Temas

- **Tema Claro**: Interface limpa e profissional
- **Tema Escuro**: Redução de fadiga visual
- **Troca Automática**: Baseada na preferência do sistema

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@maximundi.com
- 🌐 Site: [www.maximundi.com](https://www.maximundi.com)

## 📈 Roadmap

- [ ] Integração com ferramentas de project management
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações push para mobile
- [ ] API REST documentada com Swagger
- [ ] Integração com calendários (Google, Outlook)
- [ ] Dashboard analytics avançado

---

<div align="center">
Desenvolvido com ❤️ para otimizar a gestão de tempo empresarial
</div>
