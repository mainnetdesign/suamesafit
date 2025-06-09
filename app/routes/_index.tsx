import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {DatepickerRangeDemo} from '~/components/daterange';
import {InteractiveHoverButton} from '~/components/magic-ui/ui/button';

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
import * as Input from '~/components/align-ui/ui/input';
import * as Accordion from '~/components/align-ui/ui/accordion';

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

const HOMEPAGE_PRODUCTS_QUERY = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomeProductItem on Product {
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
    }
  }
  query HomepageProducts($first: Int = 8) {
    products(first: $first, sortKey: TITLE) {
      nodes {
        ...HomeProductItem
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

  // Buscar 8 produtos em ordem alfabética
  const homepageProducts = await storefront.query(HOMEPAGE_PRODUCTS_QUERY, {
    variables: { first: 8 },
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
    homepageProducts: homepageProducts.products.nodes,
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

export default function Homepage() {
  const {testimonials} = useLoaderData<typeof loader>();
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home bg-[#FAF6EC] py-[72px] gap-10 flex flex-col text-white box-border">
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
        <div className="max-w-[1200px] w-full flex flex-col gap-8 justify-center items-center">
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
          
        
          <HomepageProductsGrid products={data.homepageProducts} />
        </div>
        
      </div>

      <FeaturedCollections
        collections={data.featuredCollections}
        summerProducts={data.summerProducts}
      />
      
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      <AboutUs />

      {/* Seja um Parceiro */}
      {/* <div className="w-full flex flex-col justify-center items-center">
        <div className="max-w-[1200px] p-16 bg-green-700 rounded-3xl w-full flex flex-col justify-center items-center">
          <div className="w-full flex flex-col justify-center items-start">
            <h2 className="text-title-h2">seja um parceiro</h2>
            <p className="text-paragraph-lg text-text-white-0 mt-4">
              trabalhe conosco e ofereça marmitas personalizadas, saudáveis e
              saborosas para seus clientes.
            </p>
          </div>
        </div>
      </div> */}

      <div className="w-full flex flex-col justify-center items-center">
        <div className="max-w-[1200px] w-full flex gap-4 justify-center items-start">
          <div className="w-full flex flex-col justify-center items-start">
          <div className="text-label-lg bg-primary-base px-8 py-2 rounded-full">faq</div>
            <h2 className="text-title-h2 text-text-sub-600">perguntas frequentes</h2>
          </div>
          <div className="bg-orange-100 rounded-3xl w-full">
          <Accordion.Root type="single" collapsible className="">
            <Accordion.Item value="restricoes">
              <Accordion.Trigger>
                <Accordion.Arrow />
                Vocês atendem restrições alimentares e alergias?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Sim! Nossas marmitas são preparadas com atenção especial às restrições alimentares e alergias. 
                Oferecemos opções vegetarianas, veganas, sem glúten, sem lactose e outras adaptações conforme sua necessidade.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="personalizacao">
              <Accordion.Trigger>
                <Accordion.Arrow />
                Posso personalizar minha marmita?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Sim! Você pode personalizar sua marmita escolhendo entre diferentes opções de proteínas, 
                acompanhamentos e guarnições. Também oferecemos a possibilidade de montar seu próprio cardápio semanal.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="frescas">
              <Accordion.Trigger>
                <Accordion.Arrow />
                As marmitas chegam frescas ou congeladas?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Nossas marmitas são entregues frescas, preparadas no mesmo dia da entrega. 
                Elas são embaladas em recipientes térmicos para manter a temperatura ideal até chegarem em você.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="durabilidade">
              <Accordion.Trigger>
                <Accordion.Arrow />
                Quanto tempo as marmitas duram no freezer?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Nossas marmitas podem ser conservadas no freezer por até 30 dias, mantendo todo o sabor e qualidade. 
                Recomendamos consumir em até 3 dias quando mantidas na geladeira.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="conservantes">
              <Accordion.Trigger>
                <Accordion.Arrow />
                As marmitas contêm conservantes ou aditivos?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Não! Nossas marmitas são 100% naturais, sem conservantes ou aditivos químicos. 
                Utilizamos apenas ingredientes frescos e naturais para garantir uma alimentação saudável e saborosa.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="regioes">
              <Accordion.Trigger>
                <Accordion.Arrow />
                Para quais regiões vocês entregam?
              </Accordion.Trigger>
              <Accordion.Content className="pl-[30px]">
                Atualmente atendemos toda a região metropolitana de São Paulo, incluindo Zona Sul, 
                Zona Norte, Zona Leste, Zona Oeste e Grande São Paulo. Entre em contato para verificar 
                a disponibilidade na sua região.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
          </div>
          
        </div>
      </div>

      
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
    <div className="featured-collections flex flex-col gap-10">
      

      <div className="w-full flex flex-col justify-center items-center">
        <div className="bg-green-700 max-w-[1200px] w-full p-16 gap-8 flex flex-col mx-auto rounded-3xl">
          <div className="align-center text-center flex items-center flex-col ">
            <div className="text-label-lg">categorias</div>
            <h4 className="text-title-h4">encontre sua refeição ideal</h4>
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
                            <h3 className="text-[2.5rem] lowercase font-medium text-text-sub-600 mb-4 font-serif">
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
        <LimitedTimeOffer
          title="oferta por tempo limitado"
          description="aproveite as próximas horas para garantir marmitas saudáveis com preços especiais nos nossos sabores mais vendidos."
          buttonText="peça agora"
          buttonLink="/collections/limited-offer"
          imageUrl={limitedTimeOfferImage}
          deadline="2025-06-30T23:59:59"
        />
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
    collections(first: 7, sortKey: UPDATED_AT, reverse: true) {
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

// Componente para grid de produtos na home
function HomepageProductsGrid({ products }: { products: any[] }) {
  if (!products?.length) return null;
  return (
    <div className="">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="product-item rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <Link
              className="block"
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
                <h4 className="text-text-sub-600 text-label-lg mb-2">
                  {product.title}
                </h4>
                {product.priceRange?.minVariantPrice && (
                  <small className="text-paragraph-md text-text-sub-600">
                    <Money data={product.priceRange.minVariantPrice} />
                  </small>
                )}
              </div>
            </Link>
            <div className="p-4 pt-0">
              <CartForm
                route="/cart"
                inputs={{
                  lines: [
                    {
                      merchandiseId: product.variants.nodes[0].id,
                      quantity: 1,
                    },
                  ],
                }}
                action="add"
              >
                {(fetcher) => (
                  <Button.Root
                    variant="primary"
                    mode="filled"
                    size="medium"
                    className="w-full bg-primary-base hover:bg-primary-dark"
                    disabled={fetcher.state !== 'idle'}
                  >
                    {fetcher.state !== 'idle' ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                  </Button.Root>
                )}
              </CartForm>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
