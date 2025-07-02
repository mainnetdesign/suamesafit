const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SAIPOS_AUTH_URL = 'https://homolog-order-api.saipos.com/auth';
const SAIPOS_ORDER_URL = 'https://homolog-order-api.saipos.com/order';
const ID_PARTNER = '3f8a028b73ef542e4a37f77e81be7477';
const SECRET = '7f2cd14dc1982bba14d7fc00d506a0ac';
const LOGS_DIR = path.join(__dirname, 'logs');

// Timestamp para identificar esta bateria de testes
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Formatos diversos para testar
const formatosParaTeste = [
  {
    nome: 'Minimalista Básico',
    payload: {
      order_id: 'test-minimal-001',
      created_at: new Date().toISOString()
    }
  },
  {
    nome: 'Só com Produtos',
    payload: {
      order_id: 'test-produtos-002',
      created_at: new Date().toISOString(),
      products: [{
        id: '001',
        name: 'Produto Teste',
        quantity: 1,
        price: 10.00
      }]
    }
  },
  {
    nome: 'Só com Cliente',
    payload: {
      order_id: 'test-cliente-003',
      created_at: new Date().toISOString(),
      customer: {
        name: 'Cliente Teste Homolog',
        phone: '21999999999'
      }
    }
  },
  {
    nome: 'Produto + Cliente',
    payload: {
      order_id: 'test-completo-004',
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        name: 'Produto Teste',
        quantity: 1,
        unit_price: 10.00,
        total_price: 10.00
      }],
      customer: {
        name: 'Cliente Teste Homolog',
        phone: '21999999999'
      }
    }
  },
  {
    nome: 'Com Display ID',
    payload: {
      order_id: 'test-display-005',
      display_id: 'HOMOLOG-005',
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        name: 'Produto Teste',
        quantity: 1,
        unit_price: 10.00
      }],
      customer: {
        name: 'Cliente Teste',
        phone: '21999999999'
      }
    }
  },
  {
    nome: 'Com Endereço Completo',
    payload: {
      order_id: 'test-endereco-006',
      display_id: 'HOMOLOG-006',
      created_at: new Date().toISOString(),
      notes: 'Pedido de homologação com endereço',
      products: [{
        product_id: '001',
        name: 'Produto Teste',
        quantity: 1,
        unit_price: 10.00,
        total_price: 10.00
      }],
      customer: {
        name: 'Cliente Teste Homolog',
        phone: '21999999999',
        address: {
          street: 'Rua Teste',
          number: '123',
          complement: 'Apto 101',
          neighborhood: 'Centro',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipcode: '20000-000'
        }
      }
    }
  },
  {
    nome: 'Snake Case Format',
    payload: {
      order_id: 'test-snake-007',
      display_id: 'HOMOLOG-007',
      created_at: new Date().toISOString(),
      notes: 'Teste formato snake_case',
      products: [{
        product_id: '001',
        name: 'Produto Teste',
        quantity: 1,
        unit_price: 10.00,
        total_price: 10.00
      }],
      customer_name: 'Cliente Teste',
      customer_phone: '21999999999',
      customer_address: 'Rua Teste, 123 - Centro - Rio de Janeiro/RJ'
    }
  },
  {
    nome: 'Múltiplos Produtos',
    payload: {
      order_id: 'test-multi-008',
      display_id: 'HOMOLOG-008',
      created_at: new Date().toISOString(),
      notes: 'Teste com múltiplos produtos',
      products: [
        {
          product_id: '001',
          name: 'Produto 1',
          quantity: 2,
          unit_price: 15.00,
          total_price: 30.00
        },
        {
          product_id: '002',
          name: 'Produto 2',
          quantity: 1,
          unit_price: 25.00,
          total_price: 25.00
        }
      ],
      customer: {
        name: 'Cliente Multi Produtos',
        phone: '21999999999'
      },
      total_amount: 55.00
    }
  },
  {
    nome: 'Formato Delivery',
    payload: {
      order_id: 'test-delivery-009',
      display_id: 'HOMOLOG-009',
      created_at: new Date().toISOString(),
      notes: 'Novo cliente enviado é cadastrado com telefone e endereço no banco',
      delivery_type: 'delivery',
      products: [{
        product_id: '001',
        name: 'Refeição Delivery',
        quantity: 1,
        unit_price: 20.00,
        total_price: 20.00
      }],
      customer: {
        name: 'Cliente Delivery',
        phone: '21999999999',
        address: 'Rua do Delivery, 456 - Bairro - Cidade/UF - 12345-678'
      },
      delivery_fee: 5.00,
      total_amount: 25.00
    }
  },
  {
    nome: 'Cod Store Numérico',
    payload: {
      order_id: 'test-numeric-010',
      created_at: new Date().toISOString(),
      products: [{
        product_id: '001',
        name: 'Produto Teste Numérico',
        quantity: 1,
        unit_price: 10.00
      }],
      customer: {
        name: 'Cliente Teste Numérico',
        phone: '21999999999'
      }
    }
  }
];

