/**
 * Servidor Webhook Shopify → Saipos
 * 
 * Servidor Express para receber webhooks reais do Shopify
 * e converter automaticamente para formato Saipos
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { mapShopifyOrderToSaipos, validateSaiposOrder } = require('./shopify-mapper.cjs');

const app = express();
const PORT = process.env.PORT || 3001;
const LOGS_DIR = path.join(__dirname, 'logs');
const SHOPIFY_LOGS_DIR = path.join(LOGS_DIR, 'shopify');
const SAIPOS_LOGS_DIR = path.join(LOGS_DIR, 'saipos');
const REPORTS_LOGS_DIR = path.join(LOGS_DIR, 'reports');

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

/**
 * Garantir que pastas de logs existem
 */
async function ensureLogsDir() {
  try {
    await fs.mkdir(SHOPIFY_LOGS_DIR, { recursive: true });
    await fs.mkdir(SAIPOS_LOGS_DIR, { recursive: true });
    await fs.mkdir(REPORTS_LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar pastas logs:', error.message);
  }
}

/**
 * Salvar webhook recebido e resultado da conversão
 */
async function saveWebhookData(shopifyOrder, saiposOrder, validation, timestamp) {
  try {
    // Salvar pedido original do Shopify
    await fs.writeFile(
      path.join(SHOPIFY_LOGS_DIR, `webhook-shopify-${timestamp}.json`),
      JSON.stringify(shopifyOrder, null, 2),
      'utf-8'
    );

    // Salvar pedido convertido para Saipos
    await fs.writeFile(
      path.join(SAIPOS_LOGS_DIR, `webhook-saipos-${timestamp}.json`),
      JSON.stringify(saiposOrder, null, 2),
      'utf-8'
    );

    // Salvar relatório
    const report = {
      timestamp: new Date().toISOString(),
      test_id: timestamp,
      source: 'real_webhook',
      ngrok_url: 'https://subtly-intense-toucan.ngrok-free.app',
      shopify_order: {
        id: shopifyOrder.id,
        number: shopifyOrder.order_number || shopifyOrder.number,
        total: shopifyOrder.total_price,
        customer: shopifyOrder.customer?.first_name + ' ' + shopifyOrder.customer?.last_name
      },
      saipos_order: {
        order_id: saiposOrder.order_id,
        customer: saiposOrder.customer.name,
        total: saiposOrder.total_amount,
        products: saiposOrder.products.length
      },
      validation: validation,
      files_created: [
        `shopify/webhook-shopify-${timestamp}.json`,
        `saipos/webhook-saipos-${timestamp}.json`,
        `reports/webhook-report-${timestamp}.json`
      ]
    };

    await fs.writeFile(
      path.join(REPORTS_LOGS_DIR, `webhook-report-${timestamp}.json`),
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    return report;
  } catch (error) {
    console.error('Erro ao salvar dados:', error.message);
    throw error;
  }
}

/**
 * Endpoint para receber webhooks do Shopify
 */
app.post('/webhook/shopify-orders', async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  
  try {
    console.log('\n🚨 WEBHOOK RECEBIDO DO SHOPIFY!');
    console.log('📅 Timestamp:', timestamp);
    console.log('🔗 De:', req.get('X-Shopify-Shop-Domain') || 'Shopify');
    console.log('📦 Tópico:', req.get('X-Shopify-Topic') || 'orders/created');
    console.log('═'.repeat(80));

    // Extrair dados do webhook
    const shopifyOrder = req.body;

    // Log básico do pedido recebido
    console.log('📥 Pedido recebido:', {
      id: shopifyOrder.id,
      number: shopifyOrder.order_number || shopifyOrder.number,
      total: shopifyOrder.total_price,
      customer: shopifyOrder.customer?.email || 'N/A'
    });

    // Converter para formato Saipos
    console.log('🔄 Convertendo para formato Saipos...');
    const saiposOrder = mapShopifyOrderToSaipos(shopifyOrder);

    // Validar dados convertidos
    console.log('🔍 Validando dados convertidos...');
    const validation = validateSaiposOrder(saiposOrder);

    if (validation.isValid) {
      console.log('✅ Validação passou!');
    } else {
      console.log('⚠️  Validação falhou:', validation.errors);
    }

    // Salvar todos os dados
    console.log('💾 Salvando arquivos...');
    const report = await saveWebhookData(shopifyOrder, saiposOrder, validation, timestamp);

    // Log de sucesso
    console.log('🎉 PROCESSAMENTO CONCLUÍDO!');
    console.log('📊 Status:', validation.isValid ? 'SUCCESS' : 'VALIDATION_FAILED');
    console.log('🛒 Shopify Order:', report.shopify_order.number);
    console.log('📦 Saipos Order:', report.saipos_order.order_id);
    console.log('👤 Cliente:', report.saipos_order.customer);
    console.log('💰 Total:', `R$ ${report.saipos_order.total}`);
    console.log('📦 Produtos:', report.saipos_order.products);
    console.log('📁 Arquivos salvos em:', LOGS_DIR);
    console.log('═'.repeat(80));

    // Responder OK para o Shopify
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processado com sucesso',
      order_id: saiposOrder.order_id,
      timestamp: timestamp,
      files_created: report.files_created.length
    });

  } catch (error) {
    console.error('❌ ERRO ao processar webhook:', error.message);
    console.error('Stack:', error.stack);

    // Salvar erro
    try {
      await fs.writeFile(
        path.join(REPORTS_LOGS_DIR, `webhook-error-${timestamp}.json`),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack,
          request_body: req.body,
          headers: req.headers
        }, null, 2),
        'utf-8'
      );
    } catch (saveError) {
      console.error('❌ Erro ao salvar log de erro:', saveError.message);
    }

    // Responder erro (mas não 500 para não fazer Shopify retentar)
    res.status(422).json({ 
      success: false, 
      error: error.message,
      timestamp: timestamp
    });
  }
});

