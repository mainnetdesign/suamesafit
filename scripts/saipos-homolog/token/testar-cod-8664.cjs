const axios = require('axios');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';

async function verificarUsoToken() {
  try {
    console.log('🔍 VERIFICANDO ARMAZENAMENTO E USO DO TOKEN\n');
    
    // PASSO 1: Obter token
    console.log('PASSO 1: OBTENDO TOKEN');
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };
    
    const authResponse = await axios.post(SAIPOS_AUTH_URL, authPayload);
    const token = authResponse.data.token;
    
    console.log('✅ Token recebido da API');
    console.log('Token completo:', token);
    console.log('Comprimento:', token.length, 'caracteres');
    console.log('');
    
    // PASSO 2: Verificar se token foi armazenado corretamente
    console.log('PASSO 2: VERIFICANDO ARMAZENAMENTO');
    console.log('Variável token após atribuição:', token);
    console.log('Tipo da variável:', typeof token);
    console.log('Token é undefined?', token === undefined);
    console.log('Token é null?', token === null);
    console.log('Token é string vazia?', token === '');
    console.log('Token tem espaços extras?', `"${token}"`);
    console.log('');
    
    // PASSO 3: Preparar headers para requisição
    console.log('PASSO 3: PREPARANDO HEADERS PARA REQUISIÇÃO');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET,
    };
    
    console.log('Headers completos:');
    console.log('Authorization:', headers.Authorization);
    console.log('Authorization (primeiros 50 chars):', headers.Authorization.substring(0, 50) + '...');
    console.log('Content-Type:', headers['Content-Type']);
    console.log('x-id-partner:', headers['x-id-partner']);
    console.log('x-secret-key:', headers['x-secret-key']);
    console.log('');
    
    // PASSO 4: Verificar se o Bearer está correto
    console.log('PASSO 4: VERIFICANDO FORMATO BEARER');
    const authHeader = headers.Authorization;
    const bearerToken = authHeader.replace('Bearer ', '');
    console.log('Header Authorization completo:', authHeader);
    console.log('Token extraído do Bearer:', bearerToken);
    console.log('Token original === Token extraído?', token === bearerToken);
    console.log('');
    
    // PASSO 5: Fazer requisição com payload simples
    console.log('PASSO 5: FAZENDO REQUISIÇÃO COM TOKEN');
    const payload = {
      order_id: 'test-verificacao',
      cod_store: '8664',
      created_at: new Date().toISOString()
    };
    
    console.log('Payload da requisição:', JSON.stringify(payload, null, 2));
    console.log('URL da requisição:', SAIPOS_ORDER_URL);
    console.log('');
    
    console.log('📤 ENVIANDO REQUISIÇÃO...');
    
    try {
      const response = await axios.post(SAIPOS_ORDER_URL, payload, { headers });
      console.log('✅ SUCESSO!');
      console.log('Resposta:', response.data);
    } catch (error) {
      console.log('❌ ERRO na requisição:');
      console.log('Status:', error.response?.status);
      console.log('Erro:', error.response?.data);
      
      // Verificar se o erro é especificamente de token
      if (error.response?.data?.errorMessage?.includes('Token inválido')) {
        console.log('\n🔍 DIAGNÓSTICO DO ERRO DE TOKEN:');
        console.log('1. Token foi gerado?', !!token);
        console.log('2. Token não está vazio?', token && token.length > 0);
        console.log('3. Header Authorization foi montado?', !!headers.Authorization);
        console.log('4. Header contém "Bearer "?', headers.Authorization.startsWith('Bearer '));
        console.log('5. Tamanho do token no header:', bearerToken.length);
        console.log('6. Primeiros 20 chars do token no header:', bearerToken.substring(0, 20));
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

verificarUsoToken(); 