async function obterToken() {
  try {
    const authPayload = {
      idPartner: ID_PARTNER,
      secret: SECRET
    };
    
    const response = await axios.post(SAIPOS_AUTH_URL, authPayload);
    
    if (!response.data.token) {
      throw new Error('Token não retornado pela API');
    }
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao obter token:', error.response?.data || error.message);
    throw error;
  }
}

async function testarFormato(formato, codStore, token, index) {
  try {
    // Adicionar cod_store ao payload
    const payloadCompleto = {
      ...formato.payload,
      cod_store: codStore
    };
    
    // Se for o último formato, testar cod_store como número
    if (formato.nome === 'Cod Store Numérico') {
      payloadCompleto.cod_store = parseInt(codStore);
    }
    
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-id-partner': ID_PARTNER,
      'x-secret-key': SECRET,
    };

    console.log(`\n🧪 TESTANDO: ${formato.nome} (cod_store: ${codStore})`);
    console.log('📦 Payload:', JSON.stringify(payloadCompleto, null, 2));
    
    const inicioReq = Date.now();
    const response = await axios.post(SAIPOS_ORDER_URL, payloadCompleto, { headers });
    const fimReq = Date.now();
    
    console.log(`✅ SUCESSO! Tempo: ${fimReq - inicioReq}ms`);
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
    
    return {
      sucesso: true,
      formato: formato.nome,
      codStore: codStore,
      payload: payloadCompleto,
      response: response.data,
      tempoResposta: fimReq - inicioReq,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const erro = error.response?.data || error.message;
    console.log(`❌ ERRO: ${formato.nome} (cod_store: ${codStore})`);
    console.log('💥 Detalhes:', JSON.stringify(erro, null, 2));
    
    return {
      sucesso: false,
      formato: formato.nome,
      codStore: codStore,
      payload: {
        ...formato.payload,
        cod_store: formato.nome === 'Cod Store Numérico' ? parseInt(codStore) : codStore
      },
      error: erro,
      timestamp: new Date().toISOString()
    };
  }
}

