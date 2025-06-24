import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {RiArrowDownSLine, RiLock2Line} from '@remixicon/react';
import {CartLineItemTable} from './CartLineItemTable';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity && cart?.totalQuantity > 0;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className={`cart-details${layout === 'page' ? ' flex gap-8 items-start' : ''}`}>
        <div className="overflow-x-auto flex-1">
          <table className="cart-table w-full min-w-[600px] mb-8">
            <thead>
              <tr>
                <th className="text-left text-text-sub-600 text-label-lg p-4">Produto</th>
                <th className="text-center text-text-sub-600 text-label-lg p-4">Quantidade</th>
                {layout !== 'aside' && (
                  <th className="text-right text-text-sub-600 text-label-lg p-4">Total</th>
                )}
              </tr>
            </thead>
            <tbody>
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItemTable key={line.id} line={line} layout={layout} showTotal={layout !== 'aside'} />
              ))}
            </tbody>
          </table>
        </div>
        {cartHasItems && layout === 'page' && (
          <div className="w-full max-w-[400px]">
            <CartSummary cart={cart} layout={layout} />
          </div>
        )}
        {cartHasItems && layout === 'aside' && (
          <CartSummary cart={cart} layout={layout} />
        )}
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}
