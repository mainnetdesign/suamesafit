// Script inicial para homologação de pedidos na Saipos
// Dependências sugeridas: xlsx, axios, fs (nativo)

import axios from 'axios';
import XLSX from 'xlsx';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto da planilha (sempre em scripts/saipos-homolog/pedidos.xlsx)
const PLANILHA_PATH = path.resolve(__dirname, '..', 'pedidos.xlsx');
// Pasta para salvar os logs
const LOGS_DIR = path.join(__dirname, 'logs');

// Configurações da API Saipos
const SAIPOS_BASE_URL = 'https://homolog-order-api.saipos.com';
const SAIPOS_AUTH_URL = `${SAIPOS_BASE_URL}/auth`;
const SAIPOS_ORDER_URL = `${SAIPOS_BASE_URL}/order`;

// Credenciais
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

async function sendOrder(order: any, token: string) {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET
    };

    console.log('Enviando pedido com os seguintes dados:', {
      url: SAIPOS_ORDER_URL,
      headers: {
        ...headers,
        'Authorization': '(token omitido para log)'
      },
      data: order
    });

    const response = await axios.post(SAIPOS_ORDER_URL, order, { headers });

    console.log('Resposta do envio do pedido:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao enviar pedido:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    throw error;
  }
}

async function main() {
  try {
    console.log('Obtendo token de autenticação...');
    const token = await getAuthToken();
    console.log('Token obtido com sucesso!');

    // Ler o pedido de teste
    const pedidoJson = await fs.readFile('./pedido_teste.json', 'utf-8');
    const pedidoTeste = JSON.parse(pedidoJson);
    
    console.log('Enviando pedido de teste...');
    try {
      const responseData = await sendOrder(pedidoTeste, token);
      console.log('Resposta do envio:', responseData);
    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error.message);
      throw error;
    }
  } catch (error: any) {
    console.error('Erro geral:', error);
  }
}

// Função para mapear os dados da planilha para o formato do pedido
function mapearPedido(pedido: any, idx: number) {
  // TODO: Ajustar o mapeamento conforme as colunas reais da planilha
  return {
    order_id: `test-00${idx + 1}`,
    display_id: `test-00${idx + 1}`,
    cod_store: pedido.cod_store || '123',
    created_at: pedido.created_at || new Date().toISOString(),
    notes: pedido.notes || 'Pedido de homologação - cliente novo',
    products: [
      {
        product_id: pedido.product_id || '001',
        quantity: pedido.quantity || 1,
        name: pedido.product_name || 'Produto Teste',
        unit_price: pedido.unit_price || 10.0,
        total_price: pedido.total_price || 10.0,
        code_pdv: pedido.code_pdv || 'produto-teste',
      },
    ],
    customer: {
      name: pedido.customer_name || 'Cliente Teste',
      phone: pedido.customer_phone || '21999999999',
    },
  };
}

main(); 