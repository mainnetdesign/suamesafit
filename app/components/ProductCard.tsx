import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import * as Button from '~/components/align-ui/ui/button';

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
    <div className="product-item bg-bg-white-0 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[400px]">
      <Link
        className="flex flex-col h-full group no-underline hover:no-underline"
        to={`/products/${product.handle}`}
      >
        <div className="relative aspect-square overflow-hidden">
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
          {hasSecondary && (
            <Image
              alt={secondaryImage!.altText || product.title}
              aspectRatio="1/1"
              data={secondaryImage!}
              loading="lazy"
              sizes="(min-width: 45em) 400px, 100vw"
              className="w-full h-full object-cover absolute inset-0 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between no-underline">
          <h4 className="text-text-sub-600 text-label-lg mb-2 no-underline">
            {product.title}
          </h4>
          <div className="flex flex-col gap-2">
            {product.priceRange?.minVariantPrice && (
              <small className="flex gap-2 text-paragraph-md text-blue-500 no-underline">
                a partir de
                <Money data={product.priceRange.minVariantPrice} />
              </small>
            )}
            <Button.Root variant="primary" mode="lighter">
              adicionar ao carrinho
            </Button.Root>
          </div>
        </div>
      </Link>
    </div>
  );
}
