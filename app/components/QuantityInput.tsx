import { RiAddLine, RiSubtractLine } from 'react-icons/ri';
import { Root as InputRoot, Wrapper as InputWrapper, Input, Icon as InputIcon } from './align-ui/ui/input';
import { Root as Button, Icon as ButtonIcon } from './align-ui/ui/button';
import { useState } from 'react';

interface QuantityInputProps {
  defaultValue?: number;
  minValue?: number;
  maxValue?: number;
  onChange?: (value: number) => void;
}

export function QuantityInput({
  defaultValue = 1,
  minValue = 1,
  maxValue = 99,
  onChange,
}: QuantityInputProps) {
  const [value, setValue] = useState(defaultValue);

  const handleIncrement = () => {
    if (value < maxValue) {
      const newValue = value + 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleDecrement = () => {
    if (value > minValue) {
      const newValue = value - 1;
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || minValue;
    if (newValue >= minValue && newValue <= maxValue) {
      setValue(newValue);
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
          disabled={value <= minValue}
        >
          <ButtonIcon as={RiSubtractLine} />
        </Button>
        <Input
          type="number"
          value={value}
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
          disabled={value >= maxValue}
        >
          <ButtonIcon as={RiAddLine} />
        </Button>
      </InputWrapper>
    </InputRoot>
  );
} 