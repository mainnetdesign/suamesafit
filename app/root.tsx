import {getShopAnalytics} from '@shopify/hydrogen';
import {type LoaderFunctionArgs, defer} from '@shopify/remix-oxygen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  type MetaFunction,
} from '@remix-run/react';
import type {LinksFunction} from '@remix-run/node';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY, FEATURED_COLLECTION_QUERY} from '~/lib/fragments';
import socialImage from '~/assets/home/Social Image.png';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export const links: LinksFunction = () => {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export const meta: MetaFunction = () => {
  const title = 'Sua Mesa Fit – Marmitas saudáveis todos os dias';
  const description = 'Cardápios balanceados, práticos e saborosos entregues fresquinhos até você.';
  return [
    {title},
    {name: 'description', content: description},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: title},
    {property: 'og:description', content: description},
    {property: 'og:image', content: socialImage},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: title},
    {name: 'twitter:description', content: description},
    {name: 'twitter:image', content: socialImage},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return defer({
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  }, {
    headers: {
      'Set-Cookie': await args.context.session.commit(),
    },
  });
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  try {
    const [header, collections] = await Promise.all([
      storefront.query(HEADER_QUERY, {
        cache: storefront.CacheLong(),
        variables: {
          headerMenuHandle: 'main-menu', // Adjust to your header menu handle
        },
      }),
      storefront.query(FEATURED_COLLECTION_QUERY),
    ]);

    return {
      header,
      featuredCollections: collections?.collections?.nodes ?? [],
    };
  } catch (error) {
    console.error('Erro em loadCriticalData (root loader):', error);

    // Retorna valores padrão seguros para evitar 500
    return {
      header: null,
      featuredCollections: [],
    };
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      console.error('Erro ao buscar footer:', error);
      return null;
    });

  // Verificação de login conforme documentação Shopify
  const isLoggedInPromise = customerAccount
    .isLoggedIn()
    .catch((error) => {
      console.error('Erro ao verificar login do cliente:', error);
      return false;
    });
  
  // Buscar dados do cliente quando logado
  const customerDataPromise = isLoggedInPromise.then(async (isLoggedIn) => {
    if (!isLoggedIn) return null;
    
    try {
      // Buscar dados básicos do cliente incluindo email
      const {data} = await customerAccount.query(`
        query CustomerDetails {
          customer {
            id
            firstName
            lastName
            emailAddress {
              emailAddress
            }
          }
        }
      `);
      
      return data?.customer || null;
    } catch (error) {
      console.error('Erro ao buscar dados do cliente:', error);
      return null;
    }
  });

  // Garante que qualquer falha na recuperação do carrinho não rejeite a stream deferida
  const cartPromise: Promise<any> = cart
    .get()
    .catch((error) => {
      console.error('Erro ao recuperar carrinho:', error);
      return null;
    });

  return {
    cart: cartPromise,
    isLoggedInPromise,
    customerDataPromise,
    footer,
  };
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
