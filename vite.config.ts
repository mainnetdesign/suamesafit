import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';
// import tailwindcss from '@tailwindcss/vite';

declare module '@remix-run/server-runtime' {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    // tailwindcss(),
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.v3preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
        v3_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  server: {
    allowedHosts: [
      'helping-merely-fish.ngrok-free.app',
      'concrete-willingly-alien.ngrok-free.app',
      'subtly-intense-toucan.ngrok-free.app',
      '*.ngrok-free.app',
    ],
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'prop-types',
        'date-fns',
        '@remixicon/react',
        'react-day-picker',
        '@radix-ui/react-popover',
        '@radix-ui/react-slot',
        'clsx',
        'tailwind-merge',
        'tailwind-variants',
        'tailwindcss/defaultTheme',
        'tailwindcss-animate',
        'react-countdown'
      ],
    },
  },
});
