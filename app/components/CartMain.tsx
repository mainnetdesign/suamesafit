import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import { RiArrowDownSLine, RiLock2Line } from '@remixicon/react';

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
      <div className="cart-details">
        <div className="flex gap-4 items-center">
          <div aria-labelledby="cart-lines">
            <ul>
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </div>
          <div className="w-96 h-[457px] p-10 bg-[#f0f0f0] rounded-xl outline-1 outline-offset-[-1px] outline-neutral-800/10 inline-flex justify-center items-center gap-2.5">
            <div className="w-72 inline-flex flex-col justify-center items-center gap-6">
              <div className="self-stretch flex flex-col justify-start items-end gap-6">
                <div className="self-stretch flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="text-right justify-end text-neutral-800/70 text-base font-normal font-['Inter Variable']">
                      Subtotal
                    </div>
                    <div className="text-right justify-end text-neutral-800/70 text-base font-normal font-['Inter Variable']">
                      R$ 19,50
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="text-right justify-end text-[#1a1a1a] text-xl font-bold font-['Inter Variable'] leading-loose">
                      Total
                    </div>
                    <div className="text-right justify-end text-[#1a1a1a] text-xl font-bold font-['Inter Variable'] leading-loose">
                      R$ 19,50
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-14 pl-5 pr-3 py-3 rounded-md outline outline-1 outline-offset-[-1px] outline-black flex flex-col justify-start items-start gap-2.5">
                  <div className="w-60 inline-flex justify-between items-center">
                    <div className="w-36 inline-flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch justify-end text-black text-[10px] font-normal font-['Inter Variable']">
                        Escolha como deseja receber
                      </div>
                      <div className="self-stretch justify-end text-black text-sm font-normal font-['Inter Variable']">
                        Receber em mãos
                      </div>
                    </div>
                    <div className="w-6 h-6 relative overflow-hidden">
                      {/* <div className="w-3 h-1.5 left-[6.27px] top-[8.60px] absolute bg-[#1a1a1a]" /> */}
                      <RiArrowDownSLine color='#1a1a1a'/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch px-2.5 flex flex-col justify-start items-start gap-[5px]">
                <div className="self-stretch justify-end text-black text-sm font-bold font-['Inter Variable']">
                  Informe seu CEP
                </div>
                <div className="self-stretch inline-flex justify-start items-center gap-3">
                  <div className="w-48 h-10 rounded-lg border border-black" />
                  <div className="flex-1 justify-end text-black text-sm font-bold font-['Inter Variable']">
                    Buscar
                  </div>
                </div>
              </div>
              <div className="self-stretch h-14 px-10 py-4 bg-[#75253d] rounded-[30px] outline outline-1 outline-offset-[-1px] outline-[#75253d] flex flex-col justify-center items-center gap-2.5">
                <div className="inline-flex justify-center items-center gap-4">
                  <div className="w-6 h-6 relative overflow-hidden">
                    {/* <div className="w-4 h-5 left-[3.90px] top-[2.10px] absolute bg-white" /> */}
                    <RiLock2Line color='white'/>
                  </div>
                  <div className="justify-end text-white text-sm font-bold font-['Inter Variable']">
                    Fechar Pedido
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
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
