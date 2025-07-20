#!/bin/bash
# Script de inicialização do Sistema de Gestão de Tempo para Linux/macOS

echo "🚀 Iniciando Sistema de Gestão de Tempo com PM2..."

# Criar diretório de logs se não existir
mkdir -p logs

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado. Instalando..."
    npm install -g pm2
fi

# Verificar se serve está instalado globalmente
if ! command -v serve &> /dev/null; then
    echo "📦 Instalando serve globalmente..."
    npm install -g serve
fi

# Parar processos existentes (se houver)
pm2 delete ecosystem.config.js 2>/dev/null || true

# Fazer build do frontend se necessário
if [ ! -d "frontend/build" ]; then
    echo "🔨 Building frontend..."
    cd frontend
    npm run build
    cd ..
fi

# Iniciar aplicações com PM2
pm2 start ecosystem.config.js

# Mostrar status
pm2 status

# Configurar PM2 para iniciar automaticamente
pm2 startup
pm2 save

echo "✅ Sistema de Gestão de Tempo iniciado com sucesso!"
echo "📊 Status: pm2 status"
echo "📋 Logs: pm2 logs"
echo "🔄 Restart: pm2 restart all"
echo "🛑 Stop: pm2 stop all"
