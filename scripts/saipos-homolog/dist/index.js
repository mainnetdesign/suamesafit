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
const SAIPOS_API_URL = `${SAIPOS_BASE_URL}/order`;
// Credenciais
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';
async function getAuthToken() {
    var _a;
    try {
        const response = await axios.post(SAIPOS_AUTH_URL, {
            idPartner: ID_PARTNER,
            secret: SECRET
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.token;
    }
    catch (error) {
        console.error('Erro ao obter token de autenticação:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw error;
    }
}
async function main() {
    try {
        // 1. Obter token de autenticação
        console.log('Obtendo token de autenticação...');
        const token = await getAuthToken();
        console.log('Token obtido com sucesso!');
        // 2. Configurar headers com o token
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        // 3. Ler a planilha
        await fs.mkdir(LOGS_DIR, { recursive: true });
        const workbook = XLSX.readFile(PLANILHA_PATH);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const pedidos = XLSX.utils.sheet_to_json(sheet);
        // 4. Montar e enviar apenas 1 pedido para teste
        if (pedidos.length > 0) {
            const pedido = pedidos[0];
            const payload = mapearPedido(pedido, 0);
            let responseData = null;
            let errorData = null;
            try {
                const response = await axios.post(SAIPOS_API_URL, payload, { headers });
                responseData = response.data;
                console.log(`Pedido ${payload.order_id} enviado com sucesso!`);
            }
            catch (error) {
                errorData = error.response ? error.response.data : error.message;
                console.error(`Erro ao enviar pedido ${payload.order_id}:`, errorData);
            }
            // Salvar log
            const log = {
                token,
                headers,
                payload,
                response: responseData,
                error: errorData,
            };
            await fs.writeFile(path.join(LOGS_DIR, `pedido_${payload.order_id}.json`), JSON.stringify(log, null, 2));
        }
        else {
            console.log('Nenhum pedido encontrado na planilha.');
        }
    }
    catch (err) {
        console.error('Erro geral:', err);
    }
}
// Função para mapear os dados da planilha para o formato do pedido
function mapearPedido(pedido, idx) {
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
