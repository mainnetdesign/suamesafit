import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  images,
  className,
}: {
  images: Array<{
    id: string;
    url:string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  }>;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images?.[selectedIndex];
  const [isLoaded, setIsLoaded] = useState(false);

  if (!images || images.length === 0) {
    return <div className={`product-image ${className}`} />;
  }

  return (
    <div className={`flex flex-col md:flex-row gap-6 md:sticky top-20 w-full md:w-auto ${className || ''}`}>
      {/* Miniaturas - agora à esquerda no desktop */}
      <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible md:order-first order-last">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className={`rounded-lg p-0 bg-transparent cursor-pointer ${idx === selectedIndex ? 'border-[3px] border-[#EFC76B]' : 'border-2 border-transparent'}`}
          >
            <Image
              alt={img.altText || 'Product Image'}
              aspectRatio="1/1"
              data={img}
              width={64}
              height={64}
              className="object-cover rounded-lg block"
            />
          </button>
        ))}
      </div>
      
      {/* Imagem principal */}
      <div className="product-image flex items-center justify-center relative w-full h-[480px] md:w-[480px] md:h-[480px] overflow-hidden rounded-2xl md:order-last order-first">
        {/* Placeholder para manter o espaço */}
        <div className="absolute inset-0 bg-[#f5f5f5] z-0" />
        {/* Imagem sobre o placeholder */}
        <Image
          alt={selectedImage.altText || 'Product Image'}
          data={selectedImage}
          key={selectedImage.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-[600ms] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
}
