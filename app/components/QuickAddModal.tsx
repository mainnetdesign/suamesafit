import * as React from 'react';
import {Image, Money, getProductOptions} from '@shopify/hydrogen';
import * as Modal from '~/components/align-ui/ui/modal';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {useFetcher} from '@remix-run/react';

interface QuickAddModalProps {
  /** Objeto completo do produto (de preferência `ProductFragment`) */
  product: any;
  /** Elemento que acionará a abertura do modal */
  children: React.ReactNode;
}

/**
 * Componente responsável por exibir um modal de "compra rápida".
 * Ele faz o fetch das informações completas do produto através de um `fetcher`
 * e, quando carregado, renderiza o `ProductForm` para permitir a adição ao carrinho.
 */
export function QuickAddModal({product, children}: QuickAddModalProps) {
  const [open, setOpen] = React.useState(false);
  const fetcher = useFetcher<{product: ProductFragment}>();
  const hasFetched = React.useRef(false);
  const {open: openAside} = useAside();

  // Faz load somente se abrirmos e ainda não tivermos dados completos
  React.useEffect(() => {
    if (
      open &&
      !hasFetched.current &&
      fetcher.state === 'idle'
    ) {
      hasFetched.current = true;
      fetcher.load(`/quick-product/${product.handle}`);
    }
  }, [open, fetcher, product]);

  const fullProduct = (fetcher.data?.product ?? product) as any;
  const selectedVariant =
    fullProduct.selectedOrFirstAvailableVariant ||
    fullProduct.adjacentVariants?.[0] ||
    fullProduct.options?.[0]?.optionValues?.[0]?.firstSelectableVariant ||
    fullProduct.variants?.nodes?.[0] ||
    null;

  // estado de variante selecionada localmente
  const [variantId, setVariantId] = React.useState<string | null>(
    selectedVariant?.id || null,
  );

  const currentVariant = React.useMemo(() => {
    if (!variantId) return selectedVariant;
    if (selectedVariant && selectedVariant.id === variantId) return selectedVariant;
    return (
      fullProduct.adjacentVariants?.find((v: any) => v.id === variantId) ||
      fullProduct.variants?.nodes?.find((v: any) => v.id === variantId) ||
      selectedVariant
    );
  }, [variantId, selectedVariant, fullProduct]);

  const hasOptions = Array.isArray(fullProduct.options) && fullProduct.options.length > 0;

  // construir weightOptions como antes
  const weightOptions: Array<{value:string,variantId:string,available:boolean}> = [];
  if (hasOptions) {
    const opt = fullProduct.options.find((o: any) => o.optionValues.length > 1);
    if (opt) {
      opt.optionValues.forEach((val: any) => {
        if (val.firstSelectableVariant) {
          weightOptions.push({
            value: val.name,
            variantId: val.firstSelectableVariant.id,
            available: val.firstSelectableVariant.availableForSale,
          });
        }
      });
    }
  }

  const isLoading = open && fetcher.state !== 'idle' && !fetcher.data;

  const content = (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content showClose>
        <Modal.Body>
          <div className="flex flex-col items-center gap-4 p-6">
            {(() => {
              const imageData = fullProduct.images?.nodes?.[0] || fullProduct.featuredImage;
              return imageData ? (
                <Image
                  data={imageData}
                  alt={imageData.altText || fullProduct.title}
                  className="w-28 h-28 object-cover rounded-lg"
                  loading="lazy"
                  sizes="112px"
                />
              ) : null;
            })()}
            <h3 className="text-title-h5 text-text-sub-600 text-center">
              {fullProduct.title}
            </h3>
            {currentVariant?.price && (
              <span className="text-title-h5 text-[#2B2B6A]">
                <Money data={currentVariant.price} />
              </span>
            )}
            {isLoading ? (
              <p className="text-paragraph-md text-center opacity-60">carregando…</p>
            ) : currentVariant ? (
              <AddToCartButton
                lines={[
                  {
                    merchandiseId: currentVariant?.id,
                    quantity: 1,
                    selectedVariant: currentVariant,
                  } as any,
                ]}
                onClick={() => {
                  setOpen(false);
                  openAside('cart');
                }}
              >
                adicionar ao carrinho
              </AddToCartButton>
            ) : (
              <p className="text-paragraph-md text-center opacity-60">Produto indisponível</p>
            )}
            {/* Selector */}
            {weightOptions.length > 1 && (
              <div className="flex gap-3 mt-4">
                {weightOptions.map((opt) => {
                  const isSel = opt.variantId === variantId;
                  return (
                    <button
                      key={opt.variantId}
                      disabled={!opt.available}
                      onClick={() => setVariantId(opt.variantId)}
                      className={`px-4 py-2 rounded-full text-label-md transition-colors ${isSel ? 'bg-[#E86F51] text-white' : 'bg-bg-white-0 border border-[#E86F51] text-[#E86F51]'} ${!opt.available ? 'opacity-40' : ''}`}
                    >
                      {opt.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );

  return content;
} 