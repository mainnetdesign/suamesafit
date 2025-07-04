# Teste de Integração Webhook Shopify → Saipos

Este diretório contém os arquivos para testar a integração entre pedidos do Shopify e a API da Saipos através de webhooks.

## Como Funciona

1. **Webhook do Shopify**: Quando um pedido é criado no Shopify, o webhook `orders/created` é disparado
2. **Mapeamento**: Os dados do pedido são convertidos do formato Shopify para o formato esperado pela API da Saipos
3. **Armazenamento**: O JSON convertido é salvo na pasta `logs/` para validação

## Estrutura de Arquivos

```
webhook/
├── README.md              # Este arquivo
├── shopify-mapper.cjs     # Converte dados Shopify → Saipos
├── webhook-simulator.cjs  # Simula recebimento de webhook
├── webhook-server.cjs     # Servidor webhook real  
├── test-saipos-api.cjs    # Teste com API real
├── saipos-config.cjs     # Configurações da API Saipos
├── sample-data/          # Dados de exemplo
│   └── shopify-order.json
└── logs/                 # JSONs organizados por tipo
    ├── shopify/          # Dados originais do Shopify
    │   ├── pedido-shopify-{timestamp}.json
    │   └── webhook-shopify-{timestamp}.json
    ├── saipos/           # Dados convertidos para Saipos
    │   ├── pedido-saipos-{timestamp}.json
    │   └── webhook-saipos-{timestamp}.json
    └── reports/          # Relatórios e resultados
        ├── relatorio-{timestamp}.json
        ├── webhook-report-{timestamp}.json
        └── teste-api-saipos-{timestamp}.json
```

## Organização dos Logs

A partir de agora, todos os arquivos de log são organizados em pastas separadas:

- 📁 **`logs/shopify/`** - Dados originais recebidos do Shopify (webhooks e simulações)
- 📁 **`logs/saipos/`** - Dados convertidos para o formato da API Saipos
- 📁 **`logs/reports/`** - Relatórios de mapeamento, testes de API e erros

Esta organização torna mais fácil encontrar e analisar os dados de cada etapa do processo.

## Executando os Testes

### 1. Teste de Mapeamento Simples
```bash
node webhook-simulator.cjs
```

### 2. Teste com Dados Customizados
```bash
node webhook-simulator.cjs --file sample-data/shopify-order.json
```

### 3. Ver ajuda completa
```bash
node webhook-simulator.cjs --help
```

### 3. Validar Logs
Os arquivos são organizados em pastas separadas com timestamp no nome:
- `logs/saipos/pedido-saipos-{timestamp}.json` - Dados convertidos para Saipos
- `logs/shopify/pedido-shopify-{timestamp}.json` - Dados originais do Shopify
- `logs/reports/relatorio-{timestamp}.json` - Relatório do mapeamento

## Campos Mapeados

### Shopify → Saipos
- `id` → `codOrderEcommerce`
- `order_number` → `numOrder` 
- `customer` → `customer`
- `line_items` → `items`
- `shipping_address` → `address`
- `total_price` → `total`

## Configuração Real

Para usar em produção, configure o webhook no Shopify:

1. **Admin Shopify** → Settings → Notifications
2. **Webhooks** → Create webhook
3. **Event**: Order creation
4. **URL**: `https://seu-dominio.com/webhook/shopify-orders`
5. **Format**: JSON

## Resultado do Teste 🎉

O sistema foi testado com sucesso! Aqui está o que foi validado:

### ✅ Dados Convertidos com Sucesso
- **Pedido Shopify**: #1001 (João Silva)
- **Total**: R$ 125,50
- **Produtos**: 2 itens (Marmita Fitness + Suco Detox)
- **Endereço**: Completo com entrega
- **Validação**: Todos os campos obrigatórios presentes

### 📄 Arquivos Gerados
- `logs/shopify/pedido-shopify-{timestamp}.json` - Dados originais do Shopify
- `logs/saipos/pedido-saipos-{timestamp}.json` - Dados convertidos para Saipos  
- `logs/reports/relatorio-{timestamp}.json` - Relatório de mapeamento

## Teste com API Real

Para testar o envio real para a API Saipos:

```bash
node test-saipos-api.cjs
```

Este comando:
1. Carrega o pedido convertido mais recente
2. Autentica com a API Saipos
3. Envia o pedido real
4. Salva o resultado do teste

## Próximos Passos

1. ✅ Teste local do mapeamento
2. ✅ Validação do formato Saipos  
3. 🔧 Teste com API real (execute `test-saipos-api.cjs`)
4. ⏳ Deploy do endpoint webhook
5. ⏳ Configuração no Shopify Admin
6. ⏳ Monitoramento e logs de erro 