import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {DatepickerRangeDemo} from '~/components/daterange';
// import Carousel from '~/components/react-bits/ui/Carousel/Carousel';

// import { Card, CardContent } from "~/components/shad-cn/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/shad-cn/ui/carousel';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
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
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

function HomeBanner() {
  return (
    <div className="items-center grow flex relative">
      <div className="flex text-center items-center flex-col w-full relative mx-auto px-8 box-border z-[3] gap-[1.6rem]">
        <div className="gap-10 flex flex-col items-center box-border">
          <div className="break-words	m-0 block text-center">
            Enjoy refreshing, natural drinks made from the finest ingredients.
          </div>
          <a href=".">Shop now</a>
        </div>
      </div>
      <div className="">
        {/* <img src="../assets/tearo-pink.webp" alt="img1" />
        <img src="" alt="" /> */}
      </div>
    </div>
  );
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <HomeBanner />
      <FeaturedCollection collection={data.featuredCollection} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment;
}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image data={image} sizes="100vw" />
        </div>
      )}
      <h1 className="">{collection.title}</h1>
    </Link>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products bg-green-700 py-[7.2rem] gap-[5.6rem] flex flex-col text-text-white-0 box-border">
      <div className="max-w-full w-full px-8 mx-auto box-border">
        <div className="align-center mx-auto text-center flex items-center flex-col">
          <div className="uppercase mx-auto font-medium tracking-[0.08em] text-label-lg break-words	max-w-2xl	">
            Features
          </div>
          <h2 className="my-7 mx-auto inline-block max-w-2xl m-0 break-words text-title-h1">
            Sustainable sips with real benefits
          </h2>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) =>
            response ? (
              <div className="relative">
                <Carousel className="w-full max-w-xs mx-auto">
                  <CarouselContent>
                    {response.products.nodes.map((product) => (
                      <CarouselItem key={product.id}>
                        <div className="p-1">
                          <Link
                            key={product.id}
                            className="recommended-product"
                            to={`/products/${product.handle}`}
                          >
                            <Image
                              data={product.images.nodes[0]}
                              aspectRatio="1/1"
                              sizes="(min-width: 45em) 20vw, 50vw"
                            />
                            <div className="p-1">
                              <h4 className="text-white">{product.title}</h4>
                              <small className="text-white">
                                <Money
                                  data={product.priceRange.minVariantPrice}
                                />
                              </small>
                            </div>
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ) : null
          }
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
