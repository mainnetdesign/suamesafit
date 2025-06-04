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
import {InteractiveHoverButton} from '~/components/magic-ui/ui/button';
// import {InteractiveHoverButton2} from '@/components/magicui/interactive-hover-button2';
// import { Card, CardContent } from "~/components/shad-cn/ui/card"

import limitedTimeOfferImage from '~/assets/limited-offer-image.png';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from '~/components/shad-cn/ui/carousel';
import {TestimonialsSection} from '~/components/Testimonials/TestimonialsSection';
import type {TestimonialData} from '~/components/Testimonials/TestimonialCard';
import {FALLBACK_TESTIMONIALS} from '~/data/fallback-testimonials';
import {LimitedTimeOffer} from '~/components/LimitedTimeOffer';
import {useCursorColor} from '~/components/shad-cn/ui/CursorContext';
import {AboutUs} from '~/components/custom/AboutUs';
import * as Button from '~/components/align-ui/ui/button';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

// Fragmento e query para buscar produtos da coleção
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

const COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query CollectionProducts(
    $handle: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          ...ProductItem
        }
      }
    }
  }
` as const;

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront} = args.context;

  // Buscar os produtos da coleção Summer Collection
  const summerCollection = await storefront.query(COLLECTION_PRODUCTS_QUERY, {
    variables: {handle: 'summer-collection', first: 4},
  });

  // Fetch testimonials
  const {shop} = await storefront.query(SHOP_TESTIMONIALS_QUERY);
  const testimonials = JSON.parse(
    shop.testimonials?.value || JSON.stringify(FALLBACK_TESTIMONIALS),
  ) as TestimonialData[];

  return {
    ...deferredData,
    ...criticalData,
    testimonials,
    summerProducts: summerCollection.collection?.products?.nodes ?? [],
  };
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
  const {testimonials} = useLoaderData<typeof loader>();
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home">
      {/* <HomeBanner /> */}
      <FeaturedCollections
        collections={data.featuredCollections}
        summerProducts={data.summerProducts}
      />
      <RecommendedProducts products={data.recommendedProducts} />
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}
      <AboutUs />

      <LimitedTimeOffer
        title="oferta por tempo limitado"
        description="aproveite as próximas horas para garantir marmitas saudáveis com preços especiais nos nossos sabores mais vendidos."
        buttonText="peça agora"
        buttonLink="/collections/limited-offer"
        imageUrl={limitedTimeOfferImage}
        deadline="2025-05-01T23:59:59"
      />

      <div className="w-full flex justify-center items-center">
        <div className="max-w-[1200px] w-full flex justify-center items-center">
          <div className="w-full flex justify-between items-center gap-4">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-title-h4 text-text-sub-600">
                pratos em destaque
              </h3>
            </div>
            <Button.Root variant="primary" mode="filled" size="medium">
              abrir pratos
            </Button.Root>
          </div>
        </div>
      </div>

      <SummerProductsGallery products={data.summerProducts} />
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
  summerProducts,
}: {
  collections: FeaturedCollectionFragment[];
  summerProducts: any[];
}) {
  const {setColor, setBorderColor} = useCursorColor();
  if (!collections?.length) return null;

  return (
    <div
      className="featured-collections bg-[#FAF6EC] py-[72px] gap-10 md:gap-12 lg:gap-20 flex flex-col text-white box-border"
      onMouseEnter={() => {
        setColor('#1B4332');
        setBorderColor('white');
      }}
      onMouseLeave={() => {
        setColor('black');
        setBorderColor('#303172');
      }}
    >
      <div className="w-full flex justify-center items-center">
        <div className="w-full max-w-[1200px] relative rounded-3xl inline-flex flex-col justify-center items-center overflow-hidden">
          <img
            className="z-10 absolute  object-cover w-full h-full"
            src="public/images/hero1.png"
          />
          <div className="z-20 self-stretch h-[461px] p-8 bg-[radial-gradient(ellipse_59.86%_167.30%_at_13.09%_92.08%,_#3D724A_15%,_rgba(61,_114,_74.04,_0.15)_60%,_rgba(61,_114,_74,_0)_100%)] flex flex-col justify-end items-start gap-5">
            <div className="max-w-[416px] text-text-white-0 text-title-h3">
              refeições saudáveis, frescas e deliciosas.
            </div>
            <div className="max-w-[416px] text-text-white-0 text-body-sm leading-normal">
              Monte seu cardápio ou escolha um plano semanal. Receba refeições
              equilibradas, práticas e deliciosas onde estiver.
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        <div className="max-w-[1200px] w-full flex justify-center items-center">
          <div className="w-full flex justify-between items-center gap-4">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-title-h4 text-text-sub-600">
                pratos em destaque
              </h3>
            </div>
            <Button.Root variant="primary" mode="filled" size="medium">
              abrir pratos
            </Button.Root>
          </div>
        </div>
        <SummerProductsGallery products={summerProducts} />
      </div>

      <div className="w-full flex flex-col justify-center items-center">
        <div className="bg-green-700 max-w-[1200px] w-full p-8 gap-8 flex flex-col mx-auto rounded-3xl">
          <div className="align-center text-center flex items-center flex-col ">
            <div className="text-label-lg">
              categorias
            </div>
            <h4 className="text-title-h4">
              encontre sua refeição ideal
            </h4>
          </div>
          <div className="relative">
            <Carousel className="w-full max-w-[964px] mx-auto">
              <CarouselContent className="min-h-[524px]">
                {collections.map((collection) => (
                  <CarouselItem key={collection.id} className="md:basis-full">
                    <div className="p-1">
                      <div className="flex flex-col md:flex-row bg-transparent rounded-lg overflow-hidden gap-4 h-fit">
                        <div className="min-h-[524px] flex-1 max-w-[424px] bg-yellow-50 rounded-lg p-8 flex flex-col justify-between">
                          <div className="flex flex-col justify-between items-start h-full">
                            <h3 className="text-[2.5rem] font-medium text-text-sub-600 mb-4 font-serif">
                              {collection.title}
                            </h3>
                            <p className="text-base text-gray-600">
                            {collection.description}
                            </p>
                          </div>
                          <InteractiveHoverButton className="mt-8 bg-green-700 hover:bg-green-600 text-text-white-0 interactive-hover-button w-fit">
                            <Link to={`/collections/${collection.handle}`}>
                              ver opções
                            </Link>
                          </InteractiveHoverButton>
                          
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
    description
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

const SHOP_TESTIMONIALS_QUERY = `#graphql
  query GetTestimonials {
    shop {
      testimonials: metafield(namespace: "custom", key: "testimonials") {
        value
      }
    }
  }
`;

// Componente para galeria de produtos da Summer Collection
function SummerProductsGallery({products}: {products: any[]}) {
  if (!products?.length) return null;
  return (
    <div className="max-w-[1200px] w-full px-8 mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            className="product-item bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            to={`/products/${product.handle}`}
          >
            {product.featuredImage && (
              <div className="aspect-square">
                <Image
                  alt={product.featuredImage.altText || product.title}
                  aspectRatio="1/1"
                  data={product.featuredImage}
                  loading="lazy"
                  sizes="(min-width: 45em) 400px, 100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h4 className="text-text-sub-600 font-medium mb-2">
                {product.title}
              </h4>
              <small>
                <Money data={product.priceRange.minVariantPrice} />
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
