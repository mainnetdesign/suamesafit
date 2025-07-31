import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useState, useEffect, useRef} from 'react';
import {useFetcher, Link} from '@remix-run/react';
import {FetcherWithComponents} from '@remix-run/react';
import * as Button from '~/components/align-ui/ui/button';
import * as Select from '~/components/align-ui/ui/select';
import * as Input from '~/components/align-ui/ui/input';
import * as Popover from '~/components/align-ui/ui/popover';
import * as Checkbox from '~/components/align-ui/ui/checkbox';
import {Calendar as AlignCalendar} from '~/components/align-ui/ui/datepicker';
import {Calendar as ShadCalendar} from '~/components/shad-cn/ui/calendar';
import {format, addDays, isWeekend, isBefore, startOfToday} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import type {AttributeInput} from '@shopify/hydrogen/storefront-api-types';
import {useAside} from '~/components/Aside';
import {getShippingVariantByDistance, DELIVERY_DISTANCE_RANGES, DELIVERY_PAYMENT_ON_DELIVERY_RANGES} from '~/config/delivery';

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
  const [paymentOnDelivery, setPaymentOnDelivery] = useState<boolean>(false);
  const fetcher = useFetcher<{variantId?: string; distanceKm?: number; error?: string}>();
  
  // Fetcher único para todas as operações do checkout
  const checkoutFetcher = useFetcher();

  useEffect(() => {
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
    if (!fetcher.data?.distanceKm) return '-';
    
    // Calcular variante baseada na distância e método de pagamento atual
    const currentShippingVariantId = getShippingVariantByDistance(fetcher.data.distanceKm, paymentOnDelivery);
    if (!currentShippingVariantId) return '-';
    
    const price = getVariantPrice(currentShippingVariantId);
    if (price !== null) {
      return price.toFixed(2).replace('.', ',');
    }
    
    // Se não encontrou no carrinho, tenta buscar na configuração
    const ranges = paymentOnDelivery ? DELIVERY_PAYMENT_ON_DELIVERY_RANGES : DELIVERY_DISTANCE_RANGES;
    const range = ranges.find(
      r => r.shippingVariantId === currentShippingVariantId
    );
    
    return range ? range.label : '-';
  };

  const handleCheckout = async () => {
    console.log('🚀 INICIANDO CHECKOUT - handleCheckout chamado');
    
    // Verificar se todos os dados necessários estão preenchidos
    if (!fetcher.data?.distanceKm || !selectedTimeSlot || !selectedDeliveryLocation) {
      console.log('❌ Dados incompletos para checkout:', {
        distanceKm: fetcher.data?.distanceKm,
        selectedTimeSlot,
        selectedDeliveryLocation
      });
      return;
    }

    // Calcular o shippingVariantId no momento do checkout
    const calculatedShippingVariantId = getShippingVariantByDistance(fetcher.data.distanceKm, paymentOnDelivery);
    
    if (!calculatedShippingVariantId) {
      console.log('❌ Não foi possível calcular variante de frete');
      return;
    }

    console.log('✅ Dados completos, prosseguindo com checkout:', {
      distanceKm: fetcher.data.distanceKm,
      selectedTimeSlot,
      selectedDeliveryLocation,
      shippingVariantId: calculatedShippingVariantId,
      paymentOnDelivery,
      cep
    });

    // Debug adicional para verificar qual array está sendo usado
    console.log('🔍 DEBUG - Estado do checkbox paymentOnDelivery:', paymentOnDelivery);
    console.log('🔍 DEBUG - Array sendo usado:', paymentOnDelivery ? 'DELIVERY_PAYMENT_ON_DELIVERY_RANGES' : 'DELIVERY_DISTANCE_RANGES');
    
    // Verificar se a variante calculada existe no array correto
    const ranges = paymentOnDelivery ? DELIVERY_PAYMENT_ON_DELIVERY_RANGES : DELIVERY_DISTANCE_RANGES;
    const foundRange = ranges.find(r => r.shippingVariantId === calculatedShippingVariantId);
    console.log('🔍 DEBUG - Range encontrado:', foundRange);
    console.log('🔍 DEBUG - Todos os ranges disponíveis:', ranges.map(r => ({ maxKm: r.maxDistanceKm, id: r.shippingVariantId })));

    // Preparar o conteúdo da nota
    const noteContent = `INFORMAÇÕES DE ENTREGA:
CEP: ${cep}
Distância: ${fetcher.data?.distanceKm ? `${fetcher.data.distanceKm.toFixed(1)} km` : 'N/A'}
Horário: ${selectedTimeSlot === 'manha' ? 'Manhã (9h às 13h)' : selectedTimeSlot === 'tarde' ? 'Tarde (15h às 18h)' : selectedTimeSlot === 'noite' ? 'Noite (18h às 21h)' : 'N/A'}
Local: ${selectedDeliveryLocation === 'porta' ? 'Na porta' : selectedDeliveryLocation === 'recepcao' ? 'Na recepção' : 'N/A'}
Data: ${selectedDate ? format(selectedDate, "dd/MM/yyyy", {locale: ptBR}) : 'N/A'}
${paymentOnDelivery ? '💳 PAGAMENTO NA ENTREGA (VR/VA/Cartão)' : ''}
${selectedDeliveryLocation === 'recepcao' ? '⚠️ CONFIRMAR SE RECEPÇÃO ACEITA CONGELADOS' : ''}`;

    console.log('📝 NOTA PREPARADA:');
    console.log(noteContent);
    console.log('📝 Tamanho da nota:', noteContent.length, 'caracteres');
    console.log('🚚 Variante de frete selecionada:', calculatedShippingVariantId);

    // Atualizar tudo em uma única operação para evitar conflitos
    console.log('📤 ENVIANDO DADOS PARA O SERVIDOR...');
    checkoutFetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.LinesAdd,
          inputs: {
            lines: [
              {
                merchandiseId: calculatedShippingVariantId,
                quantity: 1,
              },
            ],
          },
        }),
        // Incluir a nota diretamente na mesma requisição
        note: noteContent,
        // Incluir atributos também
        'attributes[CEP]': cep,
        'attributes[Distância]': fetcher.data?.distanceKm ? `${fetcher.data.distanceKm.toFixed(1)} km` : '',
        'attributes[Horário de Entrega]': selectedTimeSlot,
        'attributes[Local de Entrega]': selectedDeliveryLocation,
        'attributes[Data de Entrega]': selectedDate ? format(selectedDate, "dd/MM/yyyy", {locale: ptBR}) : '',
        'attributes[Método de Pagamento]': paymentOnDelivery ? 'Pagamento na Entrega' : 'Online',
        redirectTo: fixCheckoutDomain(cart?.checkoutUrl) || '#',
      },
      {method: 'post', action: '/cart'}
    );
  };

  // Função para calcular a data mínima (3 dias úteis a partir de hoje)
  const calculateMinDeliveryDate = () => {
    let date = startOfToday();
    let businessDays = 0;
    
    while (businessDays < 3) {
      date = addDays(date, 1);
      if (!isWeekend(date)) {
        businessDays++;
      }
    }
    
    return date;
  };

  // Função para verificar se uma data deve ser desabilitada
  const disableDate = (date: Date) => {
    const minDate = calculateMinDeliveryDate();
    return isBefore(date, minDate) || isWeekend(date);
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
            Distância: {fetcher.data.distanceKm.toFixed(1)} km
          </p>
        )}
        
        {/* Datepicker para seleção de data de entrega */}
        {fetcher.data?.distanceKm !== undefined && !fetcher.data?.error && (
          <div className="w-full mt-4">
            <label className="block text-label-sm text-text-sub-600 mb-2">
              Data de entrega
            </label>
            <Popover.Root>
              <Popover.Trigger asChild>
                <Button.Root
                  variant="neutral"
                  mode="stroke"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedDate ? (
                    format(selectedDate, "dd 'de' MMMM 'de' yyyy", {locale: ptBR})
                  ) : (
                    "Escolha a data"
                  )}
                </Button.Root>
              </Popover.Trigger>
              <Popover.Content className="w-auto p-0" align="start">
                <ShadCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md [&_.rdp-day]:text-text-sub-600 [&_.rdp-day_button:hover:not([disabled])]:bg-bg-soft-200 [&_.rdp-day_button[aria-selected='true']]:!bg-text-sub-600 [&_.rdp-day_button[aria-selected='true']]:!text-white [&_.rdp-head_cell]:text-text-sub-600 [&_.rdp-button_reset]:w-9 [&_.rdp-button_reset]:h-9 [&_.rdp-button_reset]:rounded-md [&_.rdp-day_selected]:bg-text-sub-600 [&_.rdp-day_selected]:text-white [&_.rdp-button_reset]:flex [&_.rdp-button_reset]:items-center [&_.rdp-button_reset]:justify-center"
                  captionLayout="dropdown"
                  locale={ptBR}
                  disabled={disableDate}
                  formatters={{
                    formatDay: (date: Date) => {
                      return date.getDate().toString();
                    },
                    formatCaption: (date: Date) => {
                      return format(date, 'LLLL yyyy', {locale: ptBR});
                    },
                    formatWeekdayName: (date: Date) => {
                      return format(date, 'EEEEE', {locale: ptBR}).toUpperCase();
                    }
                  }}
                />
              </Popover.Content>
            </Popover.Root>
            
            
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
                <Select.Item value="porta">na porta</Select.Item>
                <Select.Item value="recepcao">na recepção</Select.Item>
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

        {/* Checkbox para pagamento na entrega */}
        {selectedDeliveryLocation && (
          <div className="w-full mt-4">
            <div className="flex items-start gap-3">
              <Checkbox.Root
                checked={paymentOnDelivery}
                onCheckedChange={(checked) => setPaymentOnDelivery(checked === true)}
                className="mt-0.5"
              />
              <label className="text-label-sm text-text-sub-600 cursor-pointer" onClick={() => setPaymentOnDelivery(!paymentOnDelivery)}>
                Pretendo pagar com VR/VA, Voucher ou cartão/débito na entrega
              </label>
            </div>
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
          checkoutFetcher.state !== 'idle'
        }
        onClick={handleCheckout}
      >
        <p>
          {checkoutFetcher.state !== 'idle'
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
