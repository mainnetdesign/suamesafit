import {Link} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

interface ProductProps {
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      altText?: string;
      url: string;
      width: number;
      height: number;
    };
    priceRange?: {
      minVariantPrice: MoneyV2;
    };
  };
}

export function Product({product}: ProductProps) {
  return (
    <div className="product-item rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow min-h-[400px] flex flex-col">
      <Link
        className="flex-1 flex flex-col group no-underline hover:no-underline"
        to={`/products/${product.handle}`}
      >
        {product.featuredImage && (
          <div className="aspect-square overflow-hidden">
            <Image
              alt={product.featuredImage.altText || product.title}
              aspectRatio="1/1"
              data={product.featuredImage}
              loading="lazy"
              sizes="(min-width: 45em) 400px, 100vw"
              className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-150"
            />
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col no-underline">
          <h4 className="text-text-sub-600 text-label-lg mb-2 no-underline">
            {product.title}
          </h4>
          {product.priceRange?.minVariantPrice && (
            <small className="text-paragraph-lg text-text-sub-600 no-underline">
              <Money data={product.priceRange.minVariantPrice} />
            </small>
          )}
        </div>
      </Link>
    </div>
  );
} 