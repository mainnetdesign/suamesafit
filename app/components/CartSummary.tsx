import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {useFetcher, Link} from '@remix-run/react';
import {FetcherWithComponents} from '@remix-run/react';
import * as Button from '~/components/align-ui/ui/button';
import * as Select from '~/components/align-ui/ui/select';
import * as Input from '~/components/align-ui/ui/input';
import {Calendar} from '~/components/align-ui/ui/datepicker';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';
import {useAside} from '~/components/Aside';
import {getShippingVariantByDistance, DELIVERY_DISTANCE_RANGES} from '~/config/delivery';

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
  const {close} = useAside();

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
          <Link to="/cart" onClick={close}>
            <p>revisar pedido&rarr;</p>
          </Link>
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
  // Estado e fetcher para cálculo de frete
  const [cep, setCep] = useState('');
  const [shippingVariantId, setShippingVariantId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<string>('');
  const fetcher = useFetcher<{variantId?: string; distanceKm?: number; error?: string}>();
  
  // Fetchers separados para evitar conflitos de ação no checkout
  const cartUpdateFetcher = useFetcher();
  const cartNoteFetcher = useFetcher();
  const cartLinesFetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.distanceKm !== undefined && !fetcher.data?.error) {
      const variantId = getShippingVariantByDistance(fetcher.data.distanceKm);
      if (variantId) {
        setShippingVariantId(variantId);
      }
    }
    if (fetcher.data?.distanceKm !== undefined) {
      // eslint-disable-next-line no-console
      console.log(`Distância calculada: ${fetcher.data.distanceKm.toFixed(2)} km`);
    }
    if (fetcher.data?.error) {
      // eslint-disable-next-line no-console
      console.error('Erro no cálculo de frete:', fetcher.data.error);
    }
  }, [fetcher.data]);

  const handleCepSearch = () => {
    const sanitizedCep = cep.replace(/\D/g, '');
    if (sanitizedCep.length !== 8) {
      console.log('CEP inválido: deve ter 8 dígitos');
      return;
    }
    
    console.log(`🔎 Buscando CEP ${sanitizedCep}`);
    fetcher.load(`/api-shipping?cep=${sanitizedCep}`);
    console.log('Fetcher state:', fetcher.state);
  };

  // Função para encontrar o preço de uma variante no carrinho
  const getVariantPrice = (variantId: string): number | null => {
    if (!cart?.lines?.nodes) return null;
    
    const line = cart.lines.nodes.find(
      (line) => line.merchandise?.id === variantId
    );
    
    if (line?.cost?.amountPerQuantity?.amount) {
      return parseFloat(line.cost.amountPerQuantity.amount);
    }
    
    return null;
  };

  // Função para obter o preço estimado do frete baseado na distância
  const getEstimatedShippingPrice = (): string => {
    if (!shippingVariantId) return '-';
    
    const price = getVariantPrice(shippingVariantId);
    if (price !== null) {
      return price.toFixed(2).replace('.', ',');
    }
    
    // Se não encontrou no carrinho, tenta buscar na configuração
    const range = DELIVERY_DISTANCE_RANGES.find(
      r => r.shippingVariantId === shippingVariantId
    );
    
    return range ? range.label : '-';
  };

  const handleCheckout = () => {
    // Verificar se todos os dados necessários estão preenchidos
    if (!fetcher.data?.distanceKm || !selectedTimeSlot || !selectedDeliveryLocation) {
      console.log('Dados incompletos para checkout:', {
        distanceKm: fetcher.data?.distanceKm,
        selectedTimeSlot,
        selectedDeliveryLocation,
        shippingVariantId
      });
      return;
    }

    console.log('Iniciando checkout com dados:', {
      distanceKm: fetcher.data.distanceKm,
      selectedTimeSlot,
      selectedDeliveryLocation,
      shippingVariantId,
      cep
    });

    // 1. Primeiro, atualizar os atributos do carrinho
    cartUpdateFetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.AttributesUpdateInput,
          inputs: {
            attributes: [
              {key: 'CEP', value: cep},
              {key: 'Distância', value: fetcher.data?.distanceKm ? `${fetcher.data.distanceKm.toFixed(1)} km` : ''},
              {key: 'Horário de Entrega', value: selectedTimeSlot},
              {key: 'Local de Entrega', value: selectedDeliveryLocation},
              {key: 'Data de Entrega', value: selectedDate ? format(selectedDate, "dd/MM/yyyy", {locale: ptBR}) : ''},
            ],
          },
        }),
      },
      {method: 'post', action: '/cart'}
    );

    // 2. Imediatamente após, atualizar a nota do carrinho
    cartNoteFetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.NoteUpdate,
          inputs: {
            note: `INFORMAÇÕES DE ENTREGA:
CEP: ${cep}
Distância: ${fetcher.data?.distanceKm ? `${fetcher.data.distanceKm.toFixed(1)} km` : 'N/A'}
Horário: ${selectedTimeSlot === 'manha' ? 'Manhã (9h às 13h)' : selectedTimeSlot === 'tarde' ? 'Tarde (15h às 18h)' : selectedTimeSlot === 'noite' ? 'Noite (18h às 21h)' : 'N/A'}
Local: ${selectedDeliveryLocation === 'porta' ? 'Na porta' : selectedDeliveryLocation === 'recepcao' ? 'Na recepção' : 'N/A'}
Data: ${selectedDate ? format(selectedDate, "dd/MM/yyyy", {locale: ptBR}) : 'N/A'}
${selectedDeliveryLocation === 'recepcao' ? '⚠️ CONFIRMAR SE RECEPÇÃO ACEITA CONGELADOS' : ''}`,
          },
        }),
      },
      {method: 'post', action: '/cart'}
    );

    // 3. Por fim, adicionar o item de frete e redirecionar imediatamente
    cartLinesFetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.LinesAdd,
          inputs: {
            lines: [
              {
                merchandiseId: shippingVariantId,
                quantity: 1,
              },
            ],
          },
        }),
        redirectTo: fixCheckoutDomain(cart?.checkoutUrl) || '#',
      },
      {method: 'post', action: '/cart'}
    );
  };

  return (
    <div
      aria-labelledby="cart-summary"
      className="cart-summary-page flex flex-col gap-6 p-6 rounded-2xl bg-bg-white-0 shadow-regular-md min-w-[350px] max-w-[400px] w-full"
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

      {/* Bloco de cálculo de frete */}
      <div className="w-full">
        <label
          className="block text-label-sm text-text-sub-600 mb-1"
          htmlFor="cep"
        >
          Informe seu CEP
        </label>
        <Input.Root>
          <Input.Input
            id="cep"
            name="cep"
            placeholder="00000-000"
            maxLength={9}
            autoComplete="postal-code"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
          />
        </Input.Root>
        <Button.Root
          variant="primary"
          mode="filled"
          
          className="mt-2 w-full"
          disabled={fetcher.state !== 'idle'}
          onClick={() => {
            console.log('🎯 Botão clicado!');
            handleCepSearch();
          }}
        >
          {fetcher.state === 'loading' || fetcher.state === 'submitting'
            ? 'Calculando…'
            : 'Buscar'}
        </Button.Root>
       
        {/* Validação visual do CEP */}
        {cep.length > 0 && cep.replace(/\D/g, '').length !== 8 && (
          <p className="text-orange-600 text-label-sm mt-1">
            CEP deve ter 8 dígitos
          </p>
        )}
        
        {fetcher.data?.distanceKm !== undefined && !fetcher.data?.error && (
          <p className="text-text-sub-600 text-label-sm mt-2">
            Distância: {fetcher.data.distanceKm.toFixed(1)} km • Frete estimado: R$
            {getEstimatedShippingPrice()}
          </p>
        )}
        
        {/* Datepicker para seleção de data de entrega */}
        {fetcher.data?.distanceKm !== undefined && !fetcher.data?.error && (
          <div className="w-full mt-4">
            <label className="block text-label-md text-text-sub-600 mb-4">
              Escolha a data de entrega
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-lg"
            />
            {selectedDate && (
              <p className="text-text-sub-600 text-label-sm mt-2">
                Entrega em: {format(selectedDate, "EEEE, dd 'de' MMMM", {locale: ptBR})}
              </p>
            )}
          </div>
        )}

        {/* Select para horário de entrega */}
        {fetcher.data?.distanceKm !== undefined && !fetcher.data?.error && (
          <div className="w-full mt-4">
            <label className="block text-label-sm text-text-sub-600 mb-2">
              Horário de entrega
            </label>
            <Select.Root value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
              <Select.Trigger>
                <Select.Value placeholder="Escolha o horário" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="manha">Manhã (9h às 13h)</Select.Item>
                <Select.Item value="tarde">Tarde (15h às 18h)</Select.Item>
                <Select.Item value="noite">Noite (18h às 21h)</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        )}

        {/* Select para local de entrega */}
        {selectedTimeSlot && (
          <div className="w-full mt-4">
            <label className="block text-label-sm text-text-sub-600 mb-2">
              Como deseja receber?
            </label>
            <Select.Root value={selectedDeliveryLocation} onValueChange={setSelectedDeliveryLocation}>
              <Select.Trigger>
                <Select.Value placeholder="Escolha o local de entrega" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="porta">Na porta</Select.Item>
                <Select.Item value="recepcao">Na recepção</Select.Item>
              </Select.Content>
            </Select.Root>
            
            {/* Aviso para recepção */}
            {selectedDeliveryLocation === 'recepcao' && (
              <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-700 text-label-sm">
                  ⚠️ Confirme se a recepção aceita produtos congelados
                </p>
              </div>
            )}
          </div>
        )}
        
        {fetcher.data?.error && (
          <p className="text-red-600 text-label-sm mt-2">
            Erro: {fetcher.data.error}
          </p>
        )}
      </div>

      {/* Botão de checkout */}
      <Button.Root
        type="button"
        variant="primary"
        mode="filled"
        className="w-full"
        disabled={
          !fetcher.data?.distanceKm || 
          !selectedTimeSlot || 
          !selectedDeliveryLocation || 
          fetcher.state !== 'idle' ||
          cartUpdateFetcher.state !== 'idle' ||
          cartNoteFetcher.state !== 'idle' ||
          cartLinesFetcher.state !== 'idle'
        }
        onClick={handleCheckout}
      >
        <p>
          {cartUpdateFetcher.state !== 'idle' || 
           cartNoteFetcher.state !== 'idle' || 
           cartLinesFetcher.state !== 'idle'
            ? 'Processando...'
            : 'Fechar Pedido'}
        </p>
      </Button.Root>
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
