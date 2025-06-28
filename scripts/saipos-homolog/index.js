"use strict";
// Script inicial para homologação de pedidos na Saipos
// Dependências sugeridas: xlsx, axios, fs (nativo)
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var XLSX = require("xlsx");
var fs_1 = require("fs");
var path_1 = require("path");
// Caminho da planilha (ajuste o nome do arquivo conforme necessário)
var PLANILHA_PATH = path_1.default.join(__dirname, 'pedidos.xlsx');
// Pasta para salvar os logs
var LOGS_DIR = path_1.default.join(__dirname, 'logs');
// Configurações da API Saipos
var SAIPOS_API_URL = 'https://homolog-order-api.saipos.com/order';
var HEADERS = {
    'Content-Type': 'application/json',
    'x-id-partner': '3f8a028b73ef542e4a37f77e81be7477',
    'x-secret-key': '7f2cd14dc1982bba14d7fc00d506a0ac',
};
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var workbook, sheetName, sheet, pedidos, i, pedido, payload, responseData, errorData, response, error_1, log, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, fs_1.promises.mkdir(LOGS_DIR, { recursive: true })];
                case 1:
                    _a.sent();
                    workbook = XLSX.readFile(PLANILHA_PATH);
                    sheetName = workbook.SheetNames[0];
                    sheet = workbook.Sheets[sheetName];
                    pedidos = XLSX.utils.sheet_to_json(sheet);
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < Math.min(3, pedidos.length))) return [3 /*break*/, 9];
                    pedido = pedidos[i];
                    payload = mapearPedido(pedido, i);
                    responseData = null;
                    errorData = null;
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, axios_1.default.post(SAIPOS_API_URL, payload, { headers: HEADERS })];
                case 4:
                    response = _a.sent();
                    responseData = response.data;
                    console.log("Pedido ".concat(payload.order_id, " enviado com sucesso!"));
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    errorData = error_1.response ? error_1.response.data : error_1.message;
                    console.error("Erro ao enviar pedido ".concat(payload.order_id, ":"), errorData);
                    return [3 /*break*/, 6];
                case 6:
                    log = {
                        payload: payload,
                        response: responseData,
                        error: errorData,
                    };
                    return [4 /*yield*/, fs_1.promises.writeFile(path_1.default.join(LOGS_DIR, "pedido_".concat(payload.order_id, ".json")), JSON.stringify(log, null, 2))];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 2];
                case 9:
                    console.log('Processo finalizado. Confira os logs na pasta logs.');
                    return [3 /*break*/, 11];
                case 10:
                    err_1 = _a.sent();
                    console.error('Erro geral:', err_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Função para mapear os dados da planilha para o formato do pedido
function mapearPedido(pedido, idx) {
    // TODO: Ajustar o mapeamento conforme as colunas reais da planilha
    return {
        order_id: "test-00".concat(idx + 1),
        display_id: "test-00".concat(idx + 1),
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
