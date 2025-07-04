/**
 * Teste de Envio Real para API Saipos
 * 
 * Este script pega um arquivo JSON convertido e tenta enviar
 * para a API real da Saipos para validar a integração completa
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const saiposConfig = require('./saipos-config.cjs');

const LOGS_DIR = path.join(__dirname, 'logs');
const SAIPOS_LOGS_DIR = path.join(LOGS_DIR, 'saipos');
const REPORTS_LOGS_DIR = path.join(LOGS_DIR, 'reports');

/**
 * Obter token de autenticação da Saipos
 */
async function getAuthToken() {
  try {
    console.log('🔑 Obtendo token de autenticação da Saipos...');
    
    const authPayload = saiposConfig.getAuthPayload();
    const response = await axios.post(saiposConfig.AUTH_URL, authPayload, {
      timeout: saiposConfig.TIMEOUT
    });
    
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    
    console.log('✅ Token obtido com sucesso!');
    console.log('📏 Comprimento:', response.data.token.length, 'caracteres');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Enviar pedido convertido para a API Saipos
 */
async function sendOrderToSaipos(saiposOrder, token) {
  try {
    console.log('📤 Enviando pedido para API Saipos...');
    console.log('🆔 Order ID:', saiposOrder.order_id);
    console.log('👤 Cliente:', saiposOrder.customer.name);
    console.log('💰 Total:', saiposOrder.total_amount);
    
    const headers = saiposConfig.getHeaders(token);
    
    const response = await axios.post(saiposConfig.ORDER_URL, saiposOrder, {
      headers,
      timeout: saiposConfig.TIMEOUT
    });
    
    console.log('✅ Pedido enviado com sucesso!');
    console.log('📋 Resposta da API:', JSON.stringify(response.data, null, 2));
    
    return {
      success: true,
      response: response.data,
      status: response.status
    };
    
  } catch (error) {
    console.error('❌ Erro ao enviar pedido:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 'NETWORK_ERROR'
    };
  }
}

/**
 * Listar arquivos de pedidos convertidos disponíveis
 */
async function listAvailableOrders() {
  try {
    const files = await fs.readdir(SAIPOS_LOGS_DIR);
    const saiposFiles = files
      .filter(file => file.startsWith('pedido-saipos-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Mais recentes primeiro
    
    return saiposFiles;
  } catch (error) {
    console.error('❌ Erro ao listar arquivos:', error.message);
    return [];
  }
}

/**
 * Carregar pedido convertido
 */
async function loadSaiposOrder(filename) {
  try {
    const filepath = path.join(SAIPOS_LOGS_DIR, filename);
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar pedido:', error.message);
    throw error;
  }
}

/**
 * Salvar resultado do teste
 */
async function saveTestResult(result, timestamp) {
  try {
    const filename = `teste-api-saipos-${timestamp}.json`;
    const filepath = path.join(REPORTS_LOGS_DIR, filename);
    
    const testResult = {
      timestamp: new Date().toISOString(),
      test_id: timestamp,
      environment: saiposConfig.ENVIRONMENT,
      api_urls: {
        auth: saiposConfig.AUTH_URL,
        order: saiposConfig.ORDER_URL
      },
      credentials: {
        id_partner: saiposConfig.ID_PARTNER,
        cod_store: saiposConfig.COD_STORE
      },
      result: result
    };
    
    await fs.writeFile(
      filepath,
      JSON.stringify(testResult, null, 2),
      'utf-8'
    );
    
    console.log('💾 Resultado salvo:', filename);
    return filename;
  } catch (error) {
    console.error('❌ Erro ao salvar resultado:', error.message);
    throw error;
  }
}

/**
 * Função principal
 */
async function testSaiposAPI() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    console.log('🚀 TESTE DE ENVIO REAL PARA API SAIPOS');
    console.log('📅 Timestamp:', timestamp);
    console.log('🌐 Ambiente:', saiposConfig.ENVIRONMENT);
    console.log('═'.repeat(80));
    
    // 1. Listar pedidos disponíveis
    console.log('\n📋 Procurando pedidos convertidos...');
    const availableOrders = await listAvailableOrders();
    
    if (availableOrders.length === 0) {
      console.log('⚠️  Nenhum pedido convertido encontrado!');
      console.log('💡 Execute primeiro: node webhook-simulator.cjs');
      process.exit(1);
    }
    
    console.log(`✅ Encontrados ${availableOrders.length} pedidos:`);
    availableOrders.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    // 2. Usar o pedido mais recente
    const selectedFile = availableOrders[0];
    console.log(`\n🎯 Usando pedido mais recente: ${selectedFile}`);
    
    // 3. Carregar dados do pedido
    console.log('\n📥 Carregando dados do pedido...');
    const saiposOrder = await loadSaiposOrder(selectedFile);
    console.log('✅ Pedido carregado:', {
      order_id: saiposOrder.order_id,
      customer: saiposOrder.customer.name,
      products: saiposOrder.products.length,
      total: saiposOrder.total_amount
    });
    
    // 4. Obter token de autenticação
    const token = await getAuthToken();
    
    // 5. Enviar pedido para API
    console.log('\n📤 Iniciando envio para API Saipos...');
    const result = await sendOrderToSaipos(saiposOrder, token);
    
    // 6. Salvar resultado
    await saveTestResult(result, timestamp);
    
    // 7. Resumo final
    console.log('\n' + '═'.repeat(80));
    if (result.success) {
      console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
      console.log('✅ Pedido foi aceito pela API Saipos');
      console.log('📊 Status HTTP:', result.status);
      console.log('🆔 Resposta:', JSON.stringify(result.response, null, 2));
    } else {
      console.log('❌ TESTE FALHOU');
      console.log('💥 Erro:', JSON.stringify(result.error, null, 2));
      console.log('📊 Status:', result.status);
    }
    console.log('═'.repeat(80));
    
    console.log('\n📂 Resultado salvo em logs/reports/');
    
    if (result.success) {
      console.log('\n🎯 PRÓXIMOS PASSOS:');
      console.log('1. ✅ Mapeamento Shopify → Saipos funcionando');
      console.log('2. ✅ API Saipos aceita os dados convertidos');
      console.log('3. 🔧 Implementar endpoint webhook em produção');
      console.log('4. ⚙️  Configurar webhook no admin do Shopify');
    } else {
      console.log('\n🔧 AÇÕES NECESSÁRIAS:');
      console.log('1. Verificar credenciais da API Saipos');
      console.log('2. Validar formato dos dados enviados');
      console.log('3. Conferir configurações do ambiente');
    }
    
  } catch (error) {
    console.error('\n💥 ERRO GERAL:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Salvar erro
    try {
      const errorResult = {
        success: false,
        error: error.message,
        stack: error.stack
      };
      
      await saveTestResult(errorResult, timestamp);
    } catch (saveError) {
      console.error('❌ Erro ao salvar log de erro:', saveError.message);
    }
    
    process.exit(1);
  }
}

// Verificar argumentos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Teste de API Saipos

Uso:
  node test-saipos-api.cjs           # Testar com pedido mais recente
  node test-saipos-api.cjs --help    # Mostrar ajuda

Pré-requisitos:
  1. Execute 'node webhook-simulator.cjs' primeiro
  2. Verifique as credenciais em saipos-config.cjs
  3. Certifique-se que tem acesso à API de homologação

Arquivos gerados:
  logs/reports/teste-api-saipos-{timestamp}.json  # Resultado do teste
`);
  process.exit(0);
}

// Executar teste
testSaiposAPI(); 