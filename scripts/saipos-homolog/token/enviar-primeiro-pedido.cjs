require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const ID_PARTNER = process.env.SAIPOS_ID_PARTNER;
const SECRET = process.env.SAIPOS_SECRET;
const COD_STORE = process.env.SAIPOS_COD_STORE;
const LOGS_DIR = path.join(__dirname, 'logs');

const pedido = {
  order_id: 'homolog-001',
  display_id: 'homolog-001',
  cod_store: COD_STORE,
  created_at: new Date().toISOString(),
  notes: 'Pedido de homologação - novo cliente',
  products: [
    {
      product_id: '001',
      quantity: 1,
      name: 'Produto Teste',
      unit_price: 10.0,
      total_price: 10.0,
      code_pdv: 'produto-teste',
    },
  ],
  customer: {
    name: 'Cliente Homologação 1',
    phone: '21999999999',
    address: {
      street: 'Rua Teste',
      number: '123',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipcode: '20000-000',
    },
  },
};

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

async function enviarPedido() {
  try {
    // Obter token novo
    const TOKEN = await getAuthToken();
    const headers = {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET,
    };

    // Garante que a pasta de logs existe
    await fs.mkdir(LOGS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(LOGS_DIR, 'primeiro-pedido-request.json'),
      JSON.stringify({ url: SAIPOS_ORDER_URL, headers: { ...headers, Authorization: '(token omitido)' }, body: pedido }, null, 2),
      'utf-8'
    );

    console.log('Enviando pedido de homologação...');
    const response = await axios.post(SAIPOS_ORDER_URL, pedido, { headers });
    console.log('Resposta do envio:', response.data);

    await fs.writeFile(
      path.join(LOGS_DIR, 'primeiro-pedido-response.json'),
      JSON.stringify(response.data, null, 2),
      'utf-8'
    );
    console.log('Resposta salva em logs/primeiro-pedido-response.json');
  } catch (error) {
    console.error('Erro ao enviar pedido:', error.response?.data || error.message);
    await fs.writeFile(
      path.join(LOGS_DIR, 'primeiro-pedido-error.json'),
      JSON.stringify({ error: error.response?.data || error.message }, null, 2),
      'utf-8'
    );
    console.log('Erro salvo em logs/primeiro-pedido-error.json');
  }
}

enviarPedido(); 