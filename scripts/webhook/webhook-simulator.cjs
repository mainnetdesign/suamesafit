/**
 * Simulador de Webhook Shopify → Saipos
 * 
 * Este script simula o recebimento de um webhook do Shopify,
 * converte os dados para o formato Saipos e salva os resultados
 */

const fs = require('fs').promises;
const path = require('path');
const { mapShopifyOrderToSaipos, validateSaiposOrder } = require('./shopify-mapper.cjs');

// Configurações
const LOGS_DIR = path.join(__dirname, 'logs');
const SHOPIFY_LOGS_DIR = path.join(LOGS_DIR, 'shopify');
const SAIPOS_LOGS_DIR = path.join(LOGS_DIR, 'saipos');
const REPORTS_LOGS_DIR = path.join(LOGS_DIR, 'reports');
const SAMPLE_DATA_DIR = path.join(__dirname, 'sample-data');

/**
 * Cria as pastas de logs se não existirem
 */
async function ensureLogsDir() {
  try {
    await fs.mkdir(SHOPIFY_LOGS_DIR, { recursive: true });
    await fs.mkdir(SAIPOS_LOGS_DIR, { recursive: true });
    await fs.mkdir(REPORTS_LOGS_DIR, { recursive: true });
    console.log('📁 Pastas de logs criadas/verificadas:', LOGS_DIR);
  } catch (error) {
    console.error('❌ Erro ao criar pastas de logs:', error.message);
    throw error;
  }
}

/**
 * Carrega dados de exemplo do Shopify
 * @param {string} filename - Nome do arquivo (opcional)
 * @returns {Object} Dados do pedido do Shopify
 */
