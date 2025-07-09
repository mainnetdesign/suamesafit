const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Suas credenciais

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';

async function testarCredenciais() {
  console.log('🧪 TESTANDO CREDENCIAIS DA DOCUMENTAÇÃO:');
  
  try {
    const response = await axios.post(SAIPOS_AUTH_URL, {
      idPartner: process.env.SAIPOS_ID_PARTNER,
      secret: process.env.SAIPOS_SECRET
    });
    console.log('✅ SUCESSO com credenciais da documentação!');
    console.log('Token recebido:', response.data.token.substring(0, 50) + '...');
    
  } catch (error) {
    console.log('❌ ERRO com credenciais da documentação:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.errorMessage || error.message);
  }
  
  console.log('\\n🔍 TESTANDO SUAS CREDENCIAIS ATUAIS:');
  
  try {
    const response = await axios.post(SAIPOS_AUTH_URL, {
      idPartner: process.env.SAIPOS_ID_PARTNER,
      secret: process.env.SAIPOS_SECRET
    });
    console.log(response.data);
    console.log('✅ SUCESSO com suas credenciais!');
    console.log('Token recebido:', response.data.token.substring(0, 50) + '...');
    
  } catch (error) {
    console.log('❌ ERRO com suas credenciais:');
    console.log('Status:', error.response?.status);
    console.log('Erro:', error.response?.data?.errorMessage || error.message);
  }
}

testarCredenciais();