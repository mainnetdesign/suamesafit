# Tabela Nutricional Dinâmica

Este projeto implementa uma tabela nutricional dinâmica que utiliza metafields do Shopify para armazenar e exibir informações nutricionais dos produtos.

## Como Funciona

A solução utiliza **metafields do Shopify** do tipo JSON para armazenar informações nutricionais estruturadas. Os dados são buscados via GraphQL e renderizados dinamicamente no frontend.

### 🎯 **NOVO SISTEMA: Baseado em Índices**

O sistema agora usa **índices (0, 1, 2...)** ao invés de nomes específicos das variantes. Isso torna o sistema mais genérico e funciona para qualquer produto.

### Estrutura de Dados

O metafield `nutritional_info` no namespace `custom` armazena um objeto JSON com a seguinte estrutura:

```json
{
  "variants": {
    "0": {
      "porcao": {
        "tamanho": "300",
        "unidade": "g"
      },
      "valorEnergetico": {
        "quantidade": 435,
        "unidade": "kcal"
      },
      "carboidratos": {
        "quantidade": 32,
        "unidade": "g"
      },
      "proteinas": {
        "quantidade": 26,
        "unidade": "g"
      },
      "gordurasTotais": {
        "quantidade": 18,
        "unidade": "g"
      },
      "fibras": {
        "quantidade": 6,
        "unidade": "g"
      },
      "sodio": {
        "quantidade": 420,
        "unidade": "mg"
      }
    },
    "1": {
      "porcao": {
        "tamanho": "340",
        "unidade": "g"
      },
      "valorEnergetico": {
        "quantidade": 525,
        "unidade": "kcal"
      },
      "carboidratos": {
        "quantidade": 32,
        "unidade": "g"
      },
      "proteinas": {
        "quantidade": 34,
        "unidade": "g"
      },
      "gordurasTotais": {
        "quantidade": 24,
        "unidade": "g"
      },
      "fibras": {
        "quantidade": 6,
        "unidade": "g"
      },
      "sodio": {
        "quantidade": 500,
        "unidade": "mg"
      }
    }
  }
}
```

### Campos Suportados

#### Campos Obrigatórios
- `valorEnergetico` - Valor energético (kcal ou kJ)
- `carboidratos` - Carboidratos totais
- `proteinas` - Proteínas
- `gordurasTotais` - Gorduras totais
- `fibras` - Fibras alimentares
- `sodio` - Sódio

#### Campos Opcionais
- `porcao` - Informação sobre o tamanho da porção
- `acucares` - Açúcares
- `gordurasSaturadas` - Gorduras saturadas
- `gordurasTrans` - Gorduras trans
- `calcio` - Cálcio
- `ferro` - Ferro
- `vitaminaA` - Vitamina A
- `vitaminaC` - Vitamina C

Cada campo nutricional deve ter:
- `quantidade` (obrigatório) - Valor numérico
- `unidade` (opcional) - Unidade de medida (g, mg, kcal, etc.)
- `vd` (opcional) - Percentual do valor diário (%VD)

## Configuração no Shopify Admin

### 1. Criar Definição do Metafield

1. No Shopify Admin, vá para **Configurações > Metafields**
2. Clique em **Adicionar definição**
3. Configure:
   - **Namespace**: `custom`
   - **Key**: `nutritional_info`
   - **Nome**: `Informações Nutricionais`
   - **Tipo**: `JSON`
   - **Descrição**: `Dados nutricionais estruturados do produto`

### 2. Configurar Visibilidade no Storefront

Para que os dados sejam acessíveis via Storefront API:

1. Vá para **Configurações > Metafields**
2. Encontre a definição criada
3. Em **Acesso ao Storefront**, marque **Expor via Storefront API**

### 3. Adicionar Dados aos Produtos

1. Edite um produto no Admin
2. Na seção **Metafields**, encontre "Informações Nutricionais"
3. Adicione os dados JSON seguindo a estrutura exemplo

