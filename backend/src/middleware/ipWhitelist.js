// backend/middleware/ipWhitelist.js
const allowedIPs = [
  '192.168.1.0/24',    // Toda rede local do escritório
  '127.0.0.1',         // Localhost
  '26.0.0.0/8',        // Rede Radmin VPN (toda faixa 26.x.x.x)
  
  // Alternativa mais restritiva (se souber a faixa específica do Radmin):
  // '26.1.0.0/16',    // Exemplo: apenas faixa 26.1.x.x
  
  // IPs específicos dos funcionários no Radmin VPN (opcional, para mais segurança):
  // '26.1.2.100',     // IP específico do funcionário 1 no Radmin
  // '26.1.2.101',     // IP específico do funcionário 2 no Radmin
  
  // TEMPORÁRIO: Para testes iniciais (REMOVER após configurar IPs reais)
  // '0.0.0.0'         // ATENÇÃO: Permite qualquer IP - usar só para teste!
];

// Função para verificar se IP está em uma sub-rede CIDR
const isIPInCIDR = (ip, cidr) => {
  if (!cidr.includes('/')) {
    return ip === cidr;
  }
  
  const [network, prefixLength] = cidr.split('/');
  const mask = -1 << (32 - parseInt(prefixLength));
  
  const ipToNumber = (ip) => {
    return ip.split('.').reduce((num, octet) => (num << 8) + parseInt(octet), 0);
  };
  
  return (ipToNumber(ip) & mask) === (ipToNumber(network) & mask);
};

const ipWhitelistMiddleware = (req, res, next) => {
  const clientIP = req.ip || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  // Limpar IP se vier com prefixo IPv6
  const cleanIP = clientIP.replace(/^::ffff:/, '');
  
  console.log(`Tentativa de acesso de IP: ${cleanIP}`);
  
  // Verificar se IP está na whitelist (incluindo sub-redes CIDR)
  const isAllowed = allowedIPs.some(allowedIP => {
    if (allowedIP === '0.0.0.0') return true; // Permite qualquer IP (apenas para teste)
    return isIPInCIDR(cleanIP, allowedIP);
  });
  
  if (isAllowed) {
    console.log(`✅ IP autorizado: ${cleanIP}`);
    next();
  } else {
    console.log(`❌ IP não autorizado: ${cleanIP}`);
    res.status(403).json({ 
      error: 'Acesso negado',
      message: 'Seu IP não está autorizado a acessar este sistema. Conecte-se à VPN da empresa.'
    });
  }
};

module.exports = ipWhitelistMiddleware;
