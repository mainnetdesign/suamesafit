const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_STATUS_URL = 'https://homolog-order-api.saipos.com/sale-status-by-table-or-pad';

const ID_PARTNER = process.env.SAIPOS_ID_PARTNER || '3f8a028b73ef542e4a37f77e81be7477e';
const SECRET = process.env.SAIPOS_SECRET || '7f2cd14dc1982bba14d7fc00d506a0ac';

async function getAuthToken() {
  const authPayload = { idPartner: ID_PARTNER, secret: SECRET };
  const response = await axios.post(SAIPOS_AUTH_URL, authPayload, {
    headers: { accept: 'application/json', 'content-type': 'application/json' },
  });
  if (!response.data.token) throw new Error('Token não retornado pela API');
  return response.data.token;
}

async function consultarStatusMesa(order_id) {
  const token = await getAuthToken();
  const headers = { Authorization: token, 'Content-Type': 'application/json' };
  const params = { table: [23] };
  const response = await axios.get(SAIPOS_STATUS_URL, { headers, params });
  console.log('Status da mesa:', JSON.stringify(response.data, null, 2));
}

const order_id = process.argv[2] || process.env.SAIPOS_ORDER_ID;
if (!order_id) {
  console.error('Informe o order_id da mesa como argumento!');
  process.exit(1);
}
consultarStatusMesa(order_id).catch(err => {
  console.error('Erro ao consultar status da mesa:', err.response?.data || err.message);
  process.exit(1);
}); 