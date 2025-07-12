import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {
  getPaginationVariables,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import { CollectionHeader } from '~/components/collections/CollectionHeader';
import { CollectionTab } from '~/components/collections/CollectionTab';
import { Product } from '~/components/ProductCard';
import collectionsImage from '~/assets/collections/all.jpg';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Sua Mesa Fit | ${data?.collection.title ?? ''} Collection`}];
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
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 100,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}, {collections}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
    storefront.query(COLLECTIONS_QUERY),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  return {
    collection,
    collections,
  };
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
  const {collection, collections} = useLoaderData<typeof loader>();

  return (
    <div className="collection items-center justify-start flex flex-col">
      <CollectionHeader 
        title={collection.title}
        description={collection.description} 
        image={collection.image?.url || collectionsImage} 
      />
      <div className="w-full px-4 max-w-[1200px] items-center justify-center">
        <CollectionTab categories={collections.nodes} />
      </div>
      
      <div className="max-w-[1200px] w-full items-center justify-center px-4">
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {collection.products.nodes.map((product: ProductItemFragment) => (
            <Product
              key={product.id}
              product={{
                id: product.id,
                handle: product.handle,
                title: product.title,
                featuredImage: product.featuredImage ? {
                  altText: product.featuredImage.altText || undefined,
                  url: product.featuredImage.url,
                  width: product.featuredImage.width || 0,
                  height: product.featuredImage.height || 0,
                } : undefined,
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
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
      
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
  fragment CollectionHandleMoneyItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionHandleProductItem on Product {
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
        ...CollectionHandleMoneyItem
      }
      maxVariantPrice {
        ...CollectionHandleMoneyItem
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
      }
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...CollectionHandleProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
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
