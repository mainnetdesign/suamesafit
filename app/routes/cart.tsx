import {type MetaFunction, useLoaderData} from '@remix-run/react';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';

export const meta: MetaFunction = () => {
  return [{title: `Sua Mesa Fit | Carrinho`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart, storefront} = context;
  const cartData = await cart.get();

  // Buscar produtos relacionados de uma coleção específica (exemplo: 'pratos-principais')
  const collectionHandle = 'pratos-principais'; // ajuste para o handle desejado
  const result = await storefront.query(
    `#graphql
      fragment CartMoneyProductItem on MoneyV2 {
        amount
        currencyCode
      }
      fragment CartProductItem on Product {
        id
        handle
        title
        featuredImage {
          altText
          url
          width
          height
        }
        priceRange {
          minVariantPrice {
            ...CartMoneyProductItem
          }
        }
      }
      query CartRelatedProducts($handle: String!, $first: Int) {
        collection(handle: $handle) {
          products(first: $first) {
            nodes {
              ...CartProductItem
            }
          }
        }
      }
    `,
    {
      variables: {handle: collectionHandle, first: 4},
    },
  );
  const relatedProducts = result.collection?.products?.nodes || [];

  return { cart: cartData, relatedProducts };
}

export default function Cart() {
  const { cart, relatedProducts } = useLoaderData<typeof loader>();

  return (
    <div className="cart w-full flex flex-col justify-center items-center py-[100px]">
      <div className="max-w-[1200px] w-full flex flex-col gap-8 p-8 justify-center items-center">
        <h1 className="text-text-sub-600 text-title-h3">seu carrinho</h1>
        <CartMain layout="page" cart={cart} relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
