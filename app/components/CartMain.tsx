import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {RiArrowDownSLine, RiLock2Line} from '@remixicon/react';
import {CartLineItemTable} from './CartLineItemTable';
import {Product as ProductCard} from '~/components/ProductCard';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  relatedProducts?: any[];
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart, relatedProducts}: CartMainProps) {
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
        <div className="overflow-x-auto">
          <table className="cart-table w-full mb-8">
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
      {/* Sessão de produtos relacionados */}
      {layout === 'page' && relatedProducts && relatedProducts.length > 0 && (
        <div className="w-full flex justify-center items-center p-6">
          <div className="max-w-[1200px] w-full flex flex-col justify-center items-center mt-12">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-title-h2 text-text-sub-600 mb-6">
                você também pode gostar
              </h2>
              <a href="/collections" className="bg-yellow-300 rounded-lg px-4 py-2 text-text-sub-600 text-label-lg hover:bg-yellow-400 transition-colors">ver mais ↗</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1200px]">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
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
        Acho que você não adicionou nada fit ainda, vamos começar!
      </p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continuar comprando →
      </Link>
    </div>
  );
}
