# Hydrogen template: Skeleton

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with [Remix](https://remix.run/), Shopify’s full stack web framework. This template contains a **minimal setup** of components, queries and tooling to get started with Hydrogen.

[Check out Hydrogen docs](https://shopify.dev/custom-storefronts/hydrogen)  
[Get familiar with Remix](https://remix.run/docs/en/v1)

## What's included

- Remix
- Hydrogen
- Oxygen
- Vite
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Minimal setup of components and routes

## Getting started

**Requirements:**

- Node.js version 18.0.0 or higher

```bash
npm create @shopify/hydrogen@latest
```

## Building for production

```bash
npm run build
```

## Local development

```bash
npm run dev
```

## Using ngrok for local development

To expose your local development server to the internet using ngrok, follow these steps:

1. Download and install ngrok from [ngrok's official website](https://ngrok.com/).
2. Open a terminal and navigate to the ngrok directory:

   ```bash
    C:\ngrok http --url=concrete-willingly-alien.ngrok-free.app 3000
   ```

3. Run the following command to start ngrok and expose your local server (replace `3000` with your local server's port if different):

   ```bash
   ngrok http --url=concrete-willingly-alien.ngrok-free.app 3000
   ```

4. Copy the generated public URL from the terminal and use it as needed (e.g., for Shopify webhooks or testing).

This is the recommended way to start the project and expose it for external access.