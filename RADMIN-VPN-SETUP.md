# Configuração Radmin VPN + Sistema de Gestão de Tempo

## 📋 Visão Geral
Este documento explica como configurar o acesso remoto seguro ao Sistema de Gestão de Tempo usando Radmin VPN, permitindo que funcionários trabalhem de casa com total segurança.

## 🔧 Configuração do Radmin VPN

### No Servidor (Escritório)
1. **Instalar Radmin VPN Server**
   - Download: https://www.radmin-vpn.com/
   - Criar uma rede VPN com nome da empresa
   - Anotar o **Nome da Rede** e **Senha** criados

2. **Configurar Firewall do Windows**
   ```batch
   # Permitir Radmin VPN no firewall
   netsh advfirewall firewall add rule name="Radmin VPN" dir=in action=allow protocol=UDP localport=26000
   ```

### Nos Computadores dos Funcionários (Home Office)
1. **Instalar Radmin VPN Client**
   - Download: https://www.radmin-vpn.com/
   - Conectar à rede VPN usando **Nome da Rede** e **Senha**

2. **Verificar Conexão VPN**
   ```cmd
   # Verificar IP atribuído pelo Radmin (deve começar com 26.x.x.x)
   ipconfig
   ```

## 🛡️ Segurança Configurada no Sistema

### IPs Permitidos (já configurado)
- `192.168.1.0/24` - Rede local do escritório
- `127.0.0.1` - Localhost (servidor)
- `26.0.0.0/8` - **Toda faixa Radmin VPN** (26.x.x.x)

### Como Funciona
1. Funcionário conecta no Radmin VPN
2. Recebe IP na faixa 26.x.x.x
3. Acessa Sistema normalmente pelo navegador
4. Sistema verifica IP e permite acesso

## 🚀 Fluxo de Trabalho para Funcionários

### Procedimento Diário (Home Office)
1. **Conectar VPN**
   - Abrir Radmin VPN
   - Conectar à rede da empresa
   - Aguardar status "Conectado"

2. **Acessar Sistema**
   - Abrir navegador
   - Acessar: `http://IP_DO_SERVIDOR:3000`
   - Fazer login normal

3. **Ao Finalizar**
   - Fechar Sistema de Gestão de Tempo
   - Desconectar VPN (opcional)

## 📱 Instruções para Funcionários

### Primeira Configuração
Enviar via WhatsApp para cada funcionário:

```
🏢 ACESSO HOME OFFICE - Sistema de Gestão de Tempo

📥 1. Baixar Radmin VPN:
https://www.radmin-vpn.com/

⚙️ 2. Instalar e configurar:
- Nome da Rede: [NOME_DA_REDE]
- Senha: [SENHA_VPN]

🌐 3. Acessar sistema:
http://[IP_SERVIDOR]:3000

❓ Dúvidas? Chama no WhatsApp!
```

## 🔍 Troubleshooting

### Problema: "Acesso negado"
**Causa:** IP não está na whitelist
**Solução:**
1. Verificar se está conectado no Radmin VPN
2. Verificar IP atual: https://meuip.com.br/
3. Se IP não começar com 26.x.x.x, reconectar VPN

### Problema: VPN não conecta
**Solução:**
1. Verificar nome da rede e senha
2. Verificar firewall (porta 26000 UDP)
3. Reiniciar Radmin VPN

### Problema: Sistema lento via VPN
**Solução:**
1. Usar servidor Radmin VPN mais próximo
2. Fechar aplicações desnecessárias
3. Verificar qualidade da internet

## 🔧 Monitoramento (Para Administrador)

### Logs de Acesso
```bash
# Ver logs do Sistema
pm2 logs time-system-backend

# Filtrar acessos VPN
pm2 logs time-system-backend | grep "26\."
```

### Verificar Conexões VPN Ativas
No servidor Radmin VPN, verificar usuários conectados na interface gráfica.

## 📊 Relatório de Segurança

### Camadas de Proteção
1. ✅ **Firewall Windows** - Bloqueia portas desnecessárias
2. ✅ **Whitelist de IPs** - Só permite IPs conhecidos
3. ✅ **VPN Criptografada** - Todo tráfego criptografado
4. ✅ **Autenticação** - Login/senha no sistema
5. ✅ **Rede Isolada** - VPN cria túnel seguro

### Benefícios
- 🏠 **Home office seguro** - Funcionários trabalham de casa
- 🔒 **Dados protegidos** - Mesmo nível de segurança do escritório
- 📈 **Produtividade** - Acesso total às funcionalidades
- 💰 **Economia** - Reduz custos de deslocamento

## 🎯 Próximos Passos

### Após Deploy no Windows
1. [ ] Instalar Radmin VPN Server no servidor
2. [ ] Criar rede VPN com nome/senha forte
3. [ ] Testar acesso local primeiro
4. [ ] Configurar VPN nos computadores dos funcionários
5. [ ] Testar acesso remoto de cada funcionário
6. [ ] Documentar credenciais VPN em local seguro
7. [ ] Treinar funcionários no procedimento

### Manutenção
- **Mensal:** Verificar logs de acesso
- **Trimestral:** Revisar lista de IPs permitidos
- **Semestral:** Atualizar senhas VPN
- **Anual:** Revisar política de segurança

---
**✅ Com essa configuração, o Sistema de Gestão de Tempo estará 100% preparado para home office seguro!**
