import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import type {CatalogQueryVariables} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionHeader} from '~/components/collections/CollectionHeader';
import {CollectionTab} from '~/components/collections/CollectionTab';
import {CollectionFilters} from '~/components/collections/CollectionFilters';
import {Product} from '~/components/ProductCard';
import collectionsImage from '~/assets/collections/all.jpg';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Sua Mesa Fit | Cardápio`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const query = searchParams.get('q') || '';
  const sortKey = searchParams.get('sort') || 'TITLE';
  const reverse = sortKey.includes('desc');

  const paginationVariables = getPaginationVariables(request, {
    pageBy: 100,
  });

  // Função para validar e converter o sortKey
  function getValidSortKey(key: string): NonNullable<CatalogQueryVariables['sortKey']> {
    const validKeys = ['TITLE', 'PRICE', 'BEST_SELLING', 'CREATED_AT', 'ID', 'MANUAL', 'RELEVANCE'] as const;
    const upperKey = key.split('-')[0].toUpperCase();
    return validKeys.includes(upperKey as any) ? upperKey as NonNullable<CatalogQueryVariables['sortKey']> : 'TITLE';
  }

  const [{products}, {collections}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        query,
        sortKey: getValidSortKey(sortKey),
        reverse,
      },
    }),
    storefront.query(COLLECTIONS_QUERY),
  ]);
  return {products, collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

// IDs das variantes de frete que devem ser filtradas
const SHIPPING_VARIANT_IDS = [
  'gid://shopify/ProductVariant/43101752295493',
  'gid://shopify/ProductVariant/43101752328261',
  'gid://shopify/ProductVariant/43101752361029',
  'gid://shopify/ProductVariant/43101752393797',
  'gid://shopify/ProductVariant/43101752426565',
  'gid://shopify/ProductVariant/43101752459333',
  'gid://shopify/ProductVariant/43101752492101',
  'gid://shopify/ProductVariant/43101752524869',
  'gid://shopify/ProductVariant/43101752557637',
  'gid://shopify/ProductVariant/43101752590405',
];

// Função para verificar se um produto é de frete
function isShippingProduct(product: any): boolean {
  // Verifica se o título do produto é "Frete São Paulo"
  if (product.title === "Frete São Paulo") {
    return true;
  }
  
  // Verifica se o produto tem a tag "frete"
  if (product.tags && Array.isArray(product.tags)) {
    return product.tags.some((tag: string) => tag.toLowerCase() === "frete");
  }
  
  return false;
}

export default function Collection() {
  const {products, collections} = useLoaderData<typeof loader>();

  // Filtra produtos de frete
  const filteredProducts = products.nodes.filter((product: any) => 
    !isShippingProduct(product)
  );

  return (
    <div className="collection items-center justify-start flex flex-col">
      <CollectionHeader
        title="cardápio"
        description="sua próxima refeição saudável está aqui"
        image={collectionsImage}
      />

      <div className="w-full max-w-[1200px] px-4 items-center justify-center">
        <CollectionTab categories={collections.nodes} />
      </div>

      <div className="max-w-[1200px] w-full items-center justify-center px-4">
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product: any) => (
            <Product
              key={product.id}
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                featuredImage: product.featuredImage
                  ? {
                      altText: product.featuredImage.altText || undefined,
                      url: product.featuredImage.url,
                      width: product.featuredImage.width || 0,
                      height: product.featuredImage.height || 0,
                    }
                  : undefined,
                secondaryImage: (product as any).images?.nodes?.[1]
                  ? {
                      altText: (product as any).images.nodes[1].altText || undefined,
                      url: (product as any).images.nodes[1].url,
                      width: (product as any).images.nodes[1].width || 0,
                      height: (product as any).images.nodes[1].height || 0,
                    }
                  : undefined,
                priceRange: product.priceRange
                  ? {
                      minVariantPrice: product.priceRange.minVariantPrice,
                    }
                  : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: any;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment AllCollectionsMoneyItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment AllCollectionsProductItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        ...AllCollectionsMoneyItem
      }
      maxVariantPrice {
        ...AllCollectionsMoneyItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      query: $query,
      sortKey: $sortKey,
      reverse: $reverse
    ) {
      nodes {
        ...AllCollectionsProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;

const COLLECTIONS_QUERY = `#graphql
  query Collections {
    collections(first: 10) {
      nodes {
        id
        title
        handle
      }
    }
  }
` as const;
