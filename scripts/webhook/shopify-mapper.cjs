/**
 * Mapeador Shopify → Saipos
 * 
 * Converte o payload do webhook orders/created do Shopify
 * para o formato esperado pela API da Saipos
 */

const saiposConfig = require('./saipos-config.cjs');

/**
 * Converte endereço do Shopify para formato Saipos
 * @param {Object} shopifyAddress - Endereço do Shopify
 * @returns {Object} Endereço no formato Saipos
 */
function mapAddress(shopifyAddress) {
  if (!shopifyAddress) return null;
  
  return {
    street: shopifyAddress.address1 || '',
    number: shopifyAddress.address2 || 'S/N',
    complement: shopifyAddress.address2 || '',
    neighborhood: shopifyAddress.city || '',
    city: shopifyAddress.city || '',
    state: shopifyAddress.province_code || shopifyAddress.province || '',
    zipcode: shopifyAddress.zip || '',
    country: shopifyAddress.country_code || shopifyAddress.country || 'BR'
  };
}

/**
 * Converte cliente do Shopify para formato Saipos
 * @param {Object} shopifyCustomer - Cliente do Shopify
 * @param {Object} shippingAddress - Endereço de entrega
 * @returns {Object} Cliente no formato Saipos
 */
function mapCustomer(shopifyCustomer, shippingAddress) {
  if (!shopifyCustomer) {
    return {
      name: 'Cliente não identificado',
      phone: '00000000000'
    };
  }
  
  const customer = {
    name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim() || 
           shopifyCustomer.email || 'Cliente não identificado',
    phone: shopifyCustomer.phone || '00000000000',
    email: shopifyCustomer.email || ''
  };
  
  // Adicionar endereço se disponível
  const address = mapAddress(shippingAddress || shopifyCustomer.default_address);
  if (address) {
    customer.address = address;
  }
  
  return customer;
}

/**
 * Converte itens do pedido do Shopify para formato Saipos
 * @param {Array} shopifyLineItems - Itens do pedido do Shopify
 * @returns {Array} Itens no formato Saipos
 */
function mapProducts(shopifyLineItems) {
  if (!shopifyLineItems || !Array.isArray(shopifyLineItems)) {
    return [{
      product_id: '001',
      name: 'Produto não identificado',
      quantity: 1,
      unit_price: 0.01,
      total_price: 0.01
    }];
  }
  
  return shopifyLineItems.map((item, index) => ({
    product_id: item.variant_id?.toString() || item.id?.toString() || `item_${index + 1}`,
    name: item.title || item.name || `Produto ${index + 1}`,
    quantity: item.quantity || 1,
    unit_price: parseFloat(item.price || 0),
    total_price: parseFloat(item.price || 0) * (item.quantity || 1),
    sku: item.sku || '',
    variant_title: item.variant_title || ''
  }));
}

/**
 * Converte webhook do Shopify orders/created para formato Saipos
 * @param {Object} shopifyOrder - Payload do webhook orders/created
 * @returns {Object} Pedido no formato Saipos
 */
function mapShopifyOrderToSaipos(shopifyOrder) {
  if (!shopifyOrder) {
    throw new Error('Payload do Shopify está vazio');
  }
  
  // Extrair dados básicos
  const orderId = shopifyOrder.id?.toString() || `shopify_${Date.now()}`;
  const orderNumber = shopifyOrder.order_number || shopifyOrder.number || orderId;
  const createdAt = shopifyOrder.created_at || new Date().toISOString();
  
  // Mapear dados
  const customer = mapCustomer(shopifyOrder.customer, shopifyOrder.shipping_address);
  const products = mapProducts(shopifyOrder.line_items);
  
  // Calcular totais
  const totalPrice = parseFloat(shopifyOrder.total_price || 0);
  const totalTax = parseFloat(shopifyOrder.total_tax || 0);
  const shippingPrice = parseFloat(shopifyOrder.total_shipping_price_set?.shop_money?.amount || 0);
  
  // Montar payload para Saipos
  const saiposOrder = {
    // IDs e identificadores
    order_id: `shopify_${orderId}`,
    display_id: `#${orderNumber}`,
    cod_store: saiposConfig.COD_STORE,
    
    // Timestamps
    created_at: createdAt,
    
    // Dados do pedido
    notes: `Pedido importado do Shopify #${orderNumber}${shopifyOrder.note ? ` - ${shopifyOrder.note}` : ''}`,
    
    // Produtos
    products: products,
    
    // Cliente
    customer: customer,
    
    // Financeiro
    total_amount: totalPrice,
    total_tax: totalTax,
    shipping_fee: shippingPrice,
    
    // Metadados adicionais
    metadata: {
      shopify_order_id: shopifyOrder.id,
      shopify_order_number: orderNumber,
      shopify_financial_status: shopifyOrder.financial_status,
      shopify_fulfillment_status: shopifyOrder.fulfillment_status,
      shopify_currency: shopifyOrder.currency,
      shopify_test: shopifyOrder.test || false,
      mapped_at: new Date().toISOString()
    }
  };
  
  // Adicionar delivery_type se for necessário
  if (shopifyOrder.shipping_address) {
    saiposOrder.delivery_type = 'delivery';
  }
  
  return saiposOrder;
}

/**
 * Valida se o pedido mapeado está correto
 * @param {Object} saiposOrder - Pedido no formato Saipos
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateSaiposOrder(saiposOrder) {
  const errors = [];
  
  if (!saiposOrder.order_id) {
    errors.push('order_id é obrigatório');
  }
  
  if (!saiposOrder.created_at) {
    errors.push('created_at é obrigatório');
  }
  
  if (!saiposOrder.products || !Array.isArray(saiposOrder.products) || saiposOrder.products.length === 0) {
    errors.push('products deve ser um array não vazio');
  }
  
  if (!saiposOrder.customer || !saiposOrder.customer.name) {
    errors.push('customer.name é obrigatório');
  }
  
  if (!saiposOrder.cod_store) {
    errors.push('cod_store é obrigatório');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  mapShopifyOrderToSaipos,
  validateSaiposOrder,
  mapAddress,
  mapCustomer,
  mapProducts
}; 