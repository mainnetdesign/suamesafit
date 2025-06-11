import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionHeader} from '~/components/collections/CollectionHeader';
import {CollectionTab} from '~/components/collections/CollectionTab';
import {CollectionFilters} from '~/components/collections/CollectionFilters';
import {Product} from '~/components/Product';
import collectionsImage from '~/assets/collections/all.jpg';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Hydrogen | Products`}];
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
    pageBy: 8,
  });

  const [{products}, {collections}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        query,
        sortKey: sortKey.split('-')[0].toUpperCase(),
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

export default function Collection() {
  const {products, collections} = useLoaderData<typeof loader>();

  return (
    <div className="collection items-center justify-start flex flex-col">
      <CollectionHeader
        title="nossos pratos fit"
        description="sua próxima refeição saudável está aqui"
        image={collectionsImage}
      />

      <div className="w-full max-w-[1200px] items-center justify-center">
        <CollectionTab categories={collections.nodes} />
      </div>

      <div className="max-w-[1200px] w-full items-center justify-center px-4">
        <PaginatedResourceSection
          connection={products}
          resourcesClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {({
            node: product,
            index,
          }: {
            node: ProductItemFragment;
            index: number;
          }) => (
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
                priceRange: product.priceRange
                  ? {
                      minVariantPrice: product.priceRange.minVariantPrice,
                    }
                  : undefined,
              }}
            />
          )}
        </PaginatedResourceSection>
      </div>
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
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
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
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
        ...ProductItem
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
