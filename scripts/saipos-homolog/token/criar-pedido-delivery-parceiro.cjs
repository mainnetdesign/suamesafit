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
    // Pedido no estilo 1: Delivery entregue pelo Parceiro
    const pedido = {
      "order_id": `TESTE_${Date.now()}`,
      "display_id": `${Math.floor(Math.random() * 9999)}`,
      "cod_store": "123",
      "created_at": new Date().toISOString(),
      "notes": "Pedido de teste - Delivery por parceiro",
      "total_increase": 5,
      "total_discount": 2,
      "total_amount": 35,
      "customer": {
        "id": "123456789",
        "name": "PEDIDO DE TESTE - Cliente Sua Mesa Fit",
        "phone": "11999887766",
        "document_number": "12345678901"
      },
      "order_method": {
        "mode": "DELIVERY",
        "delivery_by": "PARTNER",
        "delivery_fee": 8,
        "scheduled": true,
        "delivery_date_time": new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora a partir de agora
      },
      "delivery_address": {
        "country": "BR",
        "state": "SP",
        "city": "São Paulo",
        "district": "Vila Madalena",
        "street_name": "TESTE - Rua Harmonia",
        "street_number": "123",
        "postal_code": "05435000",
        "reference": "Próximo ao metrô Fradique Coutinho",
        "complement": "Apartamento 45",
        "coordinates": {
          "latitude": -23.5505,
          "longitude": -46.6333
        }
      },
      "items": [
        {
          "integration_code": "BOWL001",
          "desc_item": "TESTE - Bowl Fit Proteico",
          "quantity": 1,
          "unit_price": 25,
          "notes": "Sem cebola roxa",
          "choice_items": [
            {
              "integration_code": "PROT001",
              "desc_item_choice": "Frango grelhado",
              "aditional_price": 5,
              "quantity": 1,
              "notes": ""
            },
            {
              "integration_code": "CARB001", 
              "desc_item_choice": "Arroz integral",
              "aditional_price": 2,
              "quantity": 1,
              "notes": ""
            }
          ]
        }
      ],
      "payment_types": [
        {
          "code": "DIN",
          "amount": 35,
          "change_for": 0
        }
      ]
    };

    console.log('🍽️  Enviando pedido de Delivery (entregue pelo parceiro)...');
    console.log('📋 Dados do pedido:', JSON.stringify(pedido, null, 2));

    const response = await axios.post(SAIPOS_ORDER_URL, pedido, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Pedido criado com sucesso!');
    console.log('📄 Resposta da API:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error(`Status: ${error.response.status}`);
    }
    throw error;
  }
}

(async () => {
  try {
    console.log('🚀 Iniciando processo de criação de pedido...\n');
    
    // 1. Obter token
    const token = await getAuthToken();
    
    console.log('\n');
    
    // 2. Criar pedido
    await criarPedidoDeliveryParceiro(token);
    
    console.log('\n✨ Processo concluído com sucesso!');
  } catch (error) {
    console.error('\n💥 Falha no processo:', error.message);
  }
})(); 