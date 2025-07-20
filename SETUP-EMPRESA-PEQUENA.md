# 🏢 Sistema de Gestão de Tempo para Empresa Pequena (GRATUITO)

## 💰 **Solução 100% Gratuita para até 10 funcionários**

### 🎯 **Opções Gratuitas Recomendadas:**

#### **Opção 1: Computador Local como Servidor (Mais Simples)**
- **Custo**: R$ 0,00
- **Requisitos**: 1 computador sempre ligado + internet
- **Capacidade**: Até 10 usuários simultâneos
- **Tempo de setup**: 30 minutos

#### **Opção 2: Serviços Cloud Gratuitos**
- **Frontend**: Vercel (gratuito para sempre)
- **Backend**: Railway/Render (plano gratuito)
- **Banco**: Supabase/PlanetScale (gratuito até 500MB)
- **Custo**: R$ 0,00 por 6-12 meses

#### **Opção 3: Oracle Cloud Always Free**
- **VPS gratuito**: 1 CPU + 1GB RAM para sempre
- **Banco**: Oracle ATP gratuito
- **Custo**: R$ 0,00 permanente

---

## 🖥️ **Setup Local (Recomendado para Empresa Pequena)**

### **Vantagens:**
- ✅ 100% gratuito para sempre
- ✅ Dados ficam na empresa (segurança)
- ✅ Sem limites de usuários
- ✅ Funciona mesmo sem internet (rede local)

### **Requisitos Mínimos:**
- 💻 Computador com Windows 10/11 ou Ubuntu
- 🧠 4GB RAM mínimo (8GB recomendado)
- 💾 20GB espaço livre
- 🌐 Internet para acesso externo (opcional)

### **Passo a Passo - Setup Local:**

#### **1. Preparar o Computador Servidor**
```bash
# Windows (usar PowerShell como Administrador):
# Instalar Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Instalar dependências
choco install nodejs postgresql git -y

# Ou Ubuntu:
sudo apt update
sudo apt install nodejs npm postgresql postgresql-contrib git -y
```

#### **2. Configurar o Banco**
```bash
# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE timemanagement;
CREATE USER postgres WITH PASSWORD '0159357';
GRANT ALL PRIVILEGES ON DATABASE timemanagement TO postgres;
\q
```

#### **3. Instalar o Sistema de Gestão de Tempo**
```bash
# Clonar projeto
git clone https://github.com/seu-usuario/time-management-system.git
cd time-management-system

# Instalar dependências
npm run install:all

# O arquivo .env já está configurado!
```

#### **4. Iniciar o Sistema**
```bash
# Iniciar backend (terminal 1)
cd backend
npm start

# Iniciar frontend (terminal 2)
cd frontend
npm start
```

#### **5. Acessar o Sistema**
- **Local**: http://localhost:3000
- **Rede da empresa**: http://IP-DO-COMPUTADOR:3000
- **Internet**: Configurar roteador (port forwarding)

### **Para Acesso pela Internet (Opcional):**

#### **Usando ngrok (Gratuito e Simples):**
```bash
# Instalar ngrok
npm install -g ngrok

# Expor aplicação para internet
ngrok http 3000
# Você receberá uma URL tipo: https://abc123.ngrok.io
```

#### **Configurar Roteador (Solução Permanente):**
1. Acessar painel do roteador (192.168.1.1)
2. Configurar Port Forwarding:
   - Porta externa: 80
   - Porta interna: 3000
   - IP: IP do computador servidor
3. Usar IP público ou DynDNS gratuito

---

## ☁️ **Setup Cloud Gratuito (Alternativa)**

### **Opção A: Vercel + Supabase (Mais Fácil)**

#### **1. Frontend no Vercel:**
```bash
# Conectar GitHub ao Vercel
# Deploy automático do frontend
# URL: https://sua-empresa.vercel.app
```

#### **2. Backend no Railway:**
```bash
# Conectar GitHub ao Railway
# Deploy automático do backend
# Banco PostgreSQL incluído (gratuito 500MB)
```

#### **3. Configuração:**
```env
# Variáveis no Railway:
DB_HOST=railway_host
DB_USER=railway_user
DB_PASSWORD=railway_password
DB_DATABASE=railway_db
JWT_SECRET=jwt_secret_super_forte
NODE_ENV=production
```

