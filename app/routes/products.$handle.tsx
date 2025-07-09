import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {Root as Divider} from '~/components/align-ui/ui/divider';
import * as Button from '~/components/align-ui/ui/button';
import React from 'react';
import {RiArrowDownSLine, RiArrowUpSLine} from 'react-icons/ri';
import {Product as ProductCard} from '~/components/ProductCard';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {
  NutritionalTable,
  parseNutritionalData,
} from '~/components/NutritionalTable';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product?.title ?? 'Produto'}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product?.handle ?? ''}`,
    },
  ];
};

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

// Função para buscar produtos relacionados com tratamento de erro
async function fetchRelatedProducts(storefront: any, product: any) {
  try {
    if (!product?.collections?.nodes?.length) {
      return [];
    }
    
    const collectionHandle = product.collections.nodes[0].handle;
    if (!collectionHandle) {
      return [];
    }
    
    const result = await storefront.query(
      `#graphql
      fragment MoneyProductItem on MoneyV2 {
        amount
        currencyCode
      }
      fragment ProductItem on Product {
        id
        handle
        title
        featuredImage {
          altText
          url
          width
          height
        }
        priceRange {
          minVariantPrice {
            ...MoneyProductItem
          }
        }
      }
      query CollectionProducts($handle: String!, $first: Int) {
        collection(handle: $handle) {
          products(first: $first) {
            nodes {
              ...ProductItem
            }
          }
        }
      }
    `,
      {
        variables: {handle: collectionHandle, first: 8},
      },
    );
    
    return result?.collection?.products?.nodes
      ?.filter((p: any) => p?.id && p.id !== product.id)
      .slice(0, 4) || [];
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return [];
  }
}

export async function loader(args: LoaderFunctionArgs) {
  const {context, params, request} = args;
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  try {
    // Proteção contra erros de turbo-stream e outros
    const selectedOptions = getSelectedProductOptions(request);
    
    const [{product}] = await Promise.all([
      storefront.query(PRODUCT_QUERY, {
        variables: {handle, selectedOptions},
      }).catch((error: any) => {
        console.error('Erro na consulta do produto:', error);
        throw new Response('Produto não encontrado', {status: 404});
      }),
    ]);

    // Validação robusta dos dados do produto
    if (!validateProductData(product)) {
      throw new Response('Produto inválido', {status: 404});
    }

    // Buscar produtos relacionados com tratamento de erro
    const relatedProducts = await fetchRelatedProducts(storefront, product);

    return {
      product,
      relatedProducts,
    };
  } catch (error) {
    console.error('Erro no loader do produto:', error);
    
    // Se for um erro específico de turbo-stream, tentar recuperar
    if (error instanceof Error && error.message.includes('turbo-stream')) {
      console.warn('Erro de turbo-stream detectado, tentando recuperar...');
      
      // Tentar uma segunda vez sem as opções selecionadas
      try {
        const [{product}] = await Promise.all([
          storefront.query(PRODUCT_QUERY, {
            variables: {handle, selectedOptions: []},
          }),
        ]);
        
        if (validateProductData(product)) {
          const relatedProducts = await fetchRelatedProducts(storefront, product);
          return {
            product,
            relatedProducts,
          };
        }
      } catch (secondError) {
        console.error('Segunda tentativa falhou:', secondError);
      }
    }
    
    // Se chegou aqui, o produto realmente não existe ou há erro crítico
    throw new Response('Produto não encontrado', {status: 404});
  }
}

export default function Product() {
  const data = useLoaderData<typeof loader>();

  // Proteção contra dados inválidos
  if (!data?.product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h1 className="text-title-h3 text-text-sub-600 mb-4">
          Produto não encontrado
        </h1>
        <p className="text-paragraph-md text-text-sub-400">
          O produto que você está procurando não está disponível no momento.
        </p>
      </div>
    );
  }

  const {product, relatedProducts = []} = data;

  // Proteção adicional para variantes
  let selectedVariant;
  let productOptions;
  
  try {
    // Optimistically selects a variant with given available variant information
    selectedVariant = useOptimisticVariant(
      product.selectedOrFirstAvailableVariant,
      getAdjacentAndFirstAvailableVariants(product),
    );

    // Sets the search param to the selected variant without navigation
    // only when no search params are set in the url
    useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

    // Get the product options array
    productOptions = getProductOptions({
      ...product,
      selectedOrFirstAvailableVariant: selectedVariant,
    });
  } catch (error) {
    console.error('Erro ao processar variantes:', error);
    // Fallback para primeira variante disponível
    selectedVariant = product.selectedOrFirstAvailableVariant || product.variants?.nodes?.[0];
    productOptions = product.options || [];
  }

  const {title, descriptionHtml} = product;
  const [showDescription, setShowDescription] = React.useState(true);

  // Calcular o índice da variante selecionada com proteção
  const selectedVariantIndex = React.useMemo(() => {
    try {
      if (!selectedVariant || !product.options || product.options.length === 0) {
        return 0; // Default para primeira variante
      }

      // Encontrar o índice baseado nas opções selecionadas
      const sizeOption = product.options.find(
        (option: any) =>
          option?.name?.toLowerCase().includes('tamanho') ||
          option?.name?.toLowerCase().includes('size') ||
          option?.optionValues?.some((value: any) => value?.name?.includes('g')),
      );

      if (sizeOption) {
        const selectedOptionValue = selectedVariant.selectedOptions?.find(
          (opt: any) => opt.name === sizeOption.name,
        );

        if (selectedOptionValue) {
          const index = sizeOption.optionValues.findIndex(
            (value: any) => value.name === selectedOptionValue.value,
          );
          return index >= 0 ? index : 0;
        }
      }

      return 0;
    } catch (error) {
      console.error('Erro ao calcular índice da variante:', error);
      return 0;
    }
  }, [selectedVariant, product.options]);

  // Parse dos dados nutricionais do metafield com proteção
  let nutritionalData = null;
  try {
    nutritionalData = parseNutritionalData(
      product.nutritionalInfo?.value,
      selectedVariantIndex,
    );
  } catch (error) {
    console.error('Erro ao parsear dados nutricionais:', error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="w-full md:pt-[100px] flex justify-center items-center">
        <div className="max-w-[1200px] px-4 w-full flex flex-col md:flex-row gap-8 justify-center items-start">
          <ProductImage
            className=""
            images={
              product.images?.nodes?.filter((img: {id: string}) => !!img.id) || []
            }
          />
          <div className="flex flex-col gap-8 max-w-[400px]">
            <div className="flex flex-col gap-4">
              <h3 className="text-text-sub-600 text-title-h3">{title}</h3>
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>

            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
            
            <div className="flex flex-col gap-2 text-paragraph-md">
              <div className="flex items-center gap-4 justify-between">
                <p className="text-text-sub-600 text-title-h5 mb-0">
                  descrição
                </p>
                <Button.Root
                  variant="primary"
                  mode="lighter"
                  size="xsmall"
                  onClick={() => setShowDescription((prev) => !prev)}
                  className="w-fit"
                >
                  {showDescription ? (
                    <Button.Icon as={RiArrowDownSLine} />
                  ) : (
                    <Button.Icon as={RiArrowUpSLine} />
                  )}
                </Button.Root>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${showDescription ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                {showDescription && descriptionHtml && (
                  <div
                    className="text-text-sub-600"
                    dangerouslySetInnerHTML={{__html: descriptionHtml}}
                  />
                )}
              </div>
            </div>
            
            {/* Tabela Nutricional Dinâmica */}
            {nutritionalData && (
              <NutritionalTable
                nutritionalInfo={nutritionalData}
                selectedVariantIndex={selectedVariantIndex}
              />
            )}
          </div>
          
          {/* Analytics só se tiver dados válidos */}
          {selectedVariant && (
            <Analytics.ProductView
              data={{
                products: [
                  {
                    id: product.id,
                    title: product.title,
                    price: selectedVariant?.price?.amount || '0',
                    vendor: product.vendor || '',
                    variantId: selectedVariant?.id || '',
                    variantTitle: selectedVariant?.title || '',
                    quantity: 1,
                  },
                ],
              }}
            />
          )}
        </div>
      </div>

      {/* Produtos relacionados */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="w-full flex justify-center items-center px-4">
          <div className="max-w-[1200px] w-full flex flex-col justify-center items-center mt-12">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-title-h3 text-text-sub-600 mb-6">
                você também pode gostar
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1200px]">
              {relatedProducts.map(
                (product: {
                  id: string;
                  handle: string;
                  title: string;
                  featuredImage?: {
                    altText?: string | null;
                    url: string;
                    width?: number | null;
                    height?: number | null;
                  } | null;
                  priceRange?: {
                    minVariantPrice: MoneyV2;
                  };
                }) => (
                  <ProductCard key={product.id} product={product} />
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
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
  fragment Product on Product {
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
          ...ProductVariant
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
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
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
    collections(first: 1) {
      nodes {
        handle
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
