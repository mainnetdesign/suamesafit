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
import {InteractiveHoverButton} from '~/components/magic-ui/button';
// import {InteractiveHoverButton2} from '@/components/magicui/interactive-hover-button2';
// import { Card, CardContent } from "~/components/shad-cn/ui/card"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
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
    featuredCollections: collections.nodes,
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
      {/* <HomeBanner /> */}
      <div className="flex items-center justify-center mb-6">
        <InteractiveHoverButton className="bg-primary-base hover:bg-primary-base-hover text-[#423515] interactive-hover-button">
          Shop now
        </InteractiveHoverButton>
      </div>

      <FeaturedCollections collections={data.featuredCollections} />
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

// function FeaturedCollection({
//   collection,
// }: {
//   collection: FeaturedCollectionFragment;
// }) {
//   if (!collection) return null;
//   const image = collection?.image;
//   return (
//     <Link
//       className="featured-collection"
//       to={`/collections/${collection.handle}`}
//     >
//       {image && (
//         <div className="featured-collection-image">
//           <Image data={image} sizes="100vw" />
//         </div>
//       )}
//       <h1 className="">{collection.title}</h1>
//     </Link>
//   );
// }

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
                            className="recommended-product w-full"
                            to={`/products/${product.handle}`}
                          >
                            <Image
                              data={product.images.nodes[0]}
                              aspectRatio="1/1"
                              sizes="(min-width: 45em) 20vw, 50vw"
                            />
                            <div className="px-2 bg-gray-700 rouded-br rounded-b-lg">
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

function FeaturedCollections({
  collections,
}: {
  collections: FeaturedCollectionFragment[];
}) {
  if (!collections?.length) return null;

  return (
    <div className="featured-collections bg-[#1B4332] py-[72px] gap-10 md:gap-12 lg:gap-20 flex flex-col text-white box-border">
      <div className="max-w-full w-full px-8 mx-auto box-border">
        <div className="align-center mx-auto text-center flex items-center flex-col ">
          <div className="uppercase mx-auto font-medium tracking-[0.08em] text-label-xs break-words max-w-2xl">
            Features
          </div>
          <h4 className="font-serif text-title-h4 max-w-[416px] mt-4 mx-auto inline-block break-words">
            Sustainable sips with real benefits
          </h4>
        </div>
      </div>

      <div className="relative">
        <Carousel className="w-full max-w-[964px] mx-auto">
          <CarouselContent className="min-h-[524px]">
            {collections.map((collection) => (
              <CarouselItem key={collection.id} className="md:basis-full">
                <div className="p-1">
                  <div className="flex flex-col md:flex-row bg-transparent rounded-lg overflow-hidden gap-4 h-fit">
                    <div className="min-h-[524px] flex-1 max-w-[424px] bg-white rounded-lg p-8 flex flex-col justify-between">
                      <div className="flex flex-col justify-between items-start h-full">
                        <h3 className="text-[2.5rem] font-medium text-[#423515] mb-4 font-serif">
                          {collection.title}
                        </h3>
                        <p className="text-base text-gray-600">
                          Made with non-GMO ingredients for a drink that&apos;s
                          as close to nature as it gets, delivering clean, pure
                          flavors you can trust.
                        </p>
                      </div>
                      <InteractiveHoverButton className="mt-8 bg-primary-base hover:bg-primary-base-hover text-[#423515] interactive-hover-button w-fit">
                        <Link to={`/collections/${collection.handle}`}>
                          Shop now
                        </Link>
                      </InteractiveHoverButton>
                      {/* <Link 
                        to={`/collections/${collection.handle}`}
                        className=" text-base font-medium bg-[#FCE762] text-[#423515] px-6 py-3 rounded-full inline-flex items-center gap-2 hover:bg-[#fce762]/90 transition-colors w-fit"
                      >
                        Shop now
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link> */}
                    </div>
                    {collection.image && (
                      <div className="flex-1 max-w-[524px] featured-collection-image rounded-lg overflow-hidden h-full min-h-[400] md:min-h-[524px]">
                        <Image
                          data={collection.image}
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className="w-left-0 md:-left-16 lg:-left-24 text-white"
            iconSize={48}
          />
          <CarouselNext
            className="w-9 h-9 right-0 md:-right-16 lg:-right-24 text-white"
            iconSize={48}
          />
          <CarouselDots />
        </Carousel>
      </div>
    </div>
  );
}

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
    collections(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;
