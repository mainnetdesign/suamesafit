const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';
const COD_STORE = '123';
const LOGS_DIR = path.join(__dirname, 'logs');

// Diferentes formatos de payload para testar
const formatos = [
  {
    nome: 'Formato 1 - Minimalista',
    payload: {
      order_id: 'homolog-001',
      cod_store: '123',
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        quantity: 1,
        name: 'Produto Teste',
        price: 10.0
      }],
      customer: {
        name: 'Cliente Teste',
        phone: '21999999999'
      }
    }
  },
  {
    nome: 'Formato 2 - Com display_id',
    payload: {
      order_id: 'homolog-001',
      display_id: 'homolog-001',
      cod_store: '123',
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        quantity: 1,
        name: 'Produto Teste',
        unit_price: 10.0,
        total_price: 10.0
      }],
      customer: {
        name: 'Cliente Teste',
        phone: '21999999999'
      }
    }
  },
  {
    nome: 'Formato 3 - Com endereço',
    payload: {
      order_id: 'homolog-001',
      display_id: 'homolog-001',
      cod_store: '123',
      created_at: new Date().toISOString(),
      notes: 'Pedido de homologação',
      products: [{
        product_id: '001',
        quantity: 1,
        name: 'Produto Teste',
        unit_price: 10.0,
        total_price: 10.0
      }],
      customer: {
        name: 'Cliente Teste',
        phone: '21999999999',
        address: {
          street: 'Rua Teste',
          number: '123',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipcode: '20000-000'
        }
      }
    }
  },
  {
    nome: 'Formato 4 - Snake_case',
    payload: {
      order_id: 'homolog-001',
      display_id: 'homolog-001',
      cod_store: '123',
      created_at: new Date().toISOString(),
      notes: 'Pedido de homologação',
      products: [{
        product_id: '001',
        quantity: 1,
        name: 'Produto Teste',
        unit_price: 10.0,
        total_price: 10.0
      }],
      customer_name: 'Cliente Teste',
      customer_phone: '21999999999'
    }
  },
  {
    nome: 'Formato 5 - Sem cod_store como string',
    payload: {
      order_id: 'homolog-001',
      display_id: 'homolog-001',
      cod_store: 123,
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        quantity: 1,
        name: 'Produto Teste',
        unit_price: 10.0,
        total_price: 10.0
      }],
      customer: {
        name: 'Cliente Teste',
        phone: '21999999999'
      }
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
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    return response.data.token;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error.response?.data || error.message);
    throw error;
  }
}

async function testarFormato(formato, token, index) {
  try {
    console.log(`\n=== TESTANDO ${formato.nome.toUpperCase()} ===`);
    console.log('Payload:', JSON.stringify(formato.payload, null, 2));
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET,
    };

    const response = await axios.post(SAIPOS_ORDER_URL, formato.payload, { headers });
    
    console.log(`✅ SUCESSO! ${formato.nome}`);
    console.log('Resposta:', response.data);
    
    // Salvar sucesso
    await fs.writeFile(
      path.join(LOGS_DIR, `formato-${index}-sucesso.json`),
      JSON.stringify({ formato: formato.nome, payload: formato.payload, response: response.data }, null, 2),
      'utf-8'
    );
    
    return { sucesso: true, formato: formato.nome, resposta: response.data };
    
  } catch (error) {
    console.log(`❌ ERRO - ${formato.nome}:`, error.response?.data || error.message);
    
    // Salvar erro
    await fs.writeFile(
      path.join(LOGS_DIR, `formato-${index}-erro.json`),
      JSON.stringify({ formato: formato.nome, payload: formato.payload, error: error.response?.data || error.message }, null, 2),
      'utf-8'
    );
    
    return { sucesso: false, formato: formato.nome, erro: error.response?.data || error.message };
  }
}

async function testarTodosFormatos() {
  try {
    console.log('🔑 Obtendo token de autenticação...');
    const token = await getAuthToken();
    console.log('✅ Token obtido com sucesso!');

    // Garante que a pasta de logs existe
    await fs.mkdir(LOGS_DIR, { recursive: true });

    console.log('\n🧪 Iniciando testes de formatos...');
    
    const resultados = [];
    
    for (let i = 0; i < formatos.length; i++) {
      const resultado = await testarFormato(formatos[i], token, i + 1);
      resultados.push(resultado);
      
      // Pequena pausa entre os testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 RESUMO DOS TESTES:');
    resultados.forEach((resultado, index) => {
      const status = resultado.sucesso ? '✅' : '❌';
      console.log(`${status} Formato ${index + 1}: ${resultado.formato}`);
    });
    
    const sucessos = resultados.filter(r => r.sucesso);
    if (sucessos.length > 0) {
      console.log('\n🎉 FORMATOS QUE FUNCIONARAM:');
      sucessos.forEach(s => {
        console.log(`✅ ${s.formato}`);
        console.log('Resposta:', s.resposta);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarTodosFormatos(); 