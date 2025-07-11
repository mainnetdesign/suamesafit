import {type FetcherWithComponents} from '@remix-run/react';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Root as Button} from './align-ui/ui/button';
import {QuantityInput} from './QuantityInput';
import {useState} from 'react';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  quantity: externalQuantity,
  onQuantityChange,
  showQuantityInput = true,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  showQuantityInput?: boolean;
}) {
  // Filtra somente linhas com merchandiseId válido
  const validLines = (Array.isArray(lines) ? lines : []).filter(
    (line) => line && typeof (line as any).merchandiseId === 'string',
  );

  if (validLines.length === 0) {
    return null;
  }

  const [internalQuantity, setInternalQuantity] = useState(1);
  
  // Use external quantity if provided, otherwise use internal state
  const currentQuantity = externalQuantity ?? internalQuantity;
  
  const handleQuantityChange = (newQuantity: number) => {
    if (onQuantityChange) {
      onQuantityChange(newQuantity);
    } else {
      setInternalQuantity(newQuantity);
    }
  };

  const linesWithQuantity = validLines.map(line => ({
    ...line,
    quantity: currentQuantity,
  }));

  return (
    <div className="flex items-center gap-4">
      {showQuantityInput && (
        <QuantityInput
          {...(externalQuantity !== undefined
            ? { defaultValue: externalQuantity }
            : { value: currentQuantity })}
          minValue={1}
          maxValue={99}
          onChange={handleQuantityChange}
        />
      )}
      <CartForm route="/cart" inputs={{lines: linesWithQuantity}} action={CartForm.ACTIONS.LinesAdd}>
        {(fetcher: FetcherWithComponents<any>) => (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <Button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? fetcher.state !== 'idle'}
              variant="primary"
              mode="filled"
            >
              {children}
            </Button>
          </>
        )}
      </CartForm>
    </div>
  );
}
