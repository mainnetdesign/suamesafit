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
import { CursorColorContext } from "~/components/shad-cn/ui/CursorContext";

import resetStyles from '~/styles/reset.css?url';
// Supports weights 100-900
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import appStyles from '~/styles/app.css?url';
import tailwindCss from '~/styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {RootLoader} from './root';
import { SmoothCursor } from "~/components/shad-cn/ui/smooth-cursor";


export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const [cursorColor, setCursorColor] = useState("black");
  const [borderColor, setBorderColor] = useState("#303172");

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
        <CursorColorContext.Provider value={{ color: cursorColor, setColor: setCursorColor, borderColor, setBorderColor }}>
          <SmoothCursor color={cursorColor} size={24} borderColor={borderColor} />
          {data ? (
            <Analytics.Provider
              cart={data.cart}
              shop={data.shop}
              consent={data.consent}
            >
              <PageLayout {...data}>
                <Outlet />
              </PageLayout>
            </Analytics.Provider>
          ) : (
            <Outlet />
          )}
          <ScrollRestoration nonce={nonce} />
          <Scripts nonce={nonce} />
        </CursorColorContext.Provider>
      </body>
    </html>
  );
}
