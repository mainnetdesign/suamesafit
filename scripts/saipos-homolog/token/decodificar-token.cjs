const axios = require('axios');

async function main() {
  try {
    console.log('🔍 OBTENDO E DECODIFICANDO TOKEN PARA ANÁLISE DETALHADA\n');
    
    // PASSO 1: Obter token
    const authResponse = await axios.post('https://homolog-order-api.saipos.com/auth', {
      idPartner: '3f8a028b73ef542e4a37f77e81be7477',
      secret: '7f2cd14dc1982bba14d7fc00d506a0ac'
    });
    
    const token = authResponse.data.accessToken;
    console.log('✅ Token obtido com sucesso');
    console.log('Token completo:', token);
    console.log('Comprimento:', token.length, 'caracteres\n');
    
    // PASSO 2: Decodificar JWT
    const parts = token.split('.');
    console.log('🔍 ANÁLISE DO JWT:');
    console.log('Número de partes:', parts.length);
    console.log('Header (parte 1):', parts[0]);
    console.log('Payload (parte 2):', parts[1]);
    console.log('Signature (parte 3):', parts[2]);
    
    // Decodificar header
    const headerDecoded = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    console.log('\n📋 HEADER DECODIFICADO:', JSON.stringify(headerDecoded, null, 2));
    
    // Decodificar payload
    const payloadDecoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('\n📋 PAYLOAD DECODIFICADO:', JSON.stringify(payloadDecoded, null, 2));
    
    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    const exp = payloadDecoded.exp;
    const iat = payloadDecoded.iat;
    
    console.log('\n⏰ ANÁLISE DE TEMPO:');
    console.log('Timestamp atual:', now);
    console.log('Token criado em (iat):', iat);
    console.log('Token expira em (exp):', exp);
    console.log('Tempo até expiração:', (exp - now), 'segundos');
    console.log('Token expirado?', exp < now ? 'SIM' : 'NÃO');
    
    console.log('\n🔍 VERIFICAÇÕES:');
    console.log('idPartner no token:', payloadDecoded.idPartner);
    console.log('idPartner esperado: 3f8a028b73ef542e4a37f77e81be7477');
    console.log('IdPartner confere?', payloadDecoded.idPartner === '3f8a028b73ef542e4a37f77e81be7477' ? 'SIM' : 'NÃO');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

main(); 