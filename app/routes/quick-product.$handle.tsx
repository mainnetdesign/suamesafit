import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getSelectedProductOptions} from '@shopify/hydrogen';

// Função auxiliar para validar dados do produto
function validateProductData(product: any) {
  if (!product || !product.id) {
    return false;
  }
  // Validações básicas
  if (!product.title || !product.handle) {
    return false;
  }
  return true;
}

export async function loader({context, params, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Response('Handle não informado', {status: 400, statusText: 'Bad Request'});
  }

  try {
    const selectedOptions = getSelectedProductOptions(request);
    
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions,
      },
    });

    if (!validateProductData(product)) {
      throw new Response('Produto não encontrado', {status: 404, statusText: 'Not Found'});
    }

    return json({product});
  } catch (error: any) {
    console.error(`Erro no loader do quick-product para o handle "${handle}":`, error);

    // Se o erro for uma resposta, repassa. Senão, cria uma nova resposta de erro.
    if (error instanceof Response) {
      throw error;
    }
    
    throw new Response('Erro ao carregar o produto', {status: 500, statusText: 'Internal Server Error'});
  }
}

// Reaproveitamos o mesmo fragmento utilizado na página de produto para garantir consistência.
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment QuickProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment QuickProduct on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    nutritionalInfo: metafield(namespace: "custom", key: "nutritional_info") {
      value
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...QuickProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...QuickProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...QuickProductVariant
    }
    seo {
      description
      title
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 10) {
      nodes {
        ...QuickProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query QuickProduct(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...QuickProduct
    }
  }
  ${PRODUCT_FRAGMENT}
` as const; 