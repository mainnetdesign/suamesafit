import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import * as Button from '~/components/align-ui/ui/button';
import {QuickAddModal} from '~/components/QuickAddModal';

interface ProductProps {
  product: {
    id: string;
    handle: string;
    title: string;
    /** Imagem principal do produto */
    featuredImage?: {
      altText?: string | null;
      url: string;
      width?: number | null;
      height?: number | null;
    } | null;
    /** Segunda imagem do produto, usada no hover */
    secondaryImage?: {
      altText?: string | null;
      url: string;
      width?: number | null;
      height?: number | null;
    } | null;
    priceRange?: {
      minVariantPrice: MoneyV2;
    };
  };
}

export function Product({product}: ProductProps) {
  const fallbackSecondary = (product as any)?.images?.nodes?.[1];
  const secondaryImage = product.secondaryImage || fallbackSecondary;
  const hasSecondary = Boolean(secondaryImage);

  return (
    <div className="product-item bg-bg-white-0 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[400px] flex flex-col">
      <Link
        className="flex flex-col group no-underline hover:no-underline flex-1"
        to={`/products/${product.handle}`}
      >
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden">
          {/* Placeholder quando não há imagem */}
          {!product.featuredImage && (
            <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
              <div className="text-text-sub-400 text-label-md text-center px-4">
                Sem imagem
              </div>
            </div>
          )}

          {/* Imagem principal */}
          {product.featuredImage && (
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading="lazy"
              sizes="(min-width: 45em) 400px, 100vw"
              className={`w-full h-full object-cover transition-all duration-500 ease-in-out ${hasSecondary ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-110'}`}
            />
          )}

          {/* Segunda imagem exibida no hover */}
          {hasSecondary && secondaryImage && (
            <Image
              alt={secondaryImage?.altText || product.title}
              aspectRatio="1/1"
              data={secondaryImage}
              loading="lazy"
              sizes="(min-width: 45em) 400px, 100vw"
              className="w-full h-full object-cover absolute inset-0 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 no-underline flex-1">
          <h4 className="text-text-sub-600 text-label-lg mb-2 no-underline">
            {product.title}
          </h4>
          {product.priceRange?.minVariantPrice && (
            <small className="flex gap-2 text-paragraph-md text-blue-500 no-underline">
              a partir de
              <Money data={product.priceRange.minVariantPrice} />
            </small>
          )}
        </div>
      </Link>
      {/* Botão fora do Link para não acionar navegação - sempre fixo na parte inferior */}
      <div className="p-4 pt-0 mt-auto">
        <QuickAddModal product={product}>
          <Button.Root variant="primary" mode="lighter" className="w-full">
            adicionar ao carrinho
          </Button.Root>
        </QuickAddModal>
      </div>
    </div>
  );
}
