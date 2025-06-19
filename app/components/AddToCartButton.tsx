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
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const linesWithQuantity = lines.map(line => ({
    ...line,
    quantity,
  }));

  return (
    <div className="flex items-center gap-4">
      <QuantityInput
        defaultValue={1}
        minValue={1}
        maxValue={99}
        onChange={setQuantity}
      />
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
