import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useRef} from 'react';
import {FetcherWithComponents} from '@remix-run/react';
import * as Button from '~/components/align-ui/ui/button';
import * as Select from '~/components/align-ui/ui/select';
import * as Input from '~/components/align-ui/ui/input';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  if (layout === 'aside') {
    return <CartSummaryAside cart={cart} />;
  }
  return <CartSummaryPage cart={cart} />;
}

function CartSummaryAside({
  cart,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null>;
}) {
  return (
    <div
      aria-labelledby="cart-summary"
      className="cart-summary-aside mb-16 md:mb-0"
    >
      <dl className="cart-subtotal flex  justify-between ">
        <dt className="text-title-h5 text-text-sub-600">subtotal</dt>
        <dd className="text-title-h5 text-text-sub-600">
          {cart?.cost?.subtotalAmount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            'R$ 0,00'
          )}
        </dd>
      </dl>
      <div>
        <Button.Root asChild variant="primary" mode="filled">
          <a href="/cart" target="_self">
            <p>revisar pedido&rarr;</p>
          </a>
        </Button.Root>
        <br />
      </div>
    </div>
  );
}

function CartSummaryPage({
  cart,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null>;
}) {
  return (
    <div
      aria-labelledby="cart-summary"
      className="cart-summary-page flex flex-col gap-6 p-6 rounded-2xl bg-bg-white-0 shadow-regular-md min-w-[320px] max-w-[400px] w-full"
    >
      <dl className="cart-total flex justify-between items-center">
        <dt className="text-title-h5 text-text-sub-600">Total</dt>
        <dd className="text-title-h4 text-text-sub-600">
          {cart?.cost?.totalAmount ? (
            <Money data={cart.cost.totalAmount} />
          ) : (
            'R$ 0,00'
          )}
        </dd>
      </dl>
      {/* <div>
        <Select.Root defaultValue="portaria">
          <Select.Trigger>
            <Select.Value placeholder="Escolha como deseja receber" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="portaria">Deixar na portaria</Select.Item>
            <Select.Item value="apartamento">Entregar no apartamento</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      <div>
        <label className="block text-label-sm text-text-sub-600 mb-1" htmlFor="cep">Informe seu CEP</label>
        <Input.Root>
          <Input.Input id="cep" name="cep" placeholder="00000-000" maxLength={9} autoComplete="postal-code" />
        </Input.Root>
        <Button.Root variant="primary" mode="filled" size="small" className="mt-2 w-full">Buscar</Button.Root>
      </div> */}
      
      <Button.Root asChild variant="primary" mode="filled" className="w-full">
        <a href={fixCheckoutDomain(cart?.checkoutUrl)} target="_self">
          <p>Fechar Pedido</p>
        </a>
      </Button.Root>
      <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center gap-3 mt-2">
        <span className="text-green-700 text-label-md font-bold">
          Você ganha 5% de cashback para seu próximo pedido!
        </span>
        <span className="text-green-700 text-paragraph-sm">
          É o nosso jeito de agradecer por comprar com a gente. Use esse valor
          no próximo pedido (válido por 60 dias)
        </span>
      </div>
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

// Util para garantir que o checkout use o subdomínio correto
function fixCheckoutDomain(url?: string | null) {
  if (!url) return '#';
  if (url.startsWith('/')) return `https://conta.suamesafit.com${url}`;
  return url
    .replace('https://suamesafit.com', 'https://conta.suamesafit.com')
    .replace('http://suamesafit.com', 'https://conta.suamesafit.com');
}
