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
      <div className="product-image" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Image
          alt={selectedImage.altText || 'Product Image'}
          aspectRatio="1/1"
          data={selectedImage}
          key={selectedImage.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          style={{maxWidth: '100%', maxHeight: 480, borderRadius: 16}}
        />
      </div>
    </div>
  );
}