### **Opção B: Oracle Cloud Always Free**

#### **Recursos Gratuitos Permanentes:**
- 🖥️ 2 VMs (1 CPU + 1GB RAM cada)
- 💾 200GB storage total
- 🗄️ 2 bancos Oracle ATP
- 🌐 10TB bandwidth/mês

#### **Setup Oracle Cloud:**
```bash
# 1. Criar conta Oracle Cloud (cartão obrigatório, mas não é cobrado)
# 2. Criar VM Ubuntu
# 3. Instalar dependências
# 4. Deploy normal como VPS
```

---

## 📱 **Configuração para Empresa**

### **Criar Usuários da Empresa:**
```bash
# Acessar como admin (admin/admin123)
# Ir em Gerenciar Usuários
# Criar usuários para cada funcionário:

# Exemplos:
- joao.silva / senha123
- maria.santos / senha123
- pedro.costa / senha123
```

### **Configurar Clientes e Tarefas:**
```bash
# Ir em Gerenciamento de Clientes
# Adicionar seus clientes reais

# Ir em Gerenciamento de Tarefas
# Adicionar tarefas da empresa:
- Atendimento ao Cliente
- Desenvolvimento
- Vendas
- Administrativo
```

### **Treinamento da Equipe:**
1. **Admin acessa**: Dashboard para ver relatórios
2. **Funcionários acessam**: Time Tracking para registrar tempo
3. **Relatórios**: Filtrar por período, funcionário, cliente

---

## 🛡️ **Segurança Básica (Gratuita)**

### **Backup Simples:**
```bash
# Script de backup (rodar semanalmente)
pg_dump timemanagement > backup_$(date +%Y%m%d).sql

# Copiar para pendrive ou Google Drive
```

### **Acesso Seguro:**
```bash
# Trocar senhas padrão
# Criar senhas fortes para cada usuário
# Não compartilhar credenciais
```

---

## 💡 **Dicas de Economia**

### **Internet/Hospedagem:**
- 🆓 **ngrok**: Acesso temporário à internet
- 🆓 **DynDNS**: IP dinâmico gratuito
- 🆓 **Cloudflare**: Proxy gratuito + SSL

### **Domínio (Opcional):**
- 🆓 **Freenom**: Domínios .tk, .ml gratuitos
- 💰 **GoDaddy**: .com por ~R$ 40/ano

### **Backup:**
- 🆓 **Google Drive**: 15GB gratuito
- 🆓 **OneDrive**: 5GB gratuito
- 🆓 **Dropbox**: 2GB gratuito

---

## 📞 **Suporte Gratuito**

### **Problemas Comuns:**

#### **"Não consigo acessar pela rede"**
```bash
# Verificar IP do computador
ipconfig (Windows) ou ip addr (Linux)

# Acessar pelo IP: http://192.168.1.XXX:3000
```

#### **"Banco não conecta"**
```bash
# Verificar se PostgreSQL está rodando
# Windows: Serviços -> PostgreSQL
# Linux: sudo systemctl status postgresql
```

#### **"Aplicação para de funcionar"**
```bash
# Reiniciar os serviços
# Ctrl+C nos terminais e rodar npm start novamente
```

### **Contato para Dúvidas:**
- 📧 **suporte@timemanagement.com**
- 💬 **WhatsApp**: (11) 99999-9999
- 🌐 **Documentação**: github.com/timemanagement/docs

---

## 🚀 **Resumo para Empresa de 10 Pessoas**

### **Configuração Recomendada:**
1. **1 computador** sempre ligado (servidor local)
2. **PostgreSQL** instalado
3. **Sistema de Gestão de Tempo** rodando localmente
4. **ngrok** para acesso externo ocasional
5. **Backup manual** semanal

### **Custo Total:**
- 💰 **Setup**: R$ 0,00
- 💰 **Mensalidade**: R$ 0,00
- 💰 **Manutenção**: R$ 0,00

### **Tempo de Implementação:**
- ⏱️ **Setup inicial**: 1-2 horas
- ⏱️ **Treinamento equipe**: 30 minutos
- ⏱️ **Funcionando**: Mesmo dia!

**Esta é a solução perfeita para uma empresa pequena ter um sistema profissional de gestão de tempo sem nenhum custo!** 🎉
