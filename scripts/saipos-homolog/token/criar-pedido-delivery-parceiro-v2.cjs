const axios = require('axios');

// Configurações da API Saipos
const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';

// Credenciais fornecidas
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';

async function getAuthToken() {
  try {
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };

    console.log('🔑 Obtendo token de autenticação...');
    
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload);
    
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    
    console.log('✅ Token obtido com sucesso!');
    return response.data.token;
  } catch (error) {
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
      "order_id": `DELIVERY_PARTNER_${Date.now()}`,
      "display_id": `${Math.floor(Math.random() * 9999)}`,
      "cod_store": "01", // Código da loja padrão
      "created_at": agora.toISOString(),
      "notes": "Pedido de teste - Delivery entregue pelo parceiro - Sua Mesa Fit",
      "total_increase": 0,
      "total_discount": 0,
      "total_amount": 32.00,
      "customer": {
        "id": `CUST_${Date.now()}`,
        "name": "Cliente Teste Sua Mesa Fit",
        "phone": "11987654321",
        "document_number": "11122233344"
      },
      "order_method": {
        "mode": "DELIVERY",
        "delivery_by": "PARTNER",
        "delivery_fee": 7.00,
        "scheduled": true,
        "delivery_date_time": entregaEm.toISOString()
      },
      "delivery_address": {
        "country": "BR",
        "state": "SP", 
        "city": "São Paulo",
        "district": "Vila Madalena",
        "street_name": "Rua Harmonia",
        "street_number": "123",
        "postal_code": "05435000",
        "reference": "Próximo ao metrô",
        "complement": "Apto 45",
        "coordinates": {
          "latitude": -23.550520,
          "longitude": -46.633308
        }
      },
      "items": [
        {
          "integration_code": "BOWL_FIT_001",
          "desc_item": "Bowl Proteico Sua Mesa Fit",
          "quantity": 1,
          "unit_price": 25.00,
          "notes": "Observações do cliente: sem cebola"
        }
      ],
      "payment_types": [
        {
          "code": "DIN", // Dinheiro
          "amount": 32.00,
          "change_for": 0
        }
      ]
    };

    console.log('🍽️  Criando pedido de Delivery (parceiro entrega)...');
    console.log('📋 Estrutura do pedido:');
    console.log(JSON.stringify(pedido, null, 2));

    const response = await axios.post(SAIPOS_ORDER_URL, pedido, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos de timeout
    });

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