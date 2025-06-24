import type {CartLayout} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {Link} from '@remix-run/react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Root as Button, Icon as ButtonIcon } from '~/components/align-ui/ui/button';

// Tipos
// O CartLine é igual ao usado no CartLineItem
//
type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItemTable({
  layout,
  line,
  showTotal = true,
}: {
  layout: CartLayout;
  line: CartLine;
  showTotal?: boolean;
}) {
  const {id, merchandise, quantity, cost} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const {close} = useAside();

  return (
    <tr key={id} className="border-b align-top">
      {/* Produto */}
      <td className="flex gap-4 items-start p-4 min-w-[200px] w-full">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={64}
            loading="lazy"
            width={64}
            className="rounded-md"
          />
        )}
        <div className="w-full min-w-0">
          <Link
            prefetch="intent"
            to={`/products/${product.handle}`}
            onClick={() => {
              if (layout === 'aside') close();
            }}
            className="text-label-lg text-text-sub-600 block mb-1 break-words w-full"
          >
            {product.title}
          </Link>
          {(!showTotal) && (
            <span className="block text-text-sub-600 text-paragraph-lg mb-1">
              R$ {Number(cost.totalAmount.amount).toFixed(2)}
            </span>
          )}
          {selectedOptions.map((option) => (
            <span key={option.name} className="block text-paragraph-sm text-text-sub-600">
              {option.name}: {option.value }
            </span>
          ))}
        </div>
      </td>
      {/* Quantidade */}
      <td className="text-center p-4 w-[90px] min-w-[90px] max-w-[90px] whitespace-nowrap">
        <CartLineQuantityTable line={line} />
      </td>
      {/* Total */}
      {showTotal && (
        <td className="text-right p-4 text-text-sub-600 text-paragraph-lg font-semibold min-w-[110px] max-w-[120px] whitespace-nowrap">
          R$ {Number(cost.totalAmount.amount).toFixed(2)}
        </td>
      )}
    </tr>
  );
}

function CartLineQuantityTable({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-neutral-0 w-[70px] border border-stroke-soft-200 px-2 py-1 rounded-md flex items-center justify-between">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}> 
          <button
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="text-lg"
          >
            &#8722;
          </button>
        </CartLineUpdateButton>
        <span className="mx-2">{quantity}</span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}> 
          <button
            aria-label="Aumentar quantidade"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="text-lg"
          >
            &#43;
          </button>
        </CartLineUpdateButton>
      </div>
      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        className="text-xs text-red-500 underline mt-1 flex items-center gap-1"
        disabled={disabled}
        type="submit"
      >
        <RiDeleteBin6Line className="inline-block" /> Remover
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: any[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
} 