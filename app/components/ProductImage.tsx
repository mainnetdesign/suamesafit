import {useState} from 'react';
import {Image} from '@shopify/hydrogen';

export function ProductImage({
  images,
}: {
  images: Array<{
    id: string;
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  }>;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images?.[selectedIndex];
  const [isLoaded, setIsLoaded] = useState(false);

  if (!images || images.length === 0) {
    return <div className="product-image" />;
  }

  return (
    <div className='sticky top-20' style={{display: 'flex', gap: 24}}>
      {/* Coluna da esquerda: miniaturas */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            style={{
              border: idx === selectedIndex ? '3px solid #EFC76B' : '2px solid transparent',
              borderRadius: 8,
              padding: 0,
              background: 'none',
              cursor: 'pointer',
            }}
          >
            <Image
              alt={img.altText || 'Product Image'}
              aspectRatio="1/1"
              data={img}
              width={64}
              height={64}
              style={{objectFit: 'cover', borderRadius: 8, display: 'block'}}
            />
          </button>
        ))}
      </div>
      {/* Coluna da direita: imagem selecionada */}
      <div className="product-image" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 480, minHeight: 480, maxWidth: 480, maxHeight: 480, position: 'relative'}}>
        {/* Placeholder para manter o espaço */}
        <div style={{width: 480, height: 480, background: '#f5f5f5', borderRadius: 16, position: 'absolute', top: 0, left: 0, zIndex: 0}} />
        {/* Imagem sobre o placeholder */}
        <Image
          alt={selectedImage.altText || 'Product Image'}
          aspectRatio="1/1"
          data={selectedImage}
          key={selectedImage.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          style={{
            maxWidth: '100%',
            maxHeight: 480,
            borderRadius: 16,
            position: 'relative',
            zIndex: 1,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease-in',
          }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
}
