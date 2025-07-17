# 🚀 Guia de Deployment Empresarial - MaxiMundi

## 📋 Índice
1. [Estratégias de Deployment](#estratégias-de-deployment)
2. [Configuração de Servidor](#configuração-de-servidor)
3. [Deployment com Docker](#deployment-com-docker)
4. [Configuração de Banco](#configuração-de-banco)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Gestão Remota](#gestão-remota)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Segurança](#segurança)

## 🎯 Estratégias de Deployment

### Opção 1: VPS Tradicional (Recomendado para Pequenas/Médias Empresas)
- **Custo**: $20-100/mês
- **Controle**: Total
- **Complexidade**: Média
- **Provedores**: DigitalOcean, Linode, Vultr, AWS Lightsail

### Opção 2: Cloud Platform (Recomendado para Empresas Grandes)
- **Frontend**: Vercel, Netlify
- **Backend**: Heroku, Railway, AWS Elastic Beanstalk
- **Banco**: AWS RDS, Google Cloud SQL
- **Custo**: $50-500/mês
- **Escalabilidade**: Alta

### Opção 3: Servidor Próprio (On-Premise)
- **Custo**: Inicial alto
- **Controle**: Total
- **Segurança**: Máxima
- **Manutenção**: Própria equipe

## 🖥️ Configuração de Servidor (VPS)

### 1. Preparação do Servidor Ubuntu 20.04+

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git nginx postgresql postgresql-contrib

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (Process Manager)
sudo npm install -g pm2

# Configurar firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Configuração do PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE maximundi;
CREATE USER maximundi_user WITH ENCRYPTED PASSWORD 'senha_super_segura_123';
GRANT ALL PRIVILEGES ON DATABASE maximundi TO maximundi_user;
\q

# Configurar acesso remoto (se necessário)
sudo nano /etc/postgresql/12/main/postgresql.conf
# Descomentar: listen_addresses = '*'

sudo nano /etc/postgresql/12/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 3. Deploy da Aplicação

```bash
# Clonar repositório
cd /opt
sudo git clone https://github.com/seu-usuario/maximundi.git
sudo chown -R $USER:$USER maximundi
cd maximundi

# Configurar Backend
cd backend
npm install --production
cp .env.example .env

# Editar variáveis de produção
nano .env
```

**Arquivo .env de Produção:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maximundi
DB_USER=maximundi_user
DB_PASSWORD=senha_super_segura_123
JWT_SECRET=jwt_secret_super_longo_e_complexo_para_producao_123456789
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://seudominio.com
```

```bash
# Configurar Frontend
cd ../frontend
npm install
npm run build

# Configurar PM2
cd ../backend
pm2 start src/app.js --name "maximundi-backend"
pm2 save
pm2 startup
```

### 4. Configuração do Nginx

```bash
sudo nano /etc/nginx/sites-available/maximundi
```

**Configuração Nginx:**
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Frontend (React Build)
    location / {
        root /opt/maximundi/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/maximundi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Auto-renovação
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Deployment com Docker

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: maximundi
      POSTGRES_USER: maximundi_user
      POSTGRES_PASSWORD: senha_super_segura_123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: maximundi
      DB_USER: maximundi_user
      DB_PASSWORD: senha_super_segura_123
      JWT_SECRET: jwt_secret_super_longo_e_complexo
      NODE_ENV: production
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Dockerfile Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "src/app.js"]
```

### Dockerfile Frontend
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔄 CI/CD Pipeline com GitHub Actions

### .github/workflows/deploy.yml
```yaml
name: Deploy MaxiMundi

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/maximundi
          git pull origin main
          cd backend
          npm install --production
          pm2 restart maximundi-backend
          cd ../frontend
          npm install
          npm run build
          sudo systemctl reload nginx
```

## 📊 Monitoramento e Logs

### 1. PM2 Monitoring
```bash
# Ver logs em tempo real
pm2 logs maximundi-backend

# Monitoramento
pm2 monit

# Status dos processos
pm2 status
```

### 2. Configurar Logs Nginx
```bash
# Configurar rotação de logs
sudo nano /etc/logrotate.d/nginx
```

### 3. Monitoramento com Scripts
```bash
# Script de health check
#!/bin/bash
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Backend OK"
else
    echo "Backend DOWN - Reiniciando..."
    pm2 restart maximundi-backend
fi
```

## 🌐 Gestão Remota

### 1. Acesso SSH Seguro
```bash
# Configurar chave SSH
ssh-keygen -t rsa -b 4096 -C "seu-email@empresa.com"
ssh-copy-id user@servidor

# Configurar SSH Config
nano ~/.ssh/config
```

**~/.ssh/config:**
```
Host maximundi-prod
    HostName IP_DO_SERVIDOR
    User seu_usuario
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

### 2. Scripts de Administração Remota

**update-app.sh:**
```bash
#!/bin/bash
echo "🚀 Atualizando MaxiMundi..."

# Backup do banco
pg_dump maximundi > backup_$(date +%Y%m%d_%H%M%S).sql

# Atualizar código
git pull origin main

# Atualizar backend
cd backend
npm install --production
pm2 restart maximundi-backend

# Atualizar frontend
cd ../frontend
npm install
npm run build

sudo systemctl reload nginx

echo "✅ Atualização concluída!"
```

### 3. Monitoramento Remoto com Webhooks
```javascript
// Webhook para notificações Slack/Discord
const webhook = process.env.WEBHOOK_URL;

const notifyError = async (error) => {
    await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: `🚨 Erro no MaxiMundi: ${error.message}`
        })
    });
};
```

## 💾 Backup e Recuperação

### 1. Backup Automático do Banco
```bash
# Script de backup
#!/bin/bash
BACKUP_DIR="/opt/backups/maximundi"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do PostgreSQL
pg_dump maximundi > $BACKUP_DIR/maximundi_$DATE.sql

