import {Link, useNavigate} from '@remix-run/react';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {Root as Button} from './align-ui/ui/button';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options flex flex-col gap-2" key={option.name}>
            <p className="text-text-sub-600 text-label-lg">{option.name}</p>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        opacity: available ? 1 : 0.3,
                        padding: 0,
                      }}
                    >
                      <ProductOptionSwatch
                        swatch={swatch}
                        name={name}
                        selected={selected}
                      />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={{
                        opacity: available ? 1 : 0.3,
                        padding: 0,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch
                        swatch={swatch}
                        name={name}
                        selected={selected}
                      />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}
      {selectedVariant && (
        <AddToCartButton
          disabled={!selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={[
            {
              merchandiseId: selectedVariant.id,
              quantity: 1,
              selectedVariant,
            },
          ]}
        >
          {selectedVariant.availableForSale ? 'adicionar ao carrinho' : 'esgotado'}
        </AddToCartButton>
      )}
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
  selected = false,
  ...props
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
  selected?: boolean;
  [key: string]: any;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  return (
    <Button
      variant="primary"
      mode={selected ? 'filled' : 'lighter'}
      size="small"
      type="button"
      aria-label={name}
      {...props}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          style={{width: 24, height: 24, borderRadius: '50%'}}
        />
      ) : color ? (
        <span
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: color,
          }}
        />
      ) : (
        name
      )}
    </Button>
  );
}
