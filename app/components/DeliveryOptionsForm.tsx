import type {OptimisticCartLineInput} from '@shopify/hydrogen';
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
  validateCepLocally,
  DeliveryPeriod,
  DeliveryZone,
} from '~/config/delivery';

interface Props {
  /**
   * Callback triggered after the form successfully updates the cart.
   * Used by the parent component to re-evaluate completion state.
   */
  onCompleted?: () => void;
}

/**
 * Progressive form that:
 * 1. Solicits & validates CEP (postal code)
 * 2. Lets the user pick date / period / delivery type
 * 3. Saves everything as cart attributes + adds the correct shipping item
 */
export function DeliveryOptionsForm({onCompleted}: Props) {
  /* ----------------------------- CEP step ----------------------------- */
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState<string | null>(null);
  const [zone, setZone] = useState<DeliveryZone | null>(null);

  const handleCepValidate = () => {
    const res = validateCepLocally(cepInput);
    if (!res.valid || !res.zone) {
      setCepError(res.message || 'CEP inválido ou fora da área de entrega');
      setZone(null);
      return;
    }
    setCepError(null);
    setZone(res.zone);
  };

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
    if (zone && date && period && deliveryType && !submitted) {
      handleSubmit();
      setSubmitted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, date, period, deliveryType]);

  const handleSubmit = () => {
    if (!zone || !date || !period || !deliveryType) return;
    const lines: OptimisticCartLineInput[] = [
      {
        merchandiseId: zone.shippingVariantId,
        quantity: 1,
      },
    ];

    // 1) Add (or attempt to add) the shipping product line
    addLineFetcher.submit(
      {lines: JSON.stringify(lines)},
      {
        method: 'post',
        action: '/cart?form=LinesAdd', // CartForm uses ACTION param, replicate via querystring
        encType: 'application/x-www-form-urlencoded',
      },
    );

    // 2) Save attributes (all bundled into a single JSON under key `delivery_info`)
    const payload = {
      attributes: JSON.stringify({
        delivery_info: {
          cep: cepInput,
          zoneId: zone.id,
          date: date.toISOString(),
          period,
          deliveryType,
        },
      }),
    };

    attrFetcher.submit(payload, {
      method: 'post',
      action: '/cart?form=AttributesUpdate',
      encType: 'application/x-www-form-urlencoded',
    });

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
          />
        </Input.Root>
        {cepError && (
          <span className="text-red-600 text-paragraph-sm">{cepError}</span>
        )}
        <Button.Root
          variant="success"
          mode="filled"
          size="small"
          className="w-full"
          onClick={handleCepValidate}
        >
          Validar CEP
        </Button.Root>
      </div>

      {/* Details step */}
      {zone && (
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