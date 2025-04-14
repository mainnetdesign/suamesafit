'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import * as Button from '~/components/align-ui/ui/button';
import * as DatepickerPrimivites from '~/components/align-ui/ui/datepicker';
import * as Popover from '~/components/align-ui/ui/popover';
import { RiCalendarLine } from '@remixicon/react';

type SingleDatepickerProps = {
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
};

function Datepicker({ value, defaultValue, onChange }: SingleDatepickerProps) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(
    value ?? defaultValue ?? undefined,
  );

  const handleChange = (value: DateRange | undefined) => {
    setRange(value);
    onChange?.(value);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button.Root variant='neutral' mode='stroke'>
        <Button.Icon><RiCalendarLine className='text-bg-strong-950'/></Button.Icon>
          {range?.from ? (
            <>
              {format(range.from, 'LLL dd, y')}
              {range.to && <> - {format(range.to, 'LLL dd, y')}</>}
            </>
          ) : (
            
            <span>Selecione um período</span>
          )}
        </Button.Root>
      </Popover.Trigger>
      <Popover.Content className='p-0' showArrow={false}>
        <DatepickerPrimivites.Calendar
          mode='range'
          selected={range}
          onSelect={handleChange}
        />
      </Popover.Content>
    </Popover.Root>
  );
}

export function DatepickerRangeDemo() {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);

  return <Datepicker value={date} onChange={setDate} />;
}
