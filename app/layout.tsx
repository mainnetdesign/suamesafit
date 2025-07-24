import {useNonce, Analytics} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Scripts,
  useRouteLoaderData,
  ScrollRestoration,
  Outlet,
} from '@remix-run/react';
import { useState } from "react";

import resetStyles from '~/styles/reset.css?url';
// Supports weights 100-900
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import appStyles from '~/styles/app.css?url';
import tailwindCss from '~/styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {RootLoader} from './root';
import {Footer} from '~/components/Footer';

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body className="relative">
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            {data.header ? (
              <PageLayout 
                {...data}
                isLoggedIn={data.isLoggedIn}
                customerData={data.customerData}
              >
                <Outlet />
              </PageLayout>
            ) : (
              <Outlet />
            )}
          </Analytics.Provider>
        ) : (
          <Outlet />
        )}
        <Footer collections={data?.featuredCollections} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
