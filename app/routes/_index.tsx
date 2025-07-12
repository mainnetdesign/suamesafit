import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense, useEffect, useState} from 'react';
import {Image, Money, CartForm} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {DatepickerRangeDemo} from '~/components/daterange';
import {InteractiveHoverButton} from '~/components/magic-ui/ui/button';

import limitedTimeOfferImage from '~/assets/limited-offer-image.png';
import hero1Image from '~/assets/home/hero1.jpg';

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
import {Product} from '~/components/ProductCard';
import {Header} from '~/components/Header';
import Autoplay from 'embla-carousel-autoplay';

export const meta: MetaFunction = () => {
  return [{title: 'Sua Mesa Fit | Sua refeição saudável e deliciosa'}];
};

// Fragmento e query para buscar produtos da coleção
const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment HomeMoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomePageProductItem on Product {
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
        ...HomeMoneyProductItem
      }
      maxVariantPrice {
        ...HomeMoneyProductItem
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
          ...HomePageProductItem
        }
      }
    }
  }
` as const;

// ============================================================================
// CONFIGURAÇÃO CUSTOMIZÁVEL - PRODUTOS EM DESTAQUE NA HOMEPAGE
// ============================================================================
// Para alterar a coleção mostrada na seção "pratos em destaque", 
// simplesmente altere o valor abaixo com o handle da coleção desejada:
// Exemplos:
// - 'carne-bovina' para mostrar produtos de carne bovina
// - 'vegetariano' para mostrar produtos vegetarianos
// - 'low-carb' para mostrar produtos low-carb
// - 'fitness' para mostrar produtos fitness
// ============================================================================

const HOMEPAGE_FEATURED_COLLECTION = 'carne-bovina'; // 👈 ALTERE AQUI PARA CUSTOMIZAR

// ============================================================================
// CONFIGURAÇÃO AVANÇADA (OPCIONAL)
// ============================================================================
// Se você quiser alternar entre diferentes coleções facilmente,
// pode usar esta configuração e depois alterar apenas o 'selectedCollection':
// ============================================================================

const COLLECTION_OPTIONS = {
  'carne-bovina': {
    handle: 'carne-bovina',
    fallbackTitle: 'Carne Bovina em Destaque'
  },
  'vegetariano': {
    handle: 'vegetariano', 
    fallbackTitle: 'Pratos Vegetarianos'
  },
  'low-carb': {
    handle: 'low-carb',
    fallbackTitle: 'Opções Low-Carb'
  },
  'fitness': {
    handle: 'fitness',
    fallbackTitle: 'Refeições Fitness'
  }
};

// Para usar a configuração avançada, descomente a linha abaixo e comente a linha acima:
// const HOMEPAGE_FEATURED_COLLECTION = COLLECTION_OPTIONS['carne-bovina'].handle;

const HOMEPAGE_PRODUCTS_QUERY = `#graphql
  fragment HomeMoneyItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment HomeProductListItem on Product {
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
    variants(first: 1) {
      nodes {
        id
        availableForSale
      }
    }
    priceRange {
      minVariantPrice {
        ...HomeMoneyItem
      }
    }
  }
  query HomepageProducts(
    $handle: String!
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, sortKey: TITLE) {
        nodes {
          ...HomeProductListItem
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

  // Buscar produtos da coleção em destaque
  const homepageProducts = await storefront.query(HOMEPAGE_PRODUCTS_QUERY, {
    variables: {
      handle: HOMEPAGE_FEATURED_COLLECTION,
      first: 8,
    },
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
    homepageProducts: homepageProducts.collection?.products?.nodes ?? [],
    homepageCollectionTitle: homepageProducts.collection?.title ?? '',
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
    <div className="home gap-10  flex flex-col">
      <div className="w-full px-4 flex justify-center items-center">
        <div className="w-full max-w-[1200px] relative rounded-3xl inline-flex flex-col justify-center items-center overflow-hidden">
          <img
            className="z-10 absolute  object-cover w-full h-full"
            src={hero1Image}
          />
          <div className="z-20 self-stretch h-[461px] p-6 md:p-8 bg-gradient-to-b from-[#3D724A]/0 to-[#3D724A]/100 md:bg-[radial-gradient(ellipse_59.86%_167.30%_at_13.09%_92.08%,_#3D724A_15%,_rgba(61,_114,_74.04,_0.15)_60%,_rgba(61,_114,_74,_0)_100%)] flex flex-col justify-end items-start gap-5">
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

      <div className="w-full visible flex flex-col justify-center items-center">
        <div className="max-w-[1200px] pl-4 visible w-full flex flex-col gap-8 justify-center items-center">
          <div className="w-full pr-4 flex justify-between items-center gap-4">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-title-h4  text-text-sub-600">
                {data.homepageCollectionTitle || 'pratos em destaque'}
              </h3>
            </div>
            <Button.Root
              variant="primary"
              mode="filled"
              size="medium"
              onClick={() => (window.location.href = '/collections/all')}
            >
              abrir cardápio
            </Button.Root>
          </div>

          <ProductsCarousel products={data.homepageProducts} />
        </div>
      </div>

      <FeaturedCollections
        collections={data.featuredCollections}
        summerProducts={data.summerProducts}
      />

      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      <LimitedTimeOffer
        title="oferta por tempo limitado"
        description="aproveite as próximas horas para garantir marmitas saudáveis com preços especiais nos nossos sabores mais vendidos."
        buttonText="peça agora"
        buttonLink="/collections/limited-offer"
        imageUrl={limitedTimeOfferImage}
        deadline="2025-07-30T23:59:59"
      />

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

      <div className="w-full px-4 flex flex-col justify-center items-center">
        <div className="max-w-[1200px] w-full flex flex-col md:flex-row gap-4 justify-center items-start">
          <div className="w-full md:w-fit flex flex-col justify-center items-start">
            <div className="text-label-lg bg-yellow-500 px-4 py-1 rounded-full">
              faq
            </div>
            <h2 className="text-title-h3 max-w-[300px] text-center md:text-left text-text-sub-600">
              perguntas frequentes
            </h2>
          </div>
          <div className="bg-orange-100 rounded-3xl w-full max-w-[600px]">
            <Accordion.Root type="single" collapsible className="">
              <Accordion.Item value="restricoes">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  Vocês atendem restrições alimentares e alergias?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Sim! Nossas marmitas são preparadas com atenção especial às
                  restrições alimentares e alergias. Oferecemos opções
                  vegetarianas, veganas, sem glúten, sem lactose e outras
                  adaptações conforme sua necessidade.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="personalizacao">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  Posso personalizar minha marmita?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Sim! Você pode personalizar sua marmita escolhendo entre
                  diferentes opções de proteínas, acompanhamentos e guarnições.
                  Também oferecemos a possibilidade de montar seu próprio
                  cardápio semanal.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="frescas">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  As marmitas chegam frescas ou congeladas?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Nossas marmitas são entregues frescas, preparadas no mesmo dia
                  da entrega. Elas são embaladas em recipientes térmicos para
                  manter a temperatura ideal até chegarem em você.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="durabilidade">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  Quanto tempo as marmitas duram no freezer?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Nossas marmitas podem ser conservadas no freezer por até 30
                  dias, mantendo todo o sabor e qualidade. Recomendamos consumir
                  em até 3 dias quando mantidas na geladeira.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="conservantes">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  As marmitas contêm conservantes ou aditivos?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Não! Nossas marmitas são 100% naturais, sem conservantes ou
                  aditivos químicos. Utilizamos apenas ingredientes frescos e
                  naturais para garantir uma alimentação saudável e saborosa.
                </Accordion.Content>
              </Accordion.Item>
              <Accordion.Item value="regioes">
                <Accordion.Trigger>
                  <Accordion.Arrow />
                  Para quais regiões vocês entregam?
                </Accordion.Trigger>
                <Accordion.Content className="pl-[30px]">
                  Atualmente atendemos toda a região metropolitana de São Paulo,
                  incluindo Zona Sul, Zona Norte, Zona Leste, Zona Oeste e
                  Grande São Paulo. Entre em contato para verificar a
                  disponibilidade na sua região.
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!collections?.length) return null;

  const autoplayOptions = {
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  };

  return (
    <div className="featured-collections px-4 flex flex-col gap-10">
      <div className="w-full  flex flex-col justify-center items-center">
        <div className="relative overflow-hidden bg-green-700 max-w-[1200px] w-full p-4 py-8 md:p-16 gap-8 flex flex-col mx-auto rounded-3xl">
          <div data-svg-wrapper className="right-[-50px] top-[-89px] absolute">
            <svg
              width="225"
              height="241"
              viewBox="0 0 225 241"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M120.563 62.7886C114.014 67.1622 103.489 82.4471 99.3645 89.8808C89.8834 106.965 90.5787 103.288 95.8946 119.958C97.3752 124.626 98.4125 131.179 99.1514 136.098C99.3509 137.427 99.3299 138.112 99.4711 139.429C99.9352 143.672 100.146 144.071 100.082 149.147C100.049 151.299 100.206 153.512 100.081 155.574C99.6158 163.01 98.8802 174.567 97.1935 181.93C93.574 197.742 87.4992 210.984 76.2528 223.453C61.5613 239.755 27.4646 251.973 16.0502 225.404C13.0733 218.478 12.4486 212.913 12.2944 205.967C12.25 203.748 12.1088 201.944 12.2956 199.54C13.5846 181.63 18.1381 172.623 31.0517 158.576C44.9039 143.528 68.1895 128.895 76.8763 111.828C79.0284 107.582 81.8718 98.7055 82.3143 97.8954C84.7915 93.4034 86.546 88.7302 89.124 84.2896C98.733 67.7592 107.51 57.3109 121.752 45.1625C124.39 42.9141 132.32 37.6524 133.603 35.9225C131.872 34.7912 129.484 33.9389 127.71 33.3562C125.52 32.6261 124.358 32.9009 122.248 33.8299C100.83 43.2459 85.8264 66.9349 61.3135 71.5491C46.1191 74.4048 43.371 73.8727 28.7014 70.0755C22.7846 68.5484 10.8465 58.6494 7.68613 53.2359C5.41272 49.3557 3.47885 46.8135 2.00381 42.8969C-2.65811 30.5805 1.58059 19.5817 11.9535 10.1857C20.8243 2.15968 32.8548 -1.32498 43.5753 -1.68626C62.2164 -2.30291 81.3027 5.11157 99.6271 13.3608C114.662 20.1236 132.14 29.565 144.775 27.7982C153.588 26.5729 208.927 -0.450466 217.522 -2.23816L224.505 7.06416C220.885 9.40196 172.144 29.7201 169.628 30.7977C165.702 32.4634 161.667 34.6538 157.766 36.5884C150.179 40.3502 139.978 44.8851 135.309 53.6653C130.49 62.7284 129.495 72.7606 130.895 79.612C131.588 83.0007 132.293 89.2509 135.085 91.617C137.854 93.9479 144.801 95.639 148.272 96.7376C173.035 104.595 177.411 104.128 201.458 120.038C208.56 124.732 217.63 135.503 220.026 142.542C221.673 147.386 222.409 150.176 222.411 154.84C222.419 182.823 198.24 197.169 176.561 194.506C168.425 193.51 170.728 193.696 163.66 191.564C158.93 190.133 154.881 187.768 150.412 184.839C134.406 174.367 124.895 155.058 120.656 138.085C120.106 135.862 119.808 134.127 119.325 131.826L118.431 125.8C117.741 121.621 117.698 117.79 117.515 113.362C117.244 106.442 117.836 94.7948 118.326 88.165L119.804 69.0075C120.081 66.997 120.72 64.5145 120.531 62.7922"
                fill="#023442"
              />
            </svg>
          </div>
          <div data-svg-wrapper className="left-[0px] top-[-10px] absolute">
            <svg
              width="84"
              height="65"
              viewBox="0 0 84 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M25.8827 21.1094C27.1 23.5633 31.9044 27.875 34.2853 29.6288C39.7569 33.6603 38.5193 33.2567 44.5069 32.1651C46.1833 31.8621 48.49 31.796 50.2199 31.7601C50.6873 31.7505 50.9227 31.7883 51.3833 31.7982C52.8678 31.827 53.0148 31.772 54.7631 32.0202C55.5043 32.1274 56.2745 32.1716 56.9804 32.3068C59.525 32.7983 63.4791 33.5666 65.9443 34.4763C71.238 36.4291 75.5358 39.1144 79.3364 43.5494C84.3064 49.3436 87.0032 61.6505 77.3291 64.4053C74.8071 65.1238 72.8597 65.0916 70.4564 64.8355C69.6887 64.752 69.0602 64.7204 68.239 64.5489C62.118 63.3068 59.2135 61.3349 54.9424 56.2544C50.3679 50.8056 46.3565 42.1208 40.8553 38.3641C39.4865 37.4326 36.5508 36.0564 36.291 35.8677C34.8516 34.8131 33.3176 33.9997 31.9004 32.9126C26.6255 28.8616 23.4118 25.3683 19.855 19.9143C19.1968 18.9041 17.7346 15.9341 17.195 15.4145C16.7276 15.9613 16.3273 16.7469 16.0473 17.3332C15.6979 18.0561 15.7409 18.4693 15.9675 19.2385C18.2622 27.0466 25.7665 33.2775 26.2669 41.9396C26.5755 47.3085 26.2695 48.2329 24.3064 53.1246C23.5161 55.0978 19.5696 58.7755 17.5613 59.6248C16.1214 60.2363 15.1583 60.7902 13.7414 61.1247C9.28491 62.1846 5.67922 60.2326 2.89961 56.2357C0.525725 52.8181 -0.140761 48.5126 0.211949 44.7981C0.82923 38.3397 4.23695 32.0854 7.89871 26.131C10.9012 21.2453 14.9366 15.6361 14.8897 11.1984C14.8593 8.1038 8.00075 -12.1908 7.76671 -15.2355L11.2868 -17.2304C11.9321 -15.8775 16.7713 1.84233 17.031 2.75823C17.4309 4.1868 18.0069 5.67643 18.5006 7.10831C19.4605 9.89313 20.5708 13.6144 23.3919 15.6159C26.304 17.6818 29.7206 18.472 32.1467 18.2938C33.3465 18.2057 35.5341 18.2408 36.4747 17.3831C37.4021 16.5317 38.2949 14.2103 38.8284 13.0616C42.6417 4.86871 42.6754 3.33839 49.235 -4.24928C51.1705 -6.49037 55.2902 -9.13968 57.8251 -9.65282C59.5697 -10.0052 60.5649 -10.1351 62.1739 -9.92791C71.8281 -8.68467 75.7006 0.295379 73.8168 7.65558C73.1109 10.4181 73.2776 9.63183 72.2274 11.9753C71.5228 13.5434 70.5268 14.835 69.3175 16.2464C64.9918 21.3018 57.9072 23.7231 51.8631 24.4298C51.0715 24.5207 50.4598 24.546 49.6445 24.6105L47.5259 24.6504C46.0535 24.7025 44.7299 24.5468 43.1942 24.4125C40.7948 24.198 36.803 23.4751 34.5376 23.011L27.9944 21.6481C27.3131 21.463 26.4851 21.132 25.8826 21.1204"
                fill="#023442"
              />
            </svg>
          </div>

          <div data-svg-wrapper className="left-[0px] bottom-[-20px] absolute">
            <svg
              width="166"
              height="175"
              viewBox="0 0 166 175"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.3052 113.69C16.0577 116.009 30.6742 116.07 37.3412 115.453C52.6645 114.036 49.9636 115.217 58.4484 104.358C60.8279 101.322 64.6302 97.738 67.5022 95.0735C68.2783 94.3536 68.7333 94.0632 69.5274 93.3867C72.0818 91.2009 72.2476 90.8866 75.5784 88.6749C76.9934 87.7407 78.3629 86.6561 79.7604 85.8222C84.8042 82.8234 92.6488 78.1713 98.1882 75.9994C110.081 71.3344 121.393 69.4076 134.497 71.1886C151.625 73.5086 174.711 90.2661 162.494 109.487C159.31 114.499 155.967 117.375 151.517 120.56C150.092 121.574 148.982 122.466 147.335 123.412C135.111 130.525 127.23 131.561 112.359 129.396C96.4196 127.066 76.5622 118.413 61.6025 120.339C57.8851 120.824 50.8481 122.915 50.1246 122.987C46.1025 123.37 42.2835 124.303 38.2501 124.597C23.2302 125.685 12.5362 124.613 -1.68949 120.742C-4.32342 120.024 -11.2669 117.201 -12.9619 117.134C-12.9294 118.763 -12.424 120.694 -12.0153 122.107C-11.5181 123.856 -10.8232 124.49 -9.28223 125.45C6.35185 135.203 28.4239 134.447 42.3084 148.346C50.9118 156.963 51.7856 158.987 55.828 170.216C57.4613 174.743 56.3215 186.904 54.2028 191.363C52.6878 194.565 51.8925 196.952 49.9994 199.65C44.0566 208.151 35.0195 210.276 24.3018 207.7C15.1422 205.492 7.53427 199.212 2.5398 192.399C-6.13717 180.545 -9.78712 164.837 -12.5558 149.254C-14.8311 136.47 -16.4483 120.908 -23.2073 113.473C-27.9166 108.284 -70.0651 84.2797 -75.0438 79.482L-72.0923 70.8092C-68.9644 72.1263 -34.1072 94.815 -32.2893 95.9732C-29.4627 97.7878 -26.2463 99.4405 -23.256 101.119C-17.4405 104.385 -9.96136 109.008 -2.17679 108.147C5.85856 107.258 12.8271 103.452 16.6624 99.4993C18.5593 97.5442 22.3125 94.3108 22.6124 91.4442C22.8996 88.6082 20.9155 83.338 20.089 80.5918C14.207 60.994 11.9607 58.3547 11.635 35.647C11.5357 28.9429 14.5164 18.2606 18.0317 13.5772C20.4523 10.3552 21.94 8.63754 24.9735 6.56611C43.1747 -5.86248 63.2415 3.49822 71.1338 18.7832C74.0979 24.5185 73.1964 22.9376 74.9474 28.4823C76.1159 32.1953 76.3753 35.8793 76.4541 40.0867C76.7467 55.1487 68.4079 69.9081 59.248 80.201C58.0459 81.5462 57.0494 82.51 55.7673 83.8461L52.2438 87.1026C49.8317 89.407 47.3585 91.1359 44.5589 93.2202C40.1773 96.4689 32.3373 101.255 27.807 103.879L14.6878 111.423C13.2568 112.135 11.3581 112.822 10.3214 113.709"
                fill="#023442"
              />
            </svg>
          </div>
          <div data-svg-wrapper className="right-[-40px] bottom-[0px] absolute">
            <svg
              width="138"
              height="156"
              viewBox="0 0 138 156"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M86.5 88.0419C85.2696 83.6086 78.7109 74.974 75.3393 71.3266C67.5912 62.9428 69.5048 64.0007 59.2822 63.9041C56.4211 63.8727 52.5952 63.2507 49.7303 62.7618C48.9563 62.6296 48.58 62.4927 47.8233 62.3304C45.3837 61.8125 45.1238 61.8566 42.3186 60.8933C41.1301 60.4816 39.8735 60.1645 38.752 59.7179C34.7104 58.101 28.4315 55.5807 24.6533 53.2989C16.5401 48.4005 10.3017 42.6092 5.43783 34.0893C-0.924213 22.9568 -1.47303 1.80198 15.3574 0.323287C19.7452 -0.0628472 22.9473 0.607422 26.8304 1.79137C28.0702 2.17235 29.0969 2.42364 30.3971 2.96673C40.1003 6.95515 44.2665 11.1282 49.7018 20.8619C55.521 31.2993 59.386 46.896 67.2699 54.8359C69.2326 56.8061 73.639 60.0063 74.0077 60.4C76.0478 62.5956 78.3205 64.4233 80.3137 66.6656C87.7311 75.0191 91.9252 81.7997 96.0641 91.9232C96.8297 93.7982 98.3005 99.1604 99.026 100.189C99.9701 99.4347 100.879 98.2656 101.527 97.3874C102.332 96.3056 102.392 95.6103 102.262 94.2697C100.951 80.6632 90.5473 68.0073 92.4667 53.5606C93.6588 44.6066 94.4564 43.1788 99.2446 35.7319C101.173 32.7275 108.849 27.9116 112.43 27.1471C114.999 26.5947 116.763 25.9861 119.207 25.8833C126.894 25.5471 132.223 29.9095 135.541 37.3832C138.374 43.7728 138.109 51.086 136.35 57.1013C133.286 67.5589 125.683 76.7957 117.756 85.4572C111.255 92.5648 102.821 100.539 101.493 107.874C100.562 112.988 105.445 148.637 104.866 153.734L98.4276 155.909C97.7918 153.473 95.4243 122.71 95.2861 121.117C95.0792 118.634 94.6011 115.994 94.2405 113.476C93.5394 108.578 92.8871 102.088 88.8678 97.8928C84.7189 93.5623 79.3335 91.1762 75.2754 90.7014C73.2682 90.4666 69.6709 89.7155 67.8476 90.8323C66.048 91.9428 63.8399 95.489 62.5958 97.2148C53.7097 109.521 53.1692 112.034 39.9449 122.472C36.042 125.555 28.407 128.62 24.0631 128.663C21.0737 128.692 19.391 128.591 16.8025 127.739C1.27172 122.629 -2.27047 106.589 3.169 95.0455C5.20873 90.7124 4.6846 91.9566 7.15952 88.4237C8.81863 86.0604 10.8709 84.2454 13.3128 82.3006C22.0499 75.3323 34.5033 73.5831 44.6971 74.3327C46.0317 74.4336 47.0487 74.5855 48.414 74.7376L51.9213 75.3431C54.3666 75.7237 56.5005 76.3999 58.9911 77.108C62.881 78.2222 69.2364 80.6795 72.8261 82.1628L83.1874 86.4843C84.2525 87.0055 85.5134 87.8138 86.5036 88.0239"
                fill="#023442"
              />
            </svg>
          </div>
          <div className="text-text-white-0 align-center text-center flex items-center flex-col ">
            <div className="text-label-lg">categorias</div>
            <h4 className="text-title-h4">encontre sua refeição ideal</h4>
          </div>
          <div className="relative">
            <Carousel
              className="w-full max-w-[964px] mx-auto group/featured"
              opts={{
                align: 'start',
                loop: true,
              }}
              plugins={[Autoplay(autoplayOptions)]}
            >
              <CarouselContent className="min-h-[524px]">
                {collections.map((collection) => (
                  <CarouselItem key={collection.id} className="md:basis-full">
                    <div className="p-1">
                      <div className="flex flex-col-reverse md:flex-row bg-transparent rounded-lg overflow-hidden gap-4 h-fit">
                        <div className="min-h-[300px] flex-1  md:max-w-[424px] bg-yellow-50 rounded-lg p-4 md:p-8 flex flex-col justify-between">
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
                          <div className="flex-1 md:max-w-[524px] featured-collection-image rounded-lg overflow-hidden h-full min-h-[400] md:min-h-[524px]">
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
                className={`bg-yellow-50 text-text-sub-600 hover:bg-yellow-100 rounded-full opacity-0 group-hover/featured:opacity-100 transition-opacity duration-300 absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 ${isMobile ? 'hidden' : ''}`}
              />
              <CarouselNext
                className={`bg-yellow-50 text-text-sub-600 hover:bg-yellow-100 rounded-full opacity-0 group-hover/featured:opacity-100 transition-opacity duration-300 absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 ${isMobile ? 'hidden' : ''}`}
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
    images(first: 2) {
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
function ProductsCarousel({products}: {products: any[]}) {
  if (!products?.length) return null;
  return (
    <div className="visible w-full">
      <Carousel
        opts={{
          align: 'start',
        }}
        className="w-full visible group/carousel"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-4/5 md:basis-1/2 lg:basis-1/4"
            >
              <div className="p-1">
                <Product product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="bg-yellow-50 text-text-sub-600 hover:bg-yellow-100 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 left-4 w-12 h-12 z-50" />
        <CarouselNext className="bg-yellow-50 text-text-sub-600 hover:bg-yellow-100 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 right-4 w-12 h-12 z-50" />
      </Carousel>
    </div>
  );
}