## Estrutura do Código

### Componentes

#### `NutritionalTable.tsx`
- Componente principal que renderiza a tabela nutricional
- Inclui interface TypeScript para os dados
- Função helper para parse dos dados JSON

#### Uso no Produto
```tsx
// Parse dos dados nutricionais
const nutritionalData = parseNutritionalData(product.nutritionalInfo?.value);

// Renderização
<NutritionalTable nutritionalInfo={nutritionalData} />
```

### GraphQL

O fragmento de produto foi atualizado para incluir:

```graphql
nutritionalInfo: metafield(namespace: "custom", key: "nutritional_info") {
  value
}
```

## Funcionalidades

### Exibição Dinâmica
- Só exibe campos que contêm dados
- Formatação automática de valores numéricos
- Suporte a %VD (Valor Diário)
- Seção expansível/retrátil

### Fallbacks
- Exibe "***" para dados não disponíveis
- Exibe "**" para %VD não estabelecido
- Não renderiza o componente se não há dados nutricionais

### Acessibilidade
- Estrutura de tabela semântica
- Cores contrastantes
- Texto explicativo sobre valores diários

## Exemplo de Dados Completos

```json
{
  "porcao": {
    "tamanho": "150",
    "unidade": "g"
  },
  "valorEnergetico": {
    "quantidade": 180,
    "unidade": "kcal",
    "vd": 9
  },
  "carboidratos": {
    "quantidade": 25,
    "unidade": "g",
    "vd": 8
  },
  "acucares": {
    "quantidade": 3,
    "unidade": "g"
  },
  "proteinas": {
    "quantidade": 22,
    "unidade": "g",
    "vd": 29
  },
  "gordurasTotais": {
    "quantidade": 4,
    "unidade": "g",
    "vd": 7
  },
  "gordurasSaturadas": {
    "quantidade": 1.2,
    "unidade": "g",
    "vd": 5
  },
  "gordurasTrans": {
    "quantidade": 0,
    "unidade": "g"
  },
  "fibras": {
    "quantidade": 8,
    "unidade": "g",
    "vd": 32
  },
  "sodio": {
    "quantidade": 0.8,
    "unidade": "g",
    "vd": 33
  },
  "calcio": {
    "quantidade": 120,
    "unidade": "mg",
    "vd": 12
  },
  "ferro": {
    "quantidade": 2.1,
    "unidade": "mg",
    "vd": 15
  },
  "vitaminaA": {
    "quantidade": 300,
    "unidade": "mcg",
    "vd": 33
  },
  "vitaminaC": {
    "quantidade": 15,
    "unidade": "mg",
    "vd": 33
  }
}
```

## Benefícios

### Para Desenvolvedores
- Código reutilizável e modular
- TypeScript para type-safety
- Fácil manutenção e extensão
- Integração nativa com Shopify

### Para Administradores
- Interface amigável no Shopify Admin
- Dados estruturados e validados
- Flexibilidade para diferentes tipos de produtos
- Atualizações sem necessidade de deploy

### Para Usuários
- Informações nutricionais sempre atualizadas
- Layout responsivo e acessível
- Carregamento rápido
- Experiência consistente

## Extensões Futuras

- Validação automática de dados nutricionais
- Cálculo automático de %VD baseado em diferentes dietas
- Comparação nutricional entre produtos
- Integração com APIs de bases de dados nutricionais
- Suporte a diferentes idiomas/regiões

## Troubleshooting

### Tabela não aparece
- Verifique se o metafield está configurado corretamente
- Confirme se os dados JSON estão válidos
- Verifique se o produto tem dados nutricionais

### Dados não carregam
- Confirme a visibilidade no Storefront API
- Verifique o namespace e key do metafield
- Teste o GraphQL query diretamente

### Formatação incorreta
- Valide a estrutura JSON dos dados
- Verifique os tipos de dados (números vs strings)
- Confirme as unidades de medida 