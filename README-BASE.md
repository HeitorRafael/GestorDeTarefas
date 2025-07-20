# Sistema de Gestão de Tempo - Versão Base

<div align="center">

![Sistema](https://img.shields.io/badge/Sistema-Time%20Management-blue?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.11.0-0081CB?style=flat&logo=mui)](https://mui.com/)

*Sistema base customizável para controle e relatório de tempo de trabalho*

</div>

## 📖 Sobre o Projeto

Este é um sistema base para gestão de tempo corporativo, desenvolvido com tecnologias modernas para oferecer uma experiência intuitiva e eficiente no controle de horas trabalhadas. 

**Versão Base Customizável**: Este projeto foi criado como uma base sólida que pode ser facilmente adaptada para diferentes empresas e necessidades específicas.

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
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **Material-UI (MUI) 5.11.0** - Framework de componentes
- **Axios** - Cliente HTTP para APIs
- **React Router** - Roteamento SPA

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação por tokens
- **bcryptjs** - Hash de senhas

### Infraestrutura
- **PM2** - Gerenciador de processos
- **Nginx** - Proxy reverso (opcional)
- **Radmin VPN** - Acesso remoto seguro

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 16+ 
- PostgreSQL 12+
- Git

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/time-management-system.git
cd time-management-system
```

### 2. Configuração do Banco de Dados
```sql
# Conectar ao PostgreSQL
createdb timemanagement
# ou via psql:
CREATE DATABASE timemanagement;
GRANT ALL PRIVILEGES ON DATABASE timemanagement TO postgres;
```

### 3. Configuração Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### 4. Configuração Frontend
```bash
cd ../frontend
npm install

# Configurar API endpoint
# Editar src/config/config.js com seu servidor
```

### 5. Inicialização
```bash
# Opção 1: Desenvolvimento (terminais separados)
cd backend && npm run dev
cd frontend && npm start

# Opção 2: Produção com PM2
npm run install:all
npm start
```

## 🔧 Configuração de Ambiente

### Arquivo `.env` (Backend)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timemanagement
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu_jwt_secret_super_seguro
PORT=5000
NODE_ENV=production
```

### Configuração do Frontend
Edite `frontend/src/config/config.js`:
```javascript
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'http://SEU_SERVIDOR_IP:5000/api'
    : 'http://localhost:5000/api'
};
```

## 📋 Uso do Sistema

### Login Inicial
- **Usuário**: `admin`
- **Senha**: `admin123`

### Funcionalidades Principais
1. **Controle de Tempo**: Iniciar/parar cronômetro para tarefas
2. **Gestão de Clientes**: Adicionar/editar/remover clientes
3. **Gestão de Tarefas**: Organizar atividades por categorias
4. **Relatórios**: Visualizar estatísticas de tempo
5. **Usuários**: Gerenciar acesso ao sistema (Admin)

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Whitelist de IPs configurável
- CORS configurado
- Validação de dados de entrada

## 🌐 Deploy e Produção

O sistema está preparado para:
- **Deploy em servidor Windows/Linux**
- **Acesso remoto via Radmin VPN**
- **Proxy reverso com Nginx**
- **Gerenciamento com PM2**
- **Backup automático de banco**

Ver documentação específica:
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [RADMIN-VPN-SETUP.md](RADMIN-VPN-SETUP.md)
- [SETUP-EMPRESA-PEQUENA.md](SETUP-EMPRESA-PEQUENA.md)

## 🎨 Customização

Este sistema foi desenvolvido como base customizável. Para adaptar para sua empresa:

### 1. Identidade Visual
- Editar `frontend/src/theme/theme.js` (cores, tipografia)
- Substituir logo e favicons
- Ajustar títulos em `LoginPage.js` e `MainLayout.js`

### 2. Dados Iniciais
- Modificar `backend/src/config/initDb.js` (clientes e tarefas)
- Ajustar dados de exemplo conforme necessário

### 3. Funcionalidades
- Adicionar campos específicos nos models
- Implementar validações de negócio específicas
- Customizar relatórios conforme necessidade

## 📁 Estrutura do Projeto

```
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── config/         # Configurações de banco e inicialização
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Autenticação e validações
│   │   ├── models/         # Modelos de dados
│   │   └── routes/         # Rotas da API
│   └── package.json
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   └── theme/          # Configurações de tema
│   └── package.json
├── ecosystem.config.js     # Configuração PM2
└── README.md
```

## 🔄 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev-backend         # Servidor backend (modo dev)
npm run dev-frontend        # Frontend (modo dev)

# Produção
npm run install:all         # Instalar dependências
npm start                   # Iniciar com PM2
npm stop                    # Parar serviços
npm restart                 # Reiniciar serviços

# Build
npm run build              # Build do frontend para produção
```

## 🧪 Testes

```bash
cd backend
npm test                   # Executar testes backend

cd frontend  
npm test                   # Executar testes frontend
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Customização e Suporte

Este sistema base pode ser facilmente customizado para diferentes empresas e necessidades específicas.

### Serviços Disponíveis:
- ✅ Customização completa da identidade visual
- ✅ Adaptação de funcionalidades específicas
- ✅ Deploy e configuração em servidor
- ✅ Treinamento para uso do sistema
- ✅ Suporte técnico continuado

### Contato para Customização:
Entre em contato para adaptação do sistema para sua empresa.

## 📈 Roadmap

- [ ] Integração com ferramentas de project management
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações push para mobile
- [ ] API REST documentada com Swagger
- [ ] Integração com calendários (Google, Outlook)
- [ ] Dashboard analytics avançado
- [ ] App mobile nativo

---

<div align="center">

**Sistema de Gestão de Tempo - Versão Base Customizável**

*Base sólida para soluções corporativas de controle de tempo*

</div>
