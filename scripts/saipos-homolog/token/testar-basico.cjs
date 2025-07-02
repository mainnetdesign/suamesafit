const axios = require('axios');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';

// Testes básicos focados na planilha
const testesBasicos = [
  {
    nome: 'Teste 1 - Só essencial',
    payload: {
      order_id: 'homolog-001',
      cod_store: '123',
      created_at: new Date().toISOString()
    }
  },
  {
    nome: 'Teste 2 - Com produtos mínimo',
    payload: {
      order_id: 'homolog-002',
      cod_store: '123',
      created_at: new Date().toISOString(),
      products: [{
        id: '001',
        name: 'Produto Teste'
      }]
    }
  },
  {
    nome: 'Teste 3 - Com cliente mínimo',
    payload: {
      order_id: 'homolog-003',
      cod_store: '123',
      created_at: new Date().toISOString(),
      customer: {
        name: 'Cliente Teste'
      }
    }
  },
  {
    nome: 'Teste 4 - Formato delivery básico',
    payload: {
      order_id: 'homolog-004',
      cod_store: '123',
      created_at: new Date().toISOString(),
      notes: 'Novo cliente enviado é cadastrado com telefone e endereço no banco',
      customer: {
        name: 'Cliente Homolog 1',
        phone: '21999999999'
      },
      products: [{
        name: 'Produto Teste',
        quantity: 1,
        price: 10.0
      }]
    }
  },
  {
    nome: 'Teste 5 - Com endereço para cadastro',
    payload: {
      order_id: 'homolog-005',
      cod_store: '123',
      created_at: new Date().toISOString(),
      notes: 'Novo cliente enviado é cadastrado com telefone e endereço no banco',
      customer: {
        name: 'Cliente Homolog 1',
        phone: '21999999999',
        address: 'Rua Teste, 123 - Centro - Rio de Janeiro/RJ - 20000-000'
      },
      products: [{
        name: 'Produto Teste',
        quantity: 1,
        price: 10.0
      }]
    }
  }
];

async function getAuthToken() {
  try {
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload);
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.response?.data || error.message);
    throw error;
  }
}

async function testarPayload(teste, token) {
  try {
    console.log(`\n🧪 ${teste.nome}`);
    console.log('📦 Payload:', JSON.stringify(teste.payload, null, 2));
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET,
    };

    const response = await axios.post(SAIPOS_ORDER_URL, teste.payload, { headers });
    
    console.log('✅ SUCESSO!');
    console.log('📋 Resposta completa:', JSON.stringify(response.data, null, 2));
    
    // Procurar campos relevantes para a planilha
    if (response.data.id) console.log('🆔 ID do pedido:', response.data.id);
    if (response.data.order_id) console.log('🆔 Order ID:', response.data.order_id);
    if (response.data.status) console.log('📊 Status:', response.data.status);
    if (response.data.created_at) console.log('📅 Data criação:', response.data.created_at);
    
    return { sucesso: true, dados: response.data };
    
  } catch (error) {
    const erro = error.response?.data || error.message;
    console.log('❌ ERRO:', erro);
    
    // Verificar se é erro diferente do token
    if (erro.errorMessage && !erro.errorMessage.includes('Token inválido')) {
      console.log('⚠️  ERRO DIFERENTE! Pode ser progresso:', erro);
    }
    
    return { sucesso: false, erro };
  }
}

async function executarTestes() {
  try {
    console.log('🔑 Obtendo token...');
    const token = await getAuthToken();
    console.log('✅ Token obtido!');

    console.log('\n🎯 Testando formatos básicos para preencher planilha...\n');
    
    let sucessos = [];
    
    for (const teste of testesBasicos) {
      const resultado = await testarPayload(teste, token);
      
      if (resultado.sucesso) {
        sucessos.push(resultado);
        console.log('🎉 ENCONTRAMOS UM FORMATO QUE FUNCIONA!');
        break; // Para no primeiro sucesso
      }
      
      // Pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (sucessos.length > 0) {
      console.log('\n🏆 SUCESSO! Dados para preencher na planilha:');
      sucessos.forEach(s => {
        console.log('📋 Dados retornados:', s.dados);
      });
    } else {
      console.log('\n😕 Nenhum formato funcionou ainda. Todos retornaram erro de token.');
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

executarTestes(); 