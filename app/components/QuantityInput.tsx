import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { Root as InputRoot, Wrapper as InputWrapper, Input, Icon as InputIcon } from './align-ui/ui/input';
import { Root as Button, Icon as ButtonIcon } from './align-ui/ui/button';
import { useState, useEffect } from 'react';

interface QuantityInputProps {
  defaultValue?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (value: number) => void;
}

export function QuantityInput({
  defaultValue = 1,
  value: externalValue,
  minValue = 1,
  maxValue = 99,
  onChange,
}: QuantityInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  // Use external value if provided, otherwise use internal state
  const currentValue = externalValue ?? internalValue;

  // Update internal value when external value changes
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  const handleIncrement = () => {
    if (currentValue < maxValue) {
      const newValue = currentValue + 1;
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleDecrement = () => {
    if (currentValue > minValue) {
      const newValue = currentValue - 1;
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || minValue;
    if (newValue >= minValue && newValue <= maxValue) {
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <InputRoot size="xsmall" className='w-fit'>
      <InputWrapper>
        <Button
          variant="neutral"
          mode="ghost"
          size="xsmall"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
        >
          <ButtonIcon as={RiSubtractLine} />
        </Button>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={currentValue}
          onChange={handleInputChange}
          min={minValue}
          max={maxValue}
          className="text-center w-full border-none outline-none"
          style={{
            MozAppearance: 'textfield',
            WebkitAppearance: 'none',
            appearance: 'textfield',
          }}
        />
        <Button
          variant="neutral"
          mode="ghost"
          size="xsmall"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
        >
          <ButtonIcon as={RiAddLine} />
        </Button>
      </InputWrapper>
    </InputRoot>
  );
} 