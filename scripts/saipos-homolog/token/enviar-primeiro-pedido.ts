import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFBhcnRuZXIiOiIzZjhhMDI4YjczZWY1NDJlNGEzN2Y3N2U4MWJlNzQ3NyIsImNyZWF0ZWQiOjE3NTEzMjIyNzEyOTIsImlhdCI6MTc1MTMyMjI3MSwiZXhwIjoxNzUxNDk1MDcxfQ.5YXVGU6FQ2XBxcd0b1JMBEX473ypwpmWrEAQSOYpsio';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';
const LOGS_DIR = path.join(__dirname, 'logs');

const pedido = {
  order_id: 'homolog-001',
  display_id: 'homolog-001',
  cod_store: '123',
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

async function enviarPedido() {
  try {
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
  } catch (error: any) {
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