const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

// Configurações da API Saipos
const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';

// Credenciais fornecidas
// Caso as variáveis de ambiente não estejam configuradas, usa os valores padrão da Sua Mesa Fit
const ID_PARTNER = process.env.SAIPOS_ID_PARTNER || '3f8a028b73ef542e4a37f77e81be7477e';
const SECRET = process.env.SAIPOS_SECRET || '7f2cd14dc1982bba14d7fc00d506a0ac';

async function getAuthToken() {
  try {
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };

    console.log('🔑 Obtendo token de autenticação...');
    
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
    });
    
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    
    console.log('✅ Token obtido com sucesso!');
    return response.data.token;
  } catch (error) {
    console.log(error);
    console.error('❌ Erro ao obter token de autenticação:', error.response?.data || error.message);
    throw error;
  }
}

async function criarPedidoDeliveryParceiro(token) {
  try {
    // Timestamp atual
    const agora = new Date();
    const entregaEm = new Date(agora.getTime() + 60 * 60 * 1000); // 1 hora depois

    // Pedido no estilo 1: Delivery entregue pelo Parceiro
    const pedido = {
      order_id: `DELIVERY_PARTNER_${Date.now()}`,
      display_id: `${Math.floor(Math.random() * 9999)}`,
      cod_store: process.env.SAIPOS_COD_STORE,
      created_at: agora.toISOString(),
      notes: "Pedido de teste - Delivery entregue pelo parceiro - Sua Mesa Fit",
      total_increase: 0,
      total_discount: 0,
      total_amount: 32.00,
      customer: {
        id: `CUST_${Date.now()}`,
        name: "Cliente Teste Sua Mesa Fit",
        phone: "11987654321",
        document_number: "11122233344"
      },
      order_method: {
        mode: process.env.SAIPOS_ORDER_MODE || "DELIVERY",
        delivery_by: process.env.SAIPOS_DELIVERY_BY || "PARTNER",
        delivery_fee: 7.00,
        scheduled: true,
        delivery_date_time: entregaEm.toISOString()
      },
      // Adiciona identificador de mesa se for TABLE
      ...(process.env.SAIPOS_ORDER_MODE === 'TABLE' ? { table: { desc_table: '1' } } : {}),
      delivery_address: {
        country: "BR",
        state: "SP", 
        city: "São Paulo",
        district: "Vila Madalena",
        street_name: "Rua Harmonia",
        street_number: "123",
        postal_code: "05435000",
        reference: "Próximo ao metrô",
        complement: "Apto 45",
        coordinates: {
          latitude: -23.550520,
          longitude: -46.633308
        }
      },
      products: [
        {
          product_id: "BOWL_FIT_001",
          quantity: 1,
          name: "Bowl Proteico Sua Mesa Fit",
          unit_price: 25.00,
          total_price: 25.00,
          notes: "Observações do cliente: sem cebola"
        }
      ],
      payment_types: [
        {
          code: "DIN", // Dinheiro
          amount: 32.00,
          change_for: 0
        }
      ]
    };

    console.log('🍽️  Criando pedido de Delivery (parceiro entrega)...');
    console.log('📋 Estrutura do pedido:');
    console.log(JSON.stringify(pedido, null, 2));

    // Headers conforme orientação da Saipos: usar apenas Authorization e Content-Type
    const headers = {
      Authorization: token, // sem prefixo "Bearer"
      'Content-Type': 'application/json'
    };

    console.log('\n📤 Headers da requisição:');
    console.log({
      ...headers,
      'Authorization': '(token omitido por segurança)'
    });
    

const options = {
  method: 'POST',
  url: 'https://homolog-order-api.saipos.com/order',
  headers,
  data: {
    order_id: `OPTS_${Date.now()}`,
    display_id: `${Math.floor(Math.random() * 9999)}`,
    cod_store: process.env.SAIPOS_COD_STORE || '123',
    created_at: new Date().toISOString(),
    notes: '',
    total_increase: 10,
    total_discount: 10,
    total_amount: 10,
    customer: {
      id: '247559798',
      name: 'PEDIDO DE TESTE - Jonathan Stein',
      phone: '51996033508',
      document_number: '22919153048'
    },
    order_method: {
      mode: 'DELIVERY',
      delivery_by: 'PARTNER',
      delivery_fee: 1,
      scheduled: true,
      delivery_date_time: '2020-10-08T01:35:49.992093Z'
    },
    delivery_address: {
      country: 'BR',
      state: 'RS',
      city: 'São Leopoldo',
      district: 'Centro',
      street_name: 'PEDIDO DE TESTE - NÃO ENTREGAR - R. Divina Luz',
      street_number: '90',
      postal_code: '93180000',
      reference: 'Do lado do teste',
      complement: 'Teste',
      coordinates: {latitude: -9.825868, longitude: -67.948632}
    },
    items: [
      {
        integration_code: '1234',
        desc_item: 'PEDIDO DE TESTE - PEQUENO',
        quantity: 1,
        unit_price: 0,
        notes: '',
        choice_items: [
          {
            integration_code: '1111',
            desc_item_choice: 'Massa massa doce + Borda normal',
            aditional_price: 3,
            quantity: 1,
            notes: ''
          },
          {
            integration_code: '2222',
            desc_item_choice: 'Queijo',
            aditional_price: 10,
            quantity: 1,
            notes: ''
          }
        ]
      }
    ],
    // Pagamento dinâmico conforme variável de ambiente
    payment_types: [
      {
        code: process.env.SAIPOS_PAYMENT_CODE || 'DIN',
        amount: 10,
        change_for: 0,
        ...(process.env.SAIPOS_PAYMENT_CODE === 'PARTNER_PAYMENT_ONLINE' ? { complement: 'pix' } : {})
      }
    ]
  }
};

// Executa requisição
let response;
try {
  response = await axios.request(options);
} catch (err) {
  console.error('❌ Erro na requisição:', err.response?.data || err.message);
  throw err;
}
    //eh aqui
    // const response = await axios.request(SAIPOS_ORDER_URL, pedido, {
    //   headers,
    //   timeout: 30000
    // });
  

    console.log('\n✅ Pedido criado com sucesso na Saipos!');
    console.log('📄 Resposta da API:');
    console.log(JSON.stringify(response.data, null, 2));

    // Log das informações importantes
    console.log('\n📊 RESUMO DO PEDIDO:');
    console.log(`🆔 ID do Pedido: ${pedido.order_id}`);
    console.log(`📱 Display ID: ${pedido.display_id}`);
    console.log(`💰 Valor Total: R$ ${pedido.total_amount}`);
    console.log(`🚚 Tipo: ${pedido.order_method.mode} (${pedido.order_method.delivery_by})`);
    console.log(`📅 Entrega: ${pedido.order_method.delivery_date_time}`);
    console.log(`📍 Endereço: ${pedido.delivery_address.street_name}, ${pedido.delivery_address.street_number} - ${pedido.delivery_address.district}`);

    return response.data;
  } catch (error) {
    console.error('\n❌ Erro ao criar pedido:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Erro de rede:', error.message);
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função principal
(async () => {
  try {
    console.log('🚀 CRIANDO PEDIDO DELIVERY - ENTREGA POR PARCEIRO\n');
    console.log('📋 Tipo do pedido: Número 1 da tabela - Delivery entregue pelo Parceiro\n');
    console.log('🔧 Versão corrigida com headers x-id-partner e x-secret-key\n');
    
    // 1. Obter token de autenticação
    const token = await getAuthToken();
    
    console.log('\n');
    
    // 2. Criar o pedido
    await criarPedidoDeliveryParceiro(token);
    
    console.log('\n✨ Processo concluído com sucesso!');
    console.log('🎉 Pedido foi enviado para a Saipos em homologação!');
    
  } catch (error) {
    console.error('\n💥 Falha no processo:', error.message);
    process.exit(1);
  }
})(); 