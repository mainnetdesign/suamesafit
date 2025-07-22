import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useState, useEffect} from 'react';
import {useFetcher} from '@remix-run/react';
import * as Button from '~/components/align-ui/ui/button';
import * as Input from '~/components/align-ui/ui/input';
import * as Select from '~/components/align-ui/ui/select';
import { Calendar as Datepicker } from '~/components/align-ui/ui/datepicker';
import {ptBR} from 'date-fns/locale';
import * as Tooltip from '~/components/align-ui/ui/tooltip';
import {
  DELIVERY_PERIODS,
  sanitizeCep,
  DeliveryPeriod,
  getShippingVariantByDistance,
  isWithinDeliveryArea,
} from '~/config/delivery';

interface Props {
  /**
   * Callback triggered after the form successfully updates the cart.
   * Used by the parent component to re-evaluate completion state.
   */
  onCompleted?: () => void;
}

interface ShippingApiResponse {
  distance?: number;
  error?: string;
}

/**
 * Progressive form that:
 * 1. Solicits & validates CEP (postal code) via distance API
 * 2. Lets the user pick date / period / delivery type
 * 3. Saves everything as cart attributes + adds the correct shipping item based on distance
 */
export function DeliveryOptionsForm({onCompleted}: Props) {
  /* ----------------------------- CEP step ----------------------------- */
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isValidatingCep, setIsValidatingCep] = useState(false);

  // Fetcher para validar CEP via API
  const cepFetcher = useFetcher<ShippingApiResponse>();

  const handleCepValidate = async () => {
    const sanitized = sanitizeCep(cepInput);
    if (!sanitized) {
      setCepError('CEP inválido');
      return;
    }

    setIsValidatingCep(true);
    setCepError(null);
    
    // Chama a API de shipping para calcular a distância
    cepFetcher.submit(
      { cep: sanitized },
      { method: 'post', action: '/api-shipping' }
    );
  };

  // Processa a resposta da API de CEP/distância
  useEffect(() => {
    if (cepFetcher.data) {
      setIsValidatingCep(false);
      
      if (cepFetcher.data.error) {
        setCepError(cepFetcher.data.error);
        setDistanceKm(null);
        return;
      }

      if (cepFetcher.data.distance !== undefined) {
        const distance = cepFetcher.data.distance;
        
        if (!isWithinDeliveryArea(distance)) {
          setCepError('Fora da área de entrega (máximo 50km)');
          setDistanceKm(null);
          return;
        }

        setDistanceKm(distance);
        setCepError(null);
      }
    }
  }, [cepFetcher.data]);

  /* -------------------------- Details step --------------------------- */
  const [date, setDate] = useState<Date | null>(null);
  const [period, setPeriod] = useState<DeliveryPeriod | ''>('');
  const [deliveryType, setDeliveryType] = useState<'portaria' | 'porta' | ''>(
    '',
  );

  // Fetchers to interact with the cart without leaving the page
  const addLineFetcher = useFetcher();
  const attrFetcher = useFetcher();

  const [submitted, setSubmitted] = useState(false);

  // Auto-submit once all details are chosen & not yet submitted
  useEffect(() => {
    if (distanceKm !== null && date && period && deliveryType && !submitted) {
      handleSubmit();
      setSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distanceKm, date, period, deliveryType]);

  const handleSubmit = () => {
    if (distanceKm === null || !date || !period || !deliveryType) return;
    
    // Obtém a variante de frete baseada na distância
    const shippingVariantId = getShippingVariantByDistance(distanceKm);
    
    if (!shippingVariantId) {
      setCepError('Erro ao determinar frete para esta distância');
      return;
    }

    const lines: OptimisticCartLineInput[] = [
      {
        merchandiseId: shippingVariantId,
        quantity: 1,
      },
    ];

    // 1) Add (or attempt to add) the shipping product line
    addLineFetcher.submit(
      {
        action: CartForm.ACTIONS.LinesAdd,
        cartAction: CartForm.ACTIONS.LinesAdd,
        inputs: JSON.stringify({lines}),
      },
      {
        method: 'post',
        action: '/cart',
        encType: 'application/x-www-form-urlencoded',
      },
    );
    // TODO: quando existir action para AttributesUpdate, submeter aqui

    if (onCompleted) onCompleted();
  };

  /* ----------------------------- Render ------------------------------ */
  return (
    <div className="flex flex-col gap-4">
      {/* CEP step */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="cep"
          className="text-label-sm text-text-sub-600 font-medium"
        >
          CEP
        </label>
        <Input.Root>
          <Input.Input
            id="cep"
            name="cep"
            placeholder="00000-000"
            maxLength={9}
            autoComplete="postal-code"
            value={cepInput}
            onChange={(e) => setCepInput(e.target.value)}
            disabled={isValidatingCep}
          />
        </Input.Root>
        {cepError && (
          <span className="text-red-600 text-paragraph-sm">{cepError}</span>
        )}
        {distanceKm !== null && (
          <span className="text-green-600 text-paragraph-sm">
            Distância: {distanceKm.toFixed(1)}km - Frete calculado!
          </span>
        )}
        <Button.Root
          variant="success"
          mode="filled"
          size="medium"
          className="w-full"
          onClick={handleCepValidate}
          disabled={isValidatingCep}
        >
          {isValidatingCep ? 'Calculando...' : 'Calcular Frete'}
        </Button.Root>
      </div>

      {/* Details step */}
      {distanceKm !== null && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-label-sm text-text-sub-600 font-medium">
              Data de entrega (próximos 7 dias)
            </label>
            <Datepicker
              mode="single"
              selected={date ?? undefined}
              onSelect={(d) => setDate(d as Date)}
              fromDate={new Date()}
              toDate={(() => {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                return d;
              })()}
              locale={ptBR}
              {...{
                // Tipagem frouxa para suporte até lib atualizar typings
                formatters: {
                  formatWeekdayName: (date: Date) => {
                    const map = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
                    return map[date.getDay()];
                  },
                },
              } as any}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-sm text-text-sub-600 font-medium">
              Período
            </label>
            <Select.Root
              value={period}
              onValueChange={(v) => setPeriod(v as DeliveryPeriod)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Escolha o período" />
              </Select.Trigger>
              <Select.Content>
                {DELIVERY_PERIODS.map((p) => (
                  <Select.Item key={p} value={p}>
                    {p}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-sm text-text-sub-600 font-medium">
              Tipo de entrega
            </label>
            <Tooltip.Provider>
              <Tooltip.Root open={deliveryType === 'portaria'}>
                <Tooltip.Trigger asChild>
                  <Select.Root
                    value={deliveryType}
                    onValueChange={(v) => setDeliveryType(v as 'portaria' | 'porta')}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Selecione" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="portaria">Receber na portaria</Select.Item>
                      <Select.Item value="porta">Receber na porta</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Tooltip.Trigger>
                <Tooltip.Content variant="dark" size="xsmall">
                  Confirme se sua portaria aceita itens congelados.
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      )}
    </div>
  );
} 