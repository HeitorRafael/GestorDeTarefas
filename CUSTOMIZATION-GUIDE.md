# GUIA DE CUSTOMIZAÇÃO - Sistema de Gestão de Tempo

Este documento orienta como personalizar o sistema base para sua empresa específica.

## 🎨 IDENTIDADE VISUAL

### 1. Cores do Sistema
**Arquivo**: `frontend/src/theme/theme.js`

```javascript
// Altere estas cores conforme sua marca:
const systemColors = {
  primaryDark: '#1976d2',    // Cor principal escura
  primaryLight: '#42a5f5',   // Cor principal clara
  // Adicione mais cores conforme necessário
};
```

### 2. Nome/Título do Sistema
**Arquivos a alterar**:
- `frontend/src/pages/LoginPage.js` - linha ~83: `GESTÃO DE TEMPO`
- `frontend/src/components/MainLayout.js` - linha ~90: `GESTÃO DE TEMPO`
- `frontend/src/pages/AboutPage.js` - título da página

### 3. Logo/Favicons
**Arquivos**:
- `frontend/public/favicon.ico`
- `frontend/public/logo192.png` 
- `frontend/public/logo512.png`
- Descomentar linha do logo em `LoginPage.js` se tiver logo

## 📊 DADOS INICIAIS

### 1. Clientes Pré-cadastrados
**Arquivo**: `backend/src/config/initDb.js`

```javascript
// Linha ~84 - Substitua pelos seus clientes:
const initialClients = [
  'Seu Cliente 1', 'Seu Cliente 2', 'Seu Cliente 3'
];
```

### 2. Tarefas/Categorias Pré-cadastradas
**Arquivo**: `backend/src/config/initDb.js`

```javascript
// Linha ~59 - Substitua pelas suas tarefas:
const initialTasks = [
  'Sua Tarefa 1', 'Sua Tarefa 2', 'Sua Tarefa 3'
];
```

### 3. Dados de Reset (função resetDatabase)
**Arquivo**: `backend/src/config/initDb.js` - linhas ~152 e ~159

Altere também os dados utilizados na função de reset para manter consistência.

## 🔧 CONFIGURAÇÃO TÉCNICA

### 1. Nome do Projeto
**Arquivos**:
- `package.json` - campo `name`
- `ecosystem.config.js` - nomes dos processos PM2
- Documentações `.md`

### 2. Banco de Dados
**Arquivo**: `backend/.env`
```env
DB_NAME=nome_do_seu_banco
```

**Scripts SQL**: Alterar nome do banco em scripts de setup

### 3. URLs e Endpoints
**Arquivo**: `frontend/src/config/config.js`
```javascript
API_BASE_URL: 'http://SEU_SERVIDOR:5000/api'
```

## 📝 DOCUMENTAÇÃO

### Arquivos para personalizar:
1. `README.md` - Descrição geral do sistema
2. `SETUP-EMPRESA-PEQUENA.md` - Guia de instalação
3. `RADMIN-VPN-SETUP.md` - Configuração VPN
4. `DEPLOYMENT.md` - Instruções de deploy

### Elementos para alterar:
- Nome da empresa/sistema
- URLs de repositório
- Informações de contato
- Exemplos específicos da empresa

## 🔐 SEGURANÇA

### 1. Senha Admin Padrão
**Arquivo**: `backend/src/config/initDb.js`
```javascript
// Linha ~24 - Altere senha padrão:
const hashedPassword = await bcrypt.hash('SUA_NOVA_SENHA', salt);
```

### 2. JWT Secret
**Arquivo**: `backend/.env`
```env
JWT_SECRET=seu_jwt_secret_super_seguro_e_unico
```

### 3. Whitelist de IPs
**Arquivo**: `backend/src/middleware/ipWhitelist.js`
Adicione IPs específicos da sua empresa conforme necessário.

## 🚀 FUNCIONALIDADES ESPECÍFICAS

### Adicionar Campos Personalizados

#### 1. No Cliente
**Arquivos**:
- `backend/src/models/Client.js`
- `backend/src/controllers/clientController.js`
- `frontend/src/pages/ClientManagementPage.js`

#### 2. Na Tarefa
**Arquivos**:
- `backend/src/models/Task.js`
- `backend/src/controllers/taskController.js`
- `frontend/src/pages/TaskManagementPage.js`

#### 3. No Time Entry
**Arquivos**:
- `backend/src/models/TimeEntry.js`
- `backend/src/controllers/timeEntryController.js`
- `frontend/src/components/TimeTracker.js`

## 📋 CHECKLIST DE CUSTOMIZAÇÃO

### Básico (Obrigatório):
- [ ] Alterar cores em `theme.js`
- [ ] Mudar títulos em `LoginPage.js` e `MainLayout.js`
- [ ] Personalizar clientes e tarefas em `initDb.js`
- [ ] Configurar banco de dados
- [ ] Alterar senha admin padrão
- [ ] Configurar JWT Secret único

### Identidade Visual:
- [ ] Substituir logo/favicons
- [ ] Ajustar About Page
- [ ] Personalizar documentação

### Avançado:
- [ ] Adicionar campos específicos
- [ ] Customizar validações de negócio
- [ ] Implementar relatórios específicos
- [ ] Configurar integrações externas

## 🎯 EXEMPLO PRÁTICO

Para uma empresa chamada "AcmeCorp":

1. **Cores**: Azul escuro (#003366) e verde (#00CC66)
2. **Clientes**: ["Cliente A", "Cliente B", "Cliente C"]
3. **Tarefas**: ["Desenvolvimento", "Suporte", "Reuniões"]
4. **Banco**: `acmecorp_timemanagement`
5. **Título**: "ACMECORP - GESTÃO DE TEMPO"

## 📞 SUPORTE PARA CUSTOMIZAÇÃO

Este sistema foi projetado para ser facilmente customizável. Para personalizações mais complexas ou suporte técnico, entre em contato.

### Serviços Disponíveis:
- Customização completa da identidade visual
- Adaptação de funcionalidades específicas
- Deploy e configuração
- Treinamento de uso
- Suporte técnico

---

**Desenvolvido como sistema base customizável para soluções corporativas**
