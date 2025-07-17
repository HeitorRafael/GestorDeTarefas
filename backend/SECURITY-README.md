# 🔒 SEGURANÇA - RESET DO BANCO DE DADOS

## ⚠️ IMPORTANTE - LEIA ANTES DE USAR

### 📁 ARQUIVOS DISPONÍVEIS:

1. **`reset-db-secure.js`** ✅ **USAR ESTE**
   - Versão SEGURA com múltiplas confirmações
   - Cria backup automático
   - Gera senhas aleatórias
   - Salva credenciais em arquivo separado
   - Verificações de ambiente

2. **`reset-db-INSECURE-DO-NOT-USE.js`** ❌ **NÃO USAR**
   - Versão INSEGURA (mantida apenas para referência)
   - Executa sem confirmação
   - Expõe senhas no console
   - Não faz backup

---

## 🛡️ COMO USAR O SCRIPT SEGURO:

### Para desenvolvimento/testes:
```bash
node reset-db-secure.js
```

### Para produção (NÃO RECOMENDADO):
```bash
NODE_ENV=production node reset-db-secure.js
```

---

## 🔐 MELHORIAS DE SEGURANÇA IMPLEMENTADAS:

### ✅ **Confirmações Múltiplas**
- Confirma ação inicial
- Confirma backup
- Confirmação final com texto específico

### ✅ **Backup Automático**
- Exporta usuários (sem senhas)
- Exporta registros dos últimos 30 dias
- Salva em arquivo JSON com timestamp

### ✅ **Senhas Seguras**
- Gera senhas aleatórias (12-16 caracteres)
- Usa caracteres especiais
- Nunca mostra senhas no console

### ✅ **Proteção de Ambiente**
- Detecta ambiente de produção
- Confirma explicitamente em produção
- Logs detalhados de segurança

### ✅ **Arquivo de Credenciais**
- Salva credenciais em arquivo separado
- Inclui data do reset
- Inclui referência ao backup

---

## 📋 PROCESSO DE RESET SEGURO:

1. **Verificação de Ambiente** - Detecta se é produção
2. **Exibição do Plano** - Mostra o que será feito
3. **Primeira Confirmação** - Usuário confirma a ação
4. **Backup** - Cria backup dos dados importantes
5. **Confirmação Final** - Usuário digita "CONFIRMO"
6. **Geração de Senhas** - Cria senhas aleatórias seguras
7. **Execução do Reset** - Apaga e recria dados
8. **Salvamento Seguro** - Credenciais em arquivo separado

---

## 📦 ARQUIVOS GERADOS:

- `backup_maximundi_YYYY-MM-DD.json` - Backup dos dados
- `credenciais_YYYY-MM-DD.json` - Novas credenciais (DELETAR APÓS USO)

---

## ⚠️ IMPORTANTE APÓS O RESET:

1. **Anote as credenciais** do arquivo gerado
2. **Delete o arquivo de credenciais** após anotar
3. **Guarde o backup** em local seguro
4. **Teste o login** com as novas credenciais
5. **Configure usuários da empresa** via interface admin

---

## 🚨 EM CASO DE EMERGÊNCIA:

Se algo der errado durante o reset:

1. **Não entre em pânico** - O backup foi criado
2. **Verifique o arquivo de backup** gerado
3. **Restaure manualmente** os dados importantes
4. **Contate o desenvolvedor** se necessário

---

## 👨‍💻 CONTATO PARA SUPORTE:

- **Desenvolvedor**: Heitor Rafael
- **Email**: heitorbdelfino@gmail.com
- **Celular**: (13) 99790-2633
