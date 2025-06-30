import axios from 'axios';

// Configurações da API Saipos
const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';

// Credenciais fornecidas
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';

async function getAuthToken() {
  try {
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };

    console.log('Enviando requisição de autenticação:', {
      url: SAIPOS_AUTH_URL,
      body: authPayload
    });
    
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload);
    
    console.log('Resposta da autenticação:', response.data);
    
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    
    return response.data.token;
  } catch (error: any) {
    console.error('Erro ao obter token de autenticação:', error.response?.data || error.message);
    throw error;
  }
}

(async () => {
  try {
    console.log('Obtendo token de autenticação...');
    const token = await getAuthToken();
    console.log('Token obtido com sucesso!');
    console.log('Token:', token);
  } catch (error) {
    console.error('Falha ao obter token.');
  }
})(); 