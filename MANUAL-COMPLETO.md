# 📚 Manual Completo - Sistema de Gestão de Tempo

## 📋 Índice

- [📖 Sobre o Sistema](#sobre-o-sistema)
- [🚀 Instalação e Configuração](#instalação-e-configuração)
- [💻 Como Usar o Sistema](#como-usar-o-sistema)
- [🔧 Funcionalidades Implementadas](#funcionalidades-implementadas)
- [⚙️ Personalização](#personalização)
- [🛡️ Segurança](#segurança)
- [📊 Relatórios e Backup](#relatórios-e-backup)
- [🌐 Deploy em Produção](#deploy-em-produção)
- [🔍 Solução de Problemas](#solução-de-problemas)
- [📝 Changelog](#changelog)

---

## 📖 Sobre o Sistema

Este é um sistema base para gestão de tempo corporativo, desenvolvido com tecnologias modernas para oferecer uma experiência intuitiva e eficiente no controle de horas trabalhadas.

### 🎯 Características Principais

- **Interface Moderna**: Material-UI com tema responsivo
- **Controle de Acesso**: Sistema de autenticação seguro
- **Multiusuário**: Suporte a usuários admin e comuns
- **Relatórios**: Geração de relatórios detalhados
- **Backup**: Sistema de backup automático
- **Customizável**: Base sólida para adaptações específicas

### 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18.3.1, Material-UI, Axios
- **Backend**: Node.js, Express, JWT
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT com middleware de segurança

---

## 🚀 Instalação e Configuração

### 📋 Pré-requisitos

- Node.js (versão 16+)
- PostgreSQL (versão 12+)
- npm ou yarn

### 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repositorio>
   cd "Gestor de Tempo"
   ```

2. **Instale as dependências**
   ```bash
   # Dependências raiz
   npm install
   
   # Dependências do backend
   cd backend
   npm install
   
   # Dependências do frontend
   cd ../frontend
   npm install
   cd ..
   ```

3. **Configure o Banco de Dados**
   ```bash
   # Acesse o PostgreSQL
   sudo -u postgres psql
   
   # Crie o banco de dados
   CREATE DATABASE time_management;
   CREATE USER time_user WITH PASSWORD 'sua_senha_segura';
   GRANT ALL PRIVILEGES ON DATABASE time_management TO time_user;
   \q
   ```

4. **Configure as Variáveis de Ambiente**
   ```bash
   # No diretório backend, crie o arquivo .env
   cd backend
   cp .env.example .env
   ```
   
   Edite o arquivo `.env`:
   ```env
   # Configurações do Banco de Dados
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=time_management
   DB_USER=time_user
   DB_PASSWORD=sua_senha_segura
   
   # Configurações de Segurança
   JWT_SECRET=sua_chave_jwt_muito_segura_aqui
   
   # Configurações do Servidor
   PORT=5000
   NODE_ENV=development
   ```

5. **Inicialize o Banco de Dados**
   ```bash
   # No diretório backend
   npm run init-db
   ```

6. **Inicie os Serviços**
   ```bash
   # Método 1: Usando PM2 (recomendado)
   npm start
   
   # Método 2: Desenvolvimento
   npm run dev
   ```

### 🔐 Usuário Administrador Padrão

Após a inicialização, será criado um usuário administrador:
- **Usuário**: admin
- **Senha**: admin123
- **⚠️ IMPORTANTE**: Altere a senha imediatamente após o primeiro login!

---

## 💻 Como Usar o Sistema

### 🔑 Login e Primeiro Acesso

1. Acesse o sistema em `http://localhost:3000`
2. Faça login com as credenciais do administrador
3. **Altere a senha padrão** imediatamente
4. Configure usuários adicionais conforme necessário

### 👤 Usuário Comum

#### 🕐 Controle de Tempo
1. **Iniciar Trabalho**: Selecione cliente e tarefa, clique em "Iniciar"
2. **Pausar/Retomar**: Use os controles para pausar/retomar quando necessário
3. **Finalizar**: Clique em "Finalizar" ao concluir a tarefa
4. **Visualizar**: Veja o histórico de registros na tabela

#### 📊 Relatórios Pessoais
1. Acesse "Relatórios de Tempo"
2. Selecione o período desejado
3. Visualize ou exporte seus dados

#### 👨‍💼 Perfil do Usuário
1. Acesse "Dashboard do Usuário"
2. Visualize informações pessoais
3. Altere sua senha quando necessário

### 👨‍💼 Administrador

#### 👥 Gerenciamento de Usuários
1. Acesse "Gestão Administrativa"
2. **Criar usuários**: Preencha nome, senha e função
3. **Alterar senhas**: Use o botão de chave para resetar senhas
4. **Excluir usuários**: Use o botão de lixeira (cuidado!)

#### 🏢 Gerenciamento de Clientes
1. Acesse "Gestão de Clientes"
2. **Adicionar**: Nome e descrição do cliente
3. **Editar**: Clique no botão de edição
4. **Excluir**: Use o botão de lixeira

#### 📋 Gerenciamento de Tarefas
1. Acesse "Gestão de Tarefas"
2. **Criar**: Nome, descrição e cliente associado
3. **Editar**: Modifique informações existentes
4. **Excluir**: Remova tarefas não utilizadas

#### 📊 Relatórios Administrativos
1. Acesse "Relatórios de Tempo"
2. Visualize dados de todos os usuários
3. Filtre por período, usuário ou projeto
4. Exporte relatórios em formato JSON

#### 💾 Backup e Exportação
1. Acesse "Gestão Administrativa" → "Backup de Dados"
2. Baixe backup completo do sistema
3. Utilize para migração ou arquivamento

---

## 🔧 Funcionalidades Implementadas

### ✅ Controle de Tempo
- [x] Iniciar/pausar/finalizar registros de tempo
- [x] Seleção de cliente e tarefa
- [x] Cronômetro em tempo real
- [x] Histórico de registros por usuário
- [x] Exclusão de registros finalizados

### ✅ Gestão de Usuários
- [x] Cadastro de novos usuários (admin only)
- [x] Diferentes níveis de acesso (admin/comum)
- [x] Alteração de senhas pelo próprio usuário
- [x] Reset de senha por administrador
- [x] Exclusão de usuários

### ✅ Gestão de Clientes e Tarefas
- [x] CRUD completo de clientes
- [x] CRUD completo de tarefas
- [x] Vinculação tarefas → clientes
- [x] Edição inline de registros

### ✅ Relatórios e Exportação
- [x] Relatórios por período
- [x] Relatórios por usuário
- [x] Exportação de dados
- [x] Backup completo do sistema

### ✅ Segurança
- [x] Autenticação JWT
- [x] Middleware de autorização
- [x] Validação de dados
- [x] Controle de acesso por papel

### ✅ Interface e UX
- [x] Interface responsiva
- [x] Tema dark/light
- [x] Feedback visual para ações
- [x] Navegação intuitiva

---

## ⚙️ Personalização

### 🎨 Customização Visual

#### Cores e Tema
1. Edite `frontend/src/theme/theme.js`
2. Modifique as cores primárias e secundárias
3. Ajuste modo dark/light conforme preferência

#### Logo e Branding
1. Substitua logos em `frontend/public/`
2. Atualize `manifest.json` com informações da empresa
3. Modifique títulos em `frontend/public/index.html`

### 🏢 Adaptação para Empresa

#### Informações da Empresa
1. Edite `frontend/src/config/config.js`
2. Atualize nome, contatos e informações relevantes

#### Campos Customizados
1. Adicione campos específicos nos modelos (`backend/src/models/`)
2. Atualize controllers correspondentes
3. Modifique interfaces do frontend

#### Relatórios Específicos
1. Crie novos endpoints em `backend/src/controllers/reportController.js`
2. Adicione novas telas no frontend
3. Implemente lógicas de negócio específicas

### 🔧 Configurações Avançadas

#### Banco de Dados
- Ajuste configurações em `backend/src/config/db.js`
- Modifique pool de conexões conforme necessário

#### Autenticação
- Configure tempo de expiração do JWT
- Implemente integração com Active Directory (se necessário)

---

## 🛡️ Segurança

### 🔐 Configurações de Segurança

#### JWT e Autenticação
- **Chave Secreta**: Use chave forte e única em produção
- **Expiração**: Tokens expiram em 1 hora por padrão
- **Refresh**: Implemente refresh tokens para sessões longas

#### Banco de Dados
- **Conexão Segura**: Use SSL em produção
- **Credenciais**: Nunca commitre credenciais no código
- **Backup**: Criptografe backups sensíveis

### 🌐 Deploy Seguro

#### NGINX Configuration
```nginx
# Use o arquivo nginx-timemanagement.conf fornecido
server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    # Configurações SSL
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

#### Rate Limiting
- Configure rate limiting no NGINX
- Implemente proteção contra força bruta
- Use IP whitelisting quando necessário

---

## 📊 Relatórios e Backup

### 📈 Tipos de Relatórios

#### Relatórios por Período
- Dados de todos os usuários em período específico
- Totais por projeto e cliente
- Métricas de produtividade

#### Relatórios por Usuário
- Histórico individual detalhado
- Análise de padrões de trabalho
- Comparativos de período

### 💾 Sistema de Backup

#### Backup Manual
1. Acesse painel administrativo
2. Clique em "Backup de Dados"
3. Download automático do arquivo JSON

#### Backup Automatizado
```bash
# Adicione ao crontab para backup diário
0 2 * * * cd /path/to/app && npm run backup
```

#### Restauração
1. Use scripts de migração fornecidos
2. Importe dados via interface administrativa
3. Valide integridade após restauração

---

## 🌐 Deploy em Produção

### 🚀 Preparação para Produção

#### Build do Frontend
```bash
cd frontend
npm run build
```

#### Configuração do Servidor
1. **PM2 para Processo**:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

2. **NGINX como Proxy**:
   ```bash
   sudo cp nginx-timemanagement.conf /etc/nginx/sites-available/
   sudo ln -s /etc/nginx/sites-available/nginx-timemanagement.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### SSL e HTTPS
1. Use Let's Encrypt para SSL gratuito
2. Configure renovação automática
3. Force redirecionamento HTTP → HTTPS

### 🔧 Monitoramento

#### Logs
- Backend: `logs/backend-*.log`
- Frontend: `logs/frontend-*.log`
- NGINX: `/var/log/nginx/`

#### Métricas
- Use PM2 Monit para métricas de processo
- Configure alertas para falhas
- Monitore uso de recursos

---

## 🔍 Solução de Problemas

### ❌ Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Teste conexão
psql -h localhost -U time_user -d time_management
```

#### JWT_SECRET não configurado
```bash
# Verifique arquivo .env
cat backend/.env | grep JWT_SECRET

# Se não existir, gere uma chave
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Porta já em uso
```bash
# Encontre processo usando a porta
sudo lsof -i :5000
sudo lsof -i :3000

# Termine o processo
sudo kill -9 <PID>
```

#### Permissões de Arquivo
```bash
# Ajuste permissões se necessário
chmod +x start-linux.sh
chmod +x setup.sh
```

### 🔧 Debug Mode

#### Backend Debug
```bash
cd backend
npm run dev
```

#### Frontend Debug
```bash
cd frontend
npm start
```

#### Logs Detalhados
```bash
# Visualizar logs em tempo real
tail -f logs/backend-combined.log
tail -f logs/frontend-combined.log
```

---

## 📝 Changelog

### Versão 2.0.0 (Atual)
- ✅ Implementação completa de CRUD para todas entidades
- ✅ Sistema de alteração de senhas
- ✅ Interface de exclusão de registros finalizados
- ✅ Backup e exportação de dados
- ✅ Interface administrativa completa
- ✅ Remoção de referências específicas (versão base)

### Versão 1.0.0
- ✅ Sistema base de controle de tempo
- ✅ Autenticação e autorização
- ✅ Interface Material-UI
- ✅ Relatórios básicos

---

## 🏆 Conclusão

Este sistema oferece uma base sólida e profissional para gestão de tempo corporativo. Com sua arquitetura modular e interface intuitiva, pode ser facilmente adaptado para diferentes necessidades empresariais.

### 📞 Suporte

Para dúvidas ou problemas:
1. Consulte este manual primeiro
2. Verifique os logs do sistema
3. Teste em ambiente de desenvolvimento
4. Documente problemas encontrados

### 🚀 Próximos Passos

1. **Personalize** o sistema para sua empresa
2. **Configure** ambiente de produção
3. **Treine** usuários nas funcionalidades
4. **Monitore** performance e uso
5. **Expanda** funcionalidades conforme necessário

---

*Sistema de Gestão de Tempo - Base Customizável*  
*Documentação atualizada em 20/07/2025*