async function loadSampleData(filename = 'shopify-order.json') {
  try {
    const filePath = path.join(SAMPLE_DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Erro ao carregar dados de exemplo:', error.message);
    throw error;
  }
}

/**
 * Salva o pedido original do Shopify para referência
 * @param {Object} shopifyOrder - Pedido original do Shopify
 * @param {string} timestamp - Timestamp para nomear arquivo
 */
async function saveShopifyOrder(shopifyOrder, timestamp) {
  try {
    const filename = `pedido-shopify-${timestamp}.json`;
    const filepath = path.join(SHOPIFY_LOGS_DIR, filename);
    
    await fs.writeFile(
      filepath, 
      JSON.stringify(shopifyOrder, null, 2), 
      'utf-8'
    );
    
    console.log('💾 Pedido original salvo:', filename);
    return filename;
  } catch (error) {
    console.error('❌ Erro ao salvar pedido Shopify:', error.message);
    throw error;
  }
}

/**
 * Salva o pedido convertido para formato Saipos
 * @param {Object} saiposOrder - Pedido convertido para Saipos
 * @param {string} timestamp - Timestamp para nomear arquivo
 */
async function saveSaiposOrder(saiposOrder, timestamp) {
  try {
    const filename = `pedido-saipos-${timestamp}.json`;
    const filepath = path.join(SAIPOS_LOGS_DIR, filename);
    
    await fs.writeFile(
      filepath, 
      JSON.stringify(saiposOrder, null, 2), 
      'utf-8'
    );
    
    console.log('💾 Pedido convertido salvo:', filename);
    return filename;
  } catch (error) {
    console.error('❌ Erro ao salvar pedido Saipos:', error.message);
    throw error;
  }
}

/**
 * Gera relatório do mapeamento
 * @param {Object} shopifyOrder - Pedido original
 * @param {Object} saiposOrder - Pedido convertido
 * @param {Object} validation - Resultado da validação
 * @param {string} timestamp - Timestamp
 */
async function generateReport(shopifyOrder, saiposOrder, validation, timestamp) {
  const report = {
    timestamp: new Date().toISOString(),
    test_id: timestamp,
    status: validation.isValid ? 'success' : 'validation_failed',
    summary: {
      shopify_order_id: shopifyOrder.id,
      shopify_order_number: shopifyOrder.order_number || shopifyOrder.number,
      saipos_order_id: saiposOrder.order_id,
      total_price: shopifyOrder.total_price,
      customer_name: saiposOrder.customer.name,
      products_count: saiposOrder.products.length
    },
    validation: validation,
    mapping_details: {
      original_fields_count: Object.keys(shopifyOrder).length,
      mapped_fields_count: Object.keys(saiposOrder).length,
      has_customer: !!shopifyOrder.customer,
      has_shipping_address: !!shopifyOrder.shipping_address,
      has_line_items: !!(shopifyOrder.line_items && shopifyOrder.line_items.length > 0)
    },
    files_generated: {
      shopify_order: `shopify/pedido-shopify-${timestamp}.json`,
      saipos_order: `saipos/pedido-saipos-${timestamp}.json`,
      report: `reports/relatorio-${timestamp}.json`
    }
  };
  
  const filename = `relatorio-${timestamp}.json`;
  const filepath = path.join(REPORTS_LOGS_DIR, filename);
  
  await fs.writeFile(
    filepath, 
    JSON.stringify(report, null, 2), 
    'utf-8'
  );
  
  console.log('📊 Relatório gerado:', filename);
  return report;
}

/**
 * Simula o processamento de um webhook
 * @param {string} sampleFile - Arquivo de dados de exemplo (opcional)
 */
async function simulateWebhook(sampleFile) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    console.log('🚀 INICIANDO SIMULAÇÃO DE WEBHOOK SHOPIFY → SAIPOS');
    console.log('📅 Timestamp:', timestamp);
    console.log('═'.repeat(80));
    
    // 1. Preparar ambiente
    await ensureLogsDir();
    
    // 2. Carregar dados do Shopify
    console.log('\n📥 Carregando dados do Shopify...');
    const shopifyOrder = await loadSampleData(sampleFile);
    console.log('✅ Dados carregados:', {
      id: shopifyOrder.id,
      number: shopifyOrder.order_number || shopifyOrder.number,
      total: shopifyOrder.total_price,
      items: shopifyOrder.line_items?.length || 0
    });
    
    // 3. Mapear para formato Saipos
    console.log('\n🔄 Convertendo para formato Saipos...');
    const saiposOrder = mapShopifyOrderToSaipos(shopifyOrder);
    console.log('✅ Conversão realizada:', {
      order_id: saiposOrder.order_id,
      customer: saiposOrder.customer.name,
      products: saiposOrder.products.length,
      total: saiposOrder.total_amount
    });
    
    // 4. Validar dados convertidos
    console.log('\n🔍 Validando dados convertidos...');
    const validation = validateSaiposOrder(saiposOrder);
    
    if (validation.isValid) {
      console.log('✅ Validação passou! Dados estão corretos.');
    } else {
      console.log('⚠️  Validação falhou. Erros encontrados:');
      validation.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // 5. Salvar arquivos
    console.log('\n💾 Salvando arquivos de log...');
    await saveShopifyOrder(shopifyOrder, timestamp);
    await saveSaiposOrder(saiposOrder, timestamp);
    
    // 6. Gerar relatório
    const report = await generateReport(shopifyOrder, saiposOrder, validation, timestamp);
    
    // 7. Resumo final
    console.log('\n' + '═'.repeat(80));
    console.log('🎉 SIMULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═'.repeat(80));
    console.log(`📊 Status: ${report.status}`);
    console.log(`🛒 Pedido Shopify: #${report.summary.shopify_order_number} (ID: ${report.summary.shopify_order_id})`);
    console.log(`📦 Pedido Saipos: ${report.summary.saipos_order_id}`);
    console.log(`👤 Cliente: ${report.summary.customer_name}`);
    console.log(`💰 Total: R$ ${report.summary.total_price}`);
    console.log(`📦 Produtos: ${report.summary.products_count} itens`);
    
    console.log('\n📁 Arquivos gerados:');
    console.log(`   📄 ${report.files_generated.shopify_order}`);
    console.log(`   📄 ${report.files_generated.saipos_order}`);
    console.log(`   📊 ${report.files_generated.report}`);
    
    console.log(`\n📂 Localização: ${LOGS_DIR}`);
    
    if (validation.isValid) {
      console.log('\n✨ O JSON no formato Saipos está pronto para ser enviado para a API!');
      console.log('🔗 Próximo passo: integrar com endpoint webhook real');
    } else {
      console.log('\n⚠️  Corrija os erros de validação antes de enviar para a API Saipos');
    }
    
  } catch (error) {
    console.error('\n💥 ERRO durante a simulação:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Salvar erro
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        test_id: timestamp,
        error: error.message,
        stack: error.stack
      };
      
      await fs.writeFile(
        path.join(REPORTS_LOGS_DIR, `erro-${timestamp}.json`),
        JSON.stringify(errorLog, null, 2),
        'utf-8'
      );
      
      console.log(`💾 Log de erro salvo: erro-${timestamp}.json`);
    } catch (saveError) {
      console.error('❌ Erro ao salvar log de erro:', saveError.message);
    }
    
    process.exit(1);
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
let sampleFile = 'shopify-order.json';

if (args.includes('--file') || args.includes('-f')) {
  const fileIndex = args.findIndex(arg => arg === '--file' || arg === '-f');
  if (args[fileIndex + 1]) {
    sampleFile = args[fileIndex + 1];
  }
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📖 Uso do Simulador de Webhook Shopify → Saipos

Comandos:
  node webhook-simulator.js                     # Usar dados padrão
  node webhook-simulator.js --file <arquivo>    # Usar arquivo específico
  node webhook-simulator.js --help              # Mostrar esta ajuda

Exemplos:
  node webhook-simulator.js
  node webhook-simulator.js --file shopify-order.json
  node webhook-simulator.js -f custom-order.json

Arquivos de saída:
  logs/shopify/pedido-shopify-{timestamp}.json  # Dados originais do Shopify
  logs/saipos/pedido-saipos-{timestamp}.json    # Dados convertidos para Saipos
  logs/reports/relatorio-{timestamp}.json       # Relatório do mapeamento
`);
  process.exit(0);
}

// Executar simulação
simulateWebhook(sampleFile); 