# Backup dos arquivos de configuração
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/maximundi/backend/.env

# Limpar backups antigos (manter últimos 30 dias)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

# Upload para cloud (opcional)
# aws s3 cp $BACKUP_DIR/maximundi_$DATE.sql s3://seu-bucket/backups/
```

### 2. Cron Job para Backup
```bash
# Adicionar ao crontab
0 2 * * * /opt/scripts/backup.sh
```

## 🔒 Segurança

### 1. Configurações de Segurança
```bash
# Configurar fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Configurar SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# Port 2222 (mudar porta padrão)
```

### 2. Firewall Avançado
```bash
# Configurar iptables
sudo ufw deny incoming
sudo ufw allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Monitoramento de Intrusão
```bash
# Instalar AIDE
sudo apt install aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Cron para verificação diária
0 3 * * * /usr/bin/aide --check
```

## 📱 Dashboard de Administração Remota

### Ferramentas Recomendadas:

1. **Portainer** (Docker Management)
2. **Grafana + Prometheus** (Métricas)
3. **LogTail** (Logs centralizados)
4. **Uptime Robot** (Monitoramento de disponibilidade)

## 🆘 Troubleshooting

### Comandos Úteis:
```bash
# Verificar status dos serviços
sudo systemctl status nginx postgresql
pm2 status

# Verificar logs
journalctl -u nginx -f
pm2 logs maximundi-backend

# Verificar conexões de rede
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :80

# Verificar espaço em disco
df -h
du -sh /opt/maximundi/*
```

### Problemas Comuns:

1. **Erro 502 Bad Gateway**
   - Verificar se o backend está rodando: `pm2 status`
   - Verificar logs: `pm2 logs maximundi-backend`

2. **Banco de dados inacessível**
   - Verificar status: `sudo systemctl status postgresql`
   - Verificar conexões: `sudo -u postgres psql`

3. **SSL expirando**
   - Renovar: `sudo certbot renew`
   - Verificar auto-renovação: `sudo crontab -l`

---

## 📞 Suporte para Deployment

Para implementação empresarial com suporte especializado:
- 📧 deployment@maximundi.com
- 💬 Consultoria técnica disponível
- 🛠️ Setup completo incluído

Este guia garante um deployment robusto e profissional, com capacidade de gestão remota completa para manutenção e atualizações do sistema.
