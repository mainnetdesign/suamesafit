/**
 * Configurações da API Saipos
 * Baseado na documentação: https://saipos-docs-order-api.readme.io/reference/create-order
 */

module.exports = {
  // URLs da API Saipos
  AUTH_URL: 'https://homolog-order-api.saipos.com/auth',
  ORDER_URL: 'https://homolog-order-api.saipos.com/order',
  
  // Credenciais (vindas dos arquivos existentes)
  ID_PARTNER: '3f8a028b73ef542e4a37f77e81be7477',
  SECRET: '7f2cd14dc1982bba14d7fc00d506a0ac',
  COD_STORE: '123', // ou '8664' para testes
  
  // Headers padrão para requests
  getHeaders: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-id-partner': module.exports.ID_PARTNER,
    'x-secret-key': module.exports.SECRET,
  }),
  
  // Payload de autenticação
  getAuthPayload: () => ({
    idPartner: module.exports.ID_PARTNER,
    secret: module.exports.SECRET
  }),
  
  // Configurações de ambiente
  ENVIRONMENT: 'homolog',
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
}; 