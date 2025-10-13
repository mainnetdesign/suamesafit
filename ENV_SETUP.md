# 🔑 Configuração de Variáveis de Ambiente

## Desenvolvimento Local

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```bash
# Chave API AwesomeAPI para consulta de CEP com coordenadas
AWESOME_API_KEY=98b6e5084349f65c7dddb70cfbc5806eb50d9038c028e857d8fc74ed60dad02b
```

## Produção (Shopify Oxygen)

### Via CLI da Shopify:

```bash
# Adicionar a variável de ambiente
shopify hydrogen env set AWESOME_API_KEY=98b6e5084349f65c7dddb70cfbc5806eb50d9038c028e857d8fc74ed60dad02b
```

### Via Painel da Shopify:

1. Vá em **Settings** > **Hydrogen** > **Environment Variables**
2. Clique em **Add variable**
3. Nome: `AWESOME_API_KEY`
4. Valor: `98b6e5084349f65c7dddb70cfbc5806eb50d9038c028e857d8fc74ed60dad02b`
5. Clique em **Save**

## Verificação

Após configurar, a API de shipping mostrará nos logs:

```
🔑 AwesomeAPI: Usando chave API (98b6e508...)
```

Se não configurado, mostrará:

```
⚠️ AwesomeAPI: Sem chave API configurada
```

## Benefícios da Chave API

- ✅ **Evita rate limiting** (erro HTTP 429)
- ✅ **Maior limite de requisições**
- ✅ **Coordenadas precisas** (latitude e longitude)
- ✅ **Melhor confiabilidade**

## APIs com Fallback

O sistema usa múltiplas APIs com fallback automático:

1. **AwesomeAPI** (com chave) - Coordenadas precisas
2. **OpenCEP** - Fallback 1
3. **BrasilAPI** - Fallback 2
4. **ViaCEP** + Geocoding - Fallback 3