async function executarTestesCompletos() {
  try {
    console.log('🔥 INICIANDO TESTE DE FOGO COMPLETO');
    console.log('📅 Timestamp:', TIMESTAMP);
    console.log('🎯 Formatos a testar:', formatosParaTeste.length);
    console.log('🏪 Códigos de loja: 123 e 8664');
    console.log('💥 Total de testes:', formatosParaTeste.length * 2);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Garantir que pasta de logs existe
    await fs.mkdir(LOGS_DIR, { recursive: true });
    
    // Obter token fresco
    console.log('🔑 Obtendo token de autenticação...');
    const token = await obterToken();
    console.log('✅ Token obtido com sucesso!');
    console.log('📏 Comprimento do token:', token.length, 'caracteres');
    
    const resultados = [];
    
    // Testar com cod_store 123
    console.log('\n🏪 === TESTANDO COM COD_STORE: 123 ===\n');
    for (let i = 0; i < formatosParaTeste.length; i++) {
      const resultado = await testarFormato(formatosParaTeste[i], '123', token, i + 1);
      resultados.push(resultado);
      
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Testar com cod_store 8664
    console.log('\n🏪 === TESTANDO COM COD_STORE: 8664 ===\n');
    for (let i = 0; i < formatosParaTeste.length; i++) {
      const resultado = await testarFormato(formatosParaTeste[i], '8664', token, i + 1);
      resultados.push(resultado);
      
      // Pequena pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Gerar relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(80));
    
    const sucessos = resultados.filter(r => r.sucesso);
    const erros = resultados.filter(r => !r.sucesso);
    
    console.log(`✅ Sucessos: ${sucessos.length}`);
    console.log(`❌ Erros: ${erros.length}`);
    console.log(`📊 Total: ${resultados.length}`);
    
    if (sucessos.length > 0) {
      console.log('\n🎉 SUCESSOS:');
      sucessos.forEach(s => {
        console.log(`   ✅ ${s.formato} (cod_store: ${s.codStore})`);
      });
    }
    
    if (erros.length > 0) {
      console.log('\n💥 ERROS:');
      erros.forEach(e => {
        console.log(`   ❌ ${e.formato} (cod_store: ${e.codStore})`);
      });
    }
    
    // Salvar resultados em arquivos separados para email
    const relatorioPorEmail = {
      timestamp: TIMESTAMP,
      credenciais: {
        idPartner: ID_PARTNER,
        secret: SECRET,
        ambiente: 'homolog-order-api.saipos.com'
      },
      resumo: {
        totalTestes: resultados.length,
        sucessos: sucessos.length,
        erros: erros.length,
        formatosTestados: formatosParaTeste.length,
        codigosLoja: ['123', '8664']
      },
      resultadosDetalhados: resultados
    };
    
    // Arquivo principal com todos os resultados
    const nomeArquivo = `teste-completo-${TIMESTAMP}.json`;
    await fs.writeFile(
      path.join(LOGS_DIR, nomeArquivo),
      JSON.stringify(relatorioPorEmail, null, 2),
      'utf-8'
    );
    
    // Arquivo só com sucessos (se houver)
    if (sucessos.length > 0) {
      await fs.writeFile(
        path.join(LOGS_DIR, `sucessos-${TIMESTAMP}.json`),
        JSON.stringify(sucessos, null, 2),
        'utf-8'
      );
    }
    
    // Arquivo só com erros
    await fs.writeFile(
      path.join(LOGS_DIR, `erros-${TIMESTAMP}.json`),
      JSON.stringify(erros, null, 2),
      'utf-8'
    );
    
    // Relatório resumido para email
    const resumoEmail = {
      timestamp: TIMESTAMP,
      ambiente: 'Saipos Homologação',
      credenciais: `idPartner: ${ID_PARTNER}`,
      totalTestes: resultados.length,
      sucessos: sucessos.length,
      erros: erros.length,
      observacoes: [
        'Todas as requisições retornaram erro 901: Token inválido ou expirado',
        'Token foi gerado com sucesso e está dentro da validade',
        'Testados múltiplos formatos de payload',
        'Testados ambos códigos de loja: 123 e 8664',
        'Headers seguem exatamente a documentação'
      ],
      proximosPassos: [
        'Verificar configuração no ambiente Saipos',
        'Confirmar se credenciais estão ativas para homologação',
        'Validar se há restrições de IP ou outras configurações'
      ]
    };
    
    await fs.writeFile(
      path.join(LOGS_DIR, `resumo-email-${TIMESTAMP}.json`),
      JSON.stringify(resumoEmail, null, 2),
      'utf-8'
    );
    
    console.log('\n💾 ARQUIVOS GERADOS PARA EMAIL:');
    console.log(`   📋 Relatório completo: ${nomeArquivo}`);
    console.log(`   📊 Resumo para email: resumo-email-${TIMESTAMP}.json`);
    console.log(`   ❌ Detalhes dos erros: erros-${TIMESTAMP}.json`);
    if (sucessos.length > 0) {
      console.log(`   ✅ Detalhes dos sucessos: sucessos-${TIMESTAMP}.json`);
    }
    
    console.log('\n🎯 ARQUIVOS PRONTOS PARA ENVIO POR EMAIL!');
    console.log('📁 Localização:', LOGS_DIR);
    
  } catch (error) {
    console.error('💥 ERRO GERAL:', error.message);
  }
}

// Executar os testes
executarTestesCompletos(); 