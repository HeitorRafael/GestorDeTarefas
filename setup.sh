#!/bin/bash

echo "🚀 Configurando MaxiMundi para Empresa Pequena..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "📥 Instale Node.js em: https://nodejs.org"
    exit 1
fi

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado!"
    echo "📥 Instale PostgreSQL em: https://postgresql.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo "✅ PostgreSQL encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
cd backend && npm install
cd ../frontend && npm install
cd ..

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configurar banco PostgreSQL (ver SETUP-EMPRESA-PEQUENA.md)"
echo "2. Terminal 1: npm run start:backend"
echo "3. Terminal 2: npm run start:frontend"
echo "4. Acessar: http://localhost:3000"
echo ""
echo "👤 Login padrão:"
echo "   Admin: admin / admin123"
echo "   Usuário: user1 / senha123"