/**
 * Endpoint de status/health check
 */
app.get('/webhook/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Shopify → Saipos Webhook',
    timestamp: new Date().toISOString(),
    ngrok_url: 'https://subtly-intense-toucan.ngrok-free.app',
    webhook_endpoint: '/webhook/shopify-orders',
    logs_dir: LOGS_DIR
  });
});

/**
 * Endpoint raiz com instruções
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor Webhook Shopify → Saipos',
    status: 'Ativo e aguardando webhooks!',
    ngrok_url: 'https://subtly-intense-toucan.ngrok-free.app',
    endpoints: {
      webhook: '/webhook/shopify-orders',
      status: '/webhook/status'
    },
    instructions: {
      shopify_webhook_url: 'https://subtly-intense-toucan.ngrok-free.app/webhook/shopify-orders',
      shopify_event: 'orders/created',
      format: 'JSON'
    },
    next_steps: [
      '1. Configure o webhook no Shopify Admin',
      '2. Faça um pedido de teste no site',
      '3. Verifique os logs gerados'
    ]
  });
});

/**
 * Middleware de erro global
 */
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error.message);
  res.status(500).json({ 
    success: false, 
    error: 'Erro interno do servidor' 
  });
});

/**
 * Inicializar servidor
 */
async function startServer() {
  try {
    await ensureLogsDir();
    
    app.listen(PORT, () => {
      console.log('🚀 SERVIDOR WEBHOOK ATIVO!');
      console.log('═'.repeat(80));
      console.log('🌐 Servidor local:', `http://localhost:${PORT}`);
      console.log('🔗 URL Ngrok:', 'https://subtly-intense-toucan.ngrok-free.app');
      console.log('📡 Endpoint webhook:', 'https://subtly-intense-toucan.ngrok-free.app/webhook/shopify-orders');
      console.log('📊 Status:', 'https://subtly-intense-toucan.ngrok-free.app/webhook/status');
      console.log('📁 Logs salvos em:', LOGS_DIR);
      console.log('═'.repeat(80));
      console.log('');
      console.log('🎯 PRÓXIMOS PASSOS:');
      console.log('1. Configure webhook no Shopify Admin:');
      console.log('   URL: https://subtly-intense-toucan.ngrok-free.app/webhook/shopify-orders');
      console.log('   Event: Order creation');
      console.log('   Format: JSON');
      console.log('');
      console.log('2. Faça um pedido no site da Shopify');
      console.log('3. Observe os logs aqui no terminal!');
      console.log('');
      console.log('⏳ Aguardando webhooks...');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor webhook...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando servidor webhook...');
  process.exit(0);
});

// Iniciar servidor
startServer(); 