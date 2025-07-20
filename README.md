# 🕐 Sistema de Gestão de Tempo

<div align="center">

![Sistema](https://img.shields.io/badge/Sistema-Time%20Management-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Pronto%20para%20Produ%C3%A7%C3%A3o-success?style=for-the-badge)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)](https://postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.11.0-0081CB?style=flat&logo=mui)](https://mui.com/)

**Sistema completo para controle e relatório de tempo de trabalho**

*Versão base customizável para empresas de todos os tamanhos*

</div>

---

## 📖 Sobre o Projeto

Sistema moderno e completo para gestão de tempo corporativo, desenvolvido para oferecer controle preciso das horas trabalhadas, relatórios detalhados e administração eficiente de equipes.

### 🎯 **Por que usar este sistema?**

- ✅ **Pronto para usar** - Instalação simples e rápida
- ✅ **Totalmente customizável** - Adapte às necessidades da sua empresa
- ✅ **Interface moderna** - Design responsivo e intuitivo
- ✅ **Seguro e confiável** - Autenticação JWT e criptografia
- ✅ **Relatórios completos** - Análises detalhadas de produtividade
- ✅ **Multiplataforma** - Funciona em desktop, tablet e mobile

---

## ⚡ Funcionalidades Principais

### 🕒 **Controle de Tempo**
- **Cronômetro em tempo real** com start/stop
- **Registro automático** de início e fim de atividades
- **Validações inteligentes** para evitar erros
- **Histórico completo** de todas as entradas

### 👥 **Gestão de Usuários**
- **Sistema de autenticação** JWT seguro
- **Níveis de acesso** (Administrador/Usuário Comum)
- **Gerenciamento completo** de perfis
- **Alteração de senhas** com segurança

### 🏢 **Gestão de Clientes e Tarefas**
- **CRUD completo** de clientes
- **Organização por tarefas** específicas
- **Vinculação automática** tempo-cliente-tarefa
- **Categorização flexível** de atividades

### 📊 **Relatórios e Dashboard**
- **Dashboard administrativo** completo
- **Relatórios por período** (diário, semanal, mensal)
- **Filtros avançados** por cliente, usuário e data
- **Estatísticas detalhadas** de produtividade
- **Exportação de dados** para análise

### 🎨 **Interface e Experiência**
- **Design responsivo** para todos os dispositivos
- **Tema claro/escuro** automático
- **Animações suaves** e microinterações
- **Material Design** moderno
- **Navegação intuitiva** e acessível

---

## 🚀 Instalação e Configuração

### 📋 **Pré-requisitos**

Certifique-se de ter instalado:

- **Node.js** (versão 16.0.0 ou superior)
- **npm** (versão 8.0.0 ou superior)  
- **PostgreSQL** (versão 12 ou superior)
- **Git** para clonar o repositório

### 📥 **1. Clone o Repositório**

```bash
git clone https://github.com/HeitorRafael/GestorDeTarefas.git
cd GestorDeTarefas
```

### 🗄️ **2. Configuração do Banco de Dados**

1. **Crie um banco PostgreSQL:**
```sql
CREATE DATABASE timemanagement;
```

2. **Configure as credenciais em `backend/.env`:**
```env
# Configurações do Banco de Dados
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=timemanagement

# Segurança JWT (ALTERE ESTA CHAVE!)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui

# Configurações do Servidor
PORT=5000
NODE_ENV=development
```

### 📦 **3. Instalação das Dependências**

```bash
# Instalar todas as dependências de uma vez
npm run install:all

# OU instalar separadamente:
cd backend && npm install
cd ../frontend && npm install
```

### ▶️ **4. Iniciando o Sistema**

**Opção 1: Início automático (recomendado)**
```bash
# Terminal 1: Backend
npm run start:backend

# Terminal 2: Frontend  
npm run start:frontend
```

**Opção 2: Desenvolvimento**
```bash
# No backend (para desenvolvimento com auto-reload)
cd backend && npm run dev
```

### 🌐 **5. Acesso ao Sistema**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## 🔐 Primeiro Acesso

### 👤 **Credenciais Padrão**

- **Usuário:** `admin`
- **Senha:** `admin123`

> ⚠️ **IMPORTANTE:** Altere a senha padrão imediatamente após o primeiro login!

### 🛠️ **Configuração Inicial**

1. **Faça login** com as credenciais padrão
2. **Acesse "Gerenciar Usuários"** no menu admin
3. **Altere a senha do admin** clicando no ícone de chave
4. **Crie novos usuários** conforme necessário
5. **Configure clientes e tarefas** específicas da sua empresa

---

## 📚 Como Usar

### 🕐 **Registrando Tempo**

1. **Selecione cliente e tarefa** na página principal
2. **Clique em "Iniciar"** para começar o cronômetro
3. **Trabalhe normalmente** - o tempo é contado automaticamente
4. **Clique em "Parar"** quando terminar
5. **Adicione anotações** se necessário
6. **Confirme o registro** para salvar

### 📊 **Visualizando Relatórios**

1. **Acesse "Relatórios"** no menu
2. **Selecione o período** desejado
3. **Aplique filtros** por cliente ou usuário
4. **Analise os dados** nas tabelas e estatísticas
5. **Exporte** se necessário

### 👥 **Administração (apenas Admin)**

- **Gerenciar Usuários:** Criar, editar e excluir usuários
- **Gerenciar Clientes:** Administrar lista de clientes
- **Gerenciar Tarefas:** Configurar categorias de atividades
- **Relatórios Gerais:** Visualizar dados de toda a equipe

---

## ⚙️ Customização

Este sistema foi desenvolvido como **base customizável**. Principais pontos de customização:

### 🎨 **Identidade Visual**
- **Cores:** Edite `frontend/src/theme/theme.js`
- **Logo:** Substitua arquivos em `frontend/public/`
- **Títulos:** Modifique textos em componentes específicos

### 🏢 **Dados da Empresa**
- **Clientes iniciais:** Configure em `backend/src/config/initDb.js`
- **Tarefas padrão:** Personalize categorias de atividades
- **Configurações:** Ajuste regras de negócio

### 🔧 **Funcionalidades**
- **Campos extras:** Adicione nos models do backend
- **Validações:** Implemente regras específicas
- **Relatórios:** Customize análises conforme necessidade

---

## 🏗️ Arquitetura Técnica

### 🔧 **Stack Tecnológica**

**Frontend:**
- React 18.3.1
- Material-UI 5.11.0
- React Router DOM
- Axios para requisições
- Context API para estado global

**Backend:**
- Node.js com Express
- PostgreSQL como banco de dados
- JWT para autenticação
- bcryptjs para criptografia
- Validações e middlewares de segurança

### 📁 **Estrutura do Projeto**

```
📦 Sistema de Gestão de Tempo
├── 📂 backend/                 # API Node.js
│   ├── 📂 src/
│   │   ├── 📂 controllers/     # Lógica de negócio
│   │   ├── 📂 models/          # Modelos de dados
│   │   ├── 📂 routes/          # Rotas da API
│   │   ├── 📂 middleware/      # Middlewares de segurança
│   │   └── 📂 config/          # Configurações e DB
│   └── 📄 .env                 # Variáveis de ambiente
├── 📂 frontend/                # Interface React
│   ├── 📂 src/
│   │   ├── 📂 components/      # Componentes reutilizáveis
│   │   ├── 📂 pages/           # Páginas principais
│   │   ├── 📂 contexts/        # Context API
│   │   └── 📂 theme/           # Temas e estilos
│   └── 📂 public/              # Arquivos estáticos
└── 📄 README.md                # Esta documentação
```

---

## 🛡️ Segurança

### 🔐 **Recursos de Segurança**

- ✅ **Autenticação JWT** com tokens seguros
- ✅ **Criptografia de senhas** com bcrypt
- ✅ **Validação de dados** em todas as rotas
- ✅ **Middleware de autenticação** em rotas protegidas
- ✅ **Controle de acesso** por níveis de usuário
- ✅ **Proteção CORS** configurada
- ✅ **Sanitização de inputs** para prevenir ataques

### 🔒 **Boas Práticas Implementadas**

- Senhas nunca são armazenadas em texto plano
- Tokens JWT com expiração configurável
- Validação de dados no frontend e backend
- Logs de segurança para auditoria
- Proteção contra ataques comuns (XSS, SQL Injection)

---

## 🚀 Deploy em Produção

### 🌐 **Preparação para Deploy**

1. **Configure variáveis de ambiente:**
```env
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_super_secreta_para_producao
DB_HOST=seu_servidor_postgresql
```

2. **Build do frontend:**
```bash
cd frontend && npm run build
```

3. **Configure servidor web** (Nginx recomendado)
4. **Configure banco PostgreSQL** em servidor
5. **Configure SSL/HTTPS** para segurança
6. **Configure backup automático** do banco

### 📋 **Checklist de Deploy**

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados em servidor
- [ ] Build do frontend gerado
- [ ] Servidor web configurado
- [ ] SSL configurado
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Senha admin alterada

---

## 🤝 Contribuição

### 🔄 **Como Contribuir**

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Add: Nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/NovaFuncionalidade`)
5. **Abra um Pull Request**

### 🐛 **Reportando Bugs**

1. **Verifique** se o bug já foi reportado
2. **Crie uma issue** detalhada
3. **Inclua passos** para reproduzir
4. **Adicione screenshots** se aplicável
5. **Informe versões** de Node, navegador, etc.

---

## 📋 Roadmap

### 🔮 **Próximas Funcionalidades**

- [ ] **Integração com calendários** (Google, Outlook)
- [ ] **Notificações push** para lembretes
- [ ] **API REST completa** para integrações
- [ ] **App mobile** React Native
- [ ] **Integração com sistemas** de faturamento
- [ ] **Relatórios avançados** com gráficos
- [ ] **Exportação** para Excel/PDF
- [ ] **Modo offline** com sincronização

### 🎯 **Melhorias Planejadas**

- [ ] **Performance** otimizada
- [ ] **Testes automatizados** completos
- [ ] **Documentação** da API
- [ ] **Docker** para deploy facilitado
- [ ] **Backup automático** integrado
- [ ] **Auditoria** de ações de usuários

---

## 📞 Suporte e Contato

### 💬 **Precisa de Ajuda?**

- 📧 **Email:** heitorbdelfino@gmail.com
- 📱 **WhatsApp:** (13) 99790-2633
- 🐙 **GitHub:** [HeitorRafael](https://github.com/HeitorRafael)

### 🛠️ **Serviços Disponíveis**

- ✅ **Customização completa** do sistema
- ✅ **Deploy e configuração** em servidores
- ✅ **Treinamento** para equipes
- ✅ **Suporte técnico** especializado
- ✅ **Integrações específicas** com outros sistemas
- ✅ **Desenvolvimento** de funcionalidades extras

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para facilitar a gestão de tempo em empresas de todos os tamanhos.

**Sistema base pronto para produção - Comece a usar hoje mesmo!**

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela no GitHub! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/HeitorRafael/GestorDeTarefas.svg?style=social&label=Star)](https://github.com/HeitorRafael/GestorDeTarefas)

</div>
