import {useNonce, Analytics} from '@shopify/hydrogen';
import {
  Links,
  Meta,
  Scripts,
  useRouteLoaderData,
  ScrollRestoration,
  Outlet,
} from '@remix-run/react';
import {MutableRefObject, useRef, useState} from 'react';
import {CursorColorContext} from '~/components/shad-cn/ui/CursorContext';
import {StickyRefProvider} from '~/components/custom/sticky-ref-context';
import {StickyCursorColorProvider} from '~/components/custom/sticky-cursor-color-context';

import resetStyles from '~/styles/reset.css?url';
// Supports weights 100-900
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import appStyles from '~/styles/app.css?url';
import tailwindCss from '~/styles/tailwind.css?url';
import {PageLayout} from '~/components/PageLayout';
import {RootLoader} from './root';
// import { SmoothCursor } from "~/components/shad-cn/ui/smooth-cursor";
import BlobCursor from '~/components/react-bits/animations/BlobCursor/BlobCursor';
import {BlobCursorProvider, useBlobCursorProximity} from '~/components/react-bits/animations/BlobCursor/BlobCursorContext';
// import StickyCursor from '~/components/custom/sticky-cursor';

export default function Layout() {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  // const stickyElementRef = useRef<HTMLElement | null>(null);
  // const [stickyElement, setStickyElement] = useState<MutableRefObject<HTMLElement | null>>(stickyElementRef);
  const [cursorColor, setCursorColor] = useState('#00FFFF');
  const [borderColor, setBorderColor] = useState('#303172');

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
        <StickyCursorColorProvider>
        <StickyRefProvider>
        <CursorColorContext.Provider
          value={{
            color: cursorColor,
            setColor: setCursorColor,
            borderColor,
            setBorderColor,
          }}
        >
          <BlobCursorProvider>
            {/* <BlobCursor fillColor={cursorColor} /> */}
            {/* <StickyCursor /> */}
            {/* <StickyCursor stickyElement={stickyElement} /> */}

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
          </BlobCursorProvider>
        </CursorColorContext.Provider>
        </StickyRefProvider>
        </StickyCursorColorProvider>
      </body>
    </html>
  );
}
