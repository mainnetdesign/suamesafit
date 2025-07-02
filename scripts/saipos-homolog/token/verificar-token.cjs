const axios = require('axios');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';

async function verificarToken() {
  try {
    console.log('🔍 VERIFICANDO PROCESSO DE AUTENTICAÇÃO COMPLETO\n');
    
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };
    
    console.log('📤 ENVIANDO REQUISIÇÃO DE AUTENTICAÇÃO:');
    console.log('URL:', SAIPOS_AUTH_URL);
    console.log('Payload:', JSON.stringify(authPayload, null, 2));
    console.log('\n');
    
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload);
    
    console.log('📥 RESPOSTA COMPLETA DA API:');
    console.log('Status HTTP:', response.status);
    console.log('Headers de resposta:', JSON.stringify(response.headers, null, 2));
    console.log('\n');
    
    console.log('📋 DADOS RETORNADOS:');
    console.log('Resposta completa:', JSON.stringify(response.data, null, 2));
    console.log('\n');
    
    if (response.data.token) {
      console.log('🔑 TOKEN COMPLETO:');
      console.log(response.data.token);
      console.log('\n');
      
      console.log('📊 ANÁLISE DO TOKEN:');
      console.log('Comprimento:', response.data.token.length, 'caracteres');
      console.log('Primeiros 50 chars:', response.data.token.substring(0, 50) + '...');
      console.log('Últimos 20 chars:', '...' + response.data.token.substring(response.data.token.length - 20));
      
      // Tentar decodificar JWT (se for)
      try {
        const parts = response.data.token.split('.');
        if (parts.length === 3) {
          console.log('\n🔓 DECODIFICAÇÃO JWT:');
          console.log('Header:', JSON.parse(Buffer.from(parts[0], 'base64').toString()));
          console.log('Payload:', JSON.parse(Buffer.from(parts[1], 'base64').toString()));
          console.log('(Signature não é decodificada por segurança)');
        }
      } catch (e) {
        console.log('\n⚠️  Token não parece ser JWT padrão ou está em outro formato');
      }
      
    } else {
      console.log('❌ ERRO: Token não encontrado na resposta!');
    }
    
  } catch (error) {
    console.error('❌ ERRO NA AUTENTICAÇÃO:');
    console.error('Status:', error.response?.status);
    console.error('Dados do erro:', error.response?.data);
    console.error('Headers do erro:', error.response?.headers);
    console.error('Mensagem:', error.message);
  }
}

verificarToken(); 