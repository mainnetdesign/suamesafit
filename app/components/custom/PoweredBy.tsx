import React from 'react';
import * as Select from '~/components/align-ui/ui/select';
import { Image } from '@shopify/hydrogen';
import trustfuel from '~/assets/brands/trustfuel.svg';

type PoweredByProps = {
  brand?: string;
  variants?: string[];
};

export default function PoweredBy({
  brand = 'TrustFuel',
  variants = ['TrustFuel'],
}: PoweredByProps) {
  const [selected, setSelected] = React.useState<string>(variants[0] || brand);

  return (
    <div className="flex items-center gap-2 text-label-sm">
      <span className="uppercase text-text-sub-600">powered by</span>
      <Image
        src={trustfuel}
        alt="TrustFuel"
        width={100}
        
      />
    </div>
  );
}


