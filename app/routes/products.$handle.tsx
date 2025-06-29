import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {Root as Divider} from '~/components/align-ui/ui/divider';
import * as Button from '~/components/align-ui/ui/button';
import React from 'react';
import {RiArrowDownSLine, RiArrowUpSLine} from 'react-icons/ri';
import {Product as ProductCard} from '~/components/ProductCard';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const {context, params, request} = args;
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // Buscar produtos relacionados da mesma coleção
  let relatedProducts = [];
  if (product?.collections?.nodes?.length) {
    const collectionHandle = product.collections.nodes[0].handle;
    const result = await storefront.query(
      `#graphql
      fragment MoneyProductItem on MoneyV2 {
        amount
        currencyCode
      }
      fragment ProductItem on Product {
        id
        handle
        title
        featuredImage {
          altText
          url
          width
          height
        }
        priceRange {
          minVariantPrice {
            ...MoneyProductItem
          }
        }
      }
      query CollectionProducts($handle: String!, $first: Int) {
        collection(handle: $handle) {
          products(first: $first) {
            nodes {
              ...ProductItem
            }
          }
        }
      }
    `,
      {
        variables: {handle: collectionHandle, first: 8},
      },
    );
    relatedProducts =
      result.collection?.products?.nodes
        ?.filter((p: any) => p.id !== product.id)
        .slice(0, 4) || [];
  }

  return {
    product,
    relatedProducts,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product, relatedProducts} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const [showNutrition, setShowNutrition] = React.useState(true);
  const [showDescription, setShowDescription] = React.useState(true);

  return (
    <div className="flex flex-col gap-8">
      <div className='py-[100px] w-full flex justify-center items-center'>
      <div className="max-w-[1200px] w-full flex  gap-8 justify-center items-start">
        <ProductImage
          images={
            product.images.nodes.filter((img: {id: string}) => !!img.id) as {
              id: string;
              url: string;
              altText?: string | null;
            }[]
          }
        />
        <div className="flex flex-col gap-8 max-w-[400px]">
          <div className="flex flex-col gap-4">
            <h3 className="text-text-sub-600 text-title-h3">{title}</h3>
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
          />
          <div className="flex flex-col gap-2 text-paragraph-md">
            <div className="flex items-center gap-4 justify-between">
              <p className="text-text-sub-600 text-title-h5 mb-0">descrição</p>
              <Button.Root
                variant="primary"
                mode="lighter"
                size="xsmall"
                onClick={() => setShowDescription((prev) => !prev)}
                className="w-fit"
              >
                {showDescription ? (
                  <Button.Icon as={RiArrowDownSLine} />
                ) : (
                  <Button.Icon as={RiArrowUpSLine} />
                )}
              </Button.Root>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${showDescription ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              {showDescription && (
                <div
                  className="text-text-sub-600"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 text-paragraph-md">
            <div className="flex items-center gap-4 justify-between">
              <p className="text-text-sub-600 text-title-h5 mb-0">
                tabela nutricional
              </p>
              <Button.Root
                variant="primary"
                mode="lighter"
                size="xsmall"
                onClick={() => setShowNutrition((prev) => !prev)}
                className="w-fit"
              >
                {showNutrition ? (
                  <Button.Icon as={RiArrowDownSLine} />
                ) : (
                  <Button.Icon as={RiArrowUpSLine} />
                )}
              </Button.Root>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${showNutrition ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              {showNutrition && (
                <>
                  <table className="w-full border border-text-sub-600 border-separate border-spacing-0 rounded-lg overflow-hidden mt-4">
                    <thead>
                      <tr className="bg-[#2B2B6A] text-white">
                        <th className="p-2 text-label-md text-left border-b border-text-sub-600">
                          item
                        </th>
                        <th className="p-2 text-label-md text-left border-b border-text-sub-600">
                          Total
                        </th>
                        <th className="p-2 text-label-md text-left border-b border-text-sub-600">
                          VD*
                        </th>
                      </tr>
                    </thead>
                    <tbody className=" text-[#2B2B6A]">
                      <tr>
                        <td className="p-2 text-paragraph-md border-b border-text-sub-600">
                          peso da porção
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          100g
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          5%
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-paragraph-md border-b border-text-sub-600">
                          valor energético
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          120kcal
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          6%
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-paragraph-md border-b border-text-sub-600">
                          proteínas
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          15g
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          20%
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-paragraph-md border-b border-text-sub-600">
                          carboidratos
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          18g
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          6%
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-paragraph-md border-b border-text-sub-600">
                          gorduras
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          2g
                        </td>
                        <td className="p-2 font-bold border-b border-text-sub-600">
                          4%
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2 text-paragraph-md">fibras</td>
                        <td className="p-2 font-bold">5g</td>
                        <td className="p-2 font-bold">20%</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-paragraph-xs text-text-sub-600 mt-2">
                    Valores diários de referência com base em uma dieta de 2000
                    kcal ou 8400kJ. Seus valores diários podem ser maiores ou
                    menores dependendo de suas necessidades energéticas. (**) VD
                    não estabelecido. (***) Informação Não Disponível no
                    momento.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: selectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: selectedVariant?.id || '',
                variantTitle: selectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
        />
      </div>
      </div>
      
      {/* <div className="w-full flex justify-center p-6">
        <div className="max-w-[1200px] bg-yellow-500 p-6 rounded-lg justify-center items-center w-full flex flex-col gap-4">
          <p className="text-title-h3 text-text-sub-600 text-center">
            passo a passo para esquentar sua marmita
          </p>
          <div className="flex flex-col gap-4">
            <div className="self-stretch h-80 inline-flex justify-center items-center gap-3">
              <div className="w-52 h-80 inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch h-52 relative">
                  <div className="w-52 h-52 left-0 top-0 absolute rounded-lg overflow-hidden">
                    <div
                      data-svg-wrapper
                      className="left-[16.51px] top-[-3.21px] absolute"
                    >
                      <svg
                        width="124"
                        height="177"
                        viewBox="0 0 124 177"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M115.195 37.2842C121.934 55.0694 128.91 61.3919 119.266 89.6494C111.66 111.858 84.0479 154.172 64.8491 169.935C39.5961 190.729 -1.18709 159.747 1.00203 109.779C2.25705 81.5019 40.869 4.73937 90.6507 1.01523C113.502 -0.697429 104.23 4.29798 112.244 12.8651C114.461 15.2245 115.759 16.0403 116.58 18.1723L117.474 23.6119C117.474 23.6119 117.621 24.257 117.696 24.5094C119.719 31.8854 121.639 29.115 115.141 37.256"
                          fill="#FFF0D1"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[19.51px] top-[36.50px] absolute"
                    >
                      <svg
                        width="171"
                        height="133"
                        viewBox="0 0 171 133"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M73.8048 41.1742L73.6554 41.1825C73.6554 41.1825 73.65 41.1825 73.65 41.1797C71.1857 32.7689 70.4521 24.4806 71.452 16.3148C72.0307 11.5902 72.9653 6.6094 74.2504 1.36692C74.3971 0.776683 74.9351 0.375771 75.5274 0.417533L75.6035 0.420316C76.1387 0.45651 76.5191 0.966003 76.4158 1.50612C75.4404 6.57042 74.84 9.63851 74.6145 10.7104C72.479 20.7972 72.2154 30.9425 73.8266 41.1463C73.8293 41.1602 73.8184 41.1714 73.8048 41.1742Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M35.2976 53.5356C35.2759 53.6442 35.1373 53.6693 35.0802 53.5774C32.8849 50.0193 30.869 46.116 28.6003 41.937C26.0709 37.2764 22.748 32.6325 19.5964 28.9046C14.877 23.328 12.19 20.1123 11.5352 19.2604C11.1114 18.7119 10.731 18.0911 11.1901 17.3951C11.9672 16.2229 13.8392 18.1412 14.3336 18.7593C16.7327 21.7494 19.341 24.9845 22.1584 28.4647C25.4324 32.51 28.1873 36.8115 30.418 41.3663C31.8063 44.2005 33.0534 47.0291 34.1592 49.8522C34.6618 51.1357 35.0368 52.2661 35.2813 53.2377C35.3085 53.3491 35.3139 53.4493 35.2976 53.5356Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M165.377 31.0873C165.379 31.1012 165.379 31.1124 165.382 31.1207C165.385 31.1235 165.374 31.1346 165.36 31.1486C163.896 32.6102 162.413 33.9076 160.907 35.0435C158.326 36.9924 155.422 37.4796 152.265 37.914C148.067 38.4931 144.098 38.5404 139.626 38.0086C135.433 37.5075 131.127 37.1372 126.622 37.0871C126.296 37.0843 125.353 36.959 123.794 36.7168C123.014 36.5943 122.085 36.3827 121.006 36.082C119.107 35.553 117.463 35.1855 116.075 34.9767C114.067 34.676 111.576 34.5424 110.609 36.8142C108.845 40.9514 107.362 44.117 106.158 46.3136C103.384 51.3668 101.58 54.6966 99.3169 59.772C98.3035 62.0439 97.6868 64.3547 97.4613 66.7073C97.2874 68.5086 97.2195 71.134 97.3988 73.4754C97.6161 76.3124 97.8552 77.8103 97.6053 80.1127C97.2847 83.0667 96.9777 85.1937 97.3689 87.6076C97.6542 89.3783 100.368 87.8164 101.075 87.2122C101.143 87.1538 101.203 87.0842 101.254 87.009C102.398 85.2995 103.121 83.8379 103.422 82.6268C103.843 80.9257 104.148 78.6956 104.33 75.9338C104.381 75.1125 104.229 74.5946 103.89 73.9153C103.786 73.7065 103.773 73.4643 103.849 73.2443C104.036 72.707 105.05 69.9702 106.886 65.0396C107.465 63.4777 108.943 62.1357 109.473 61.1223C110.516 59.1372 111.508 57.2079 112.448 55.3397C112.733 54.7745 113.44 53.8808 114.562 52.6586C115.149 52.0183 115.782 52.1992 116.309 52.7087C116.385 52.7811 116.393 52.9008 116.333 52.9871C114.475 55.6571 112.801 58.5108 111.31 61.5511C111.247 61.6791 111.22 61.7794 111.228 61.849C111.247 61.9854 111.386 62.0689 111.511 62.0188C113.537 61.1975 115.502 60.0087 117.404 58.4579C119.333 56.8849 120.686 55.8102 121.46 55.2395C121.658 55.0919 121.794 54.9694 121.87 54.8692C122.028 54.6632 121.946 54.3597 121.71 54.2623C120.001 53.5467 118.471 52.8312 117.116 52.1157C116.841 51.9709 116.703 51.6508 116.787 51.3501C117.116 50.1585 120.129 51.4392 121.161 51.8206C123.066 52.5194 124.78 53.6414 126.304 55.181C127.562 56.4561 128.807 58.6472 128.04 60.4235C127.929 60.6796 127.663 60.83 127.391 60.7882C126.706 60.6824 126.492 60.1423 126.12 59.4546C126.087 59.3962 126.008 59.3906 125.97 59.4435C124.919 60.9302 124.063 62.3779 123.408 63.7867C123.237 64.157 123.02 64.5022 122.761 64.8168C119.808 68.3833 116.523 71.9414 112.902 75.4911C111.953 76.4238 110.829 77.7546 109.533 79.4863C107.356 82.3957 105.501 86.1598 106.02 89.8655C106.066 90.1912 106.297 90.4585 106.607 90.5476C108.326 91.032 110.304 89.9212 111.456 88.6266C111.981 88.0391 112.997 86.8921 114.51 85.1798C115.317 84.2694 116.287 83.4815 117.159 82.7827C117.765 82.2955 119.808 80.6779 123.289 77.93C125.215 76.4071 126.63 75.4187 127.535 74.9621C130.581 73.4225 134.757 72.3868 137.167 71.6156C138.935 71.0477 140.745 70.1902 142.595 69.0431C143.522 68.4668 144.934 67.2557 146.839 65.4071C147.95 64.3296 149.303 63.0378 150.898 61.5344C152.403 60.1145 154.987 59.2709 156.957 58.8338C160.177 58.1238 164.681 57.1717 170.466 55.9828C170.49 55.9773 170.509 56.0079 170.495 56.0302C170.433 56.1304 170.346 56.2139 170.229 56.278C168.849 57.0492 167.368 57.6895 165.79 58.2046C163.323 59.0092 160.875 59.8221 158.446 60.6379C155.813 61.5232 153.539 62.3334 151.539 64.2377C149.461 66.22 147.334 68.1995 145.421 69.8087C142.883 71.9442 139.965 73.4643 136.667 74.3691C133.262 75.3018 130.532 75.9895 127.818 77.4289C126.91 77.9105 125.628 78.8376 123.971 80.2102C121.892 81.9336 119.403 83.9103 116.507 86.1459C116.176 86.4021 115.306 87.3236 113.902 88.9133C112.671 90.3026 111.777 91.1907 111.223 91.5749C109.791 92.5661 108.114 93.0839 106.199 93.1285C106.074 93.1313 105.971 93.2343 105.965 93.3623L105.906 94.4676C105.9 94.5762 105.971 94.6737 106.074 94.6987C107.65 95.069 109.231 95.6982 110.258 96.9594C110.731 97.5413 111.214 98.3264 111.706 99.3176C113.247 102.419 114.654 105.103 115.931 107.372C116.14 107.745 116.398 108.026 116.7 108.218C117.713 108.864 119.767 111.17 118.735 112.648C117.219 114.817 114.744 115.268 112.369 115.83C111.554 116.022 111.212 116.448 110.894 117.225C108.894 122.069 107.938 124.706 106.044 127.98C104.379 130.856 101.613 131.908 98.4774 131.842C90.8292 131.68 84.9606 131.7 76.4756 132.073C72.2969 132.256 68.1971 132.371 64.1787 132.412C62.4969 132.432 61.1276 132.318 59.2882 132.326C57.9841 132.334 55.8241 132.245 52.8083 132.062C46.7468 131.691 41.6851 131.051 34.814 130.422C33.2843 130.282 29.3312 130.196 22.9545 130.163C22.2372 130.157 21.3624 130.043 20.7701 129.99C17.1484 129.662 15.5128 127.217 14.1815 124.116C12.7578 120.8 11.8259 118.472 11.3885 117.13C11.057 116.114 10.4973 115.613 9.46217 115.36C7.79668 114.95 5.98991 114.769 4.32714 115.064C3.46587 115.215 2.7486 115.376 2.00415 114.892C-0.139515 113.494 0.0289353 110.819 2.37638 109.769C2.46875 109.727 2.50679 109.613 2.45245 109.524C1.80038 108.433 2.23238 107.667 2.94693 106.762C5.40848 103.641 7.75049 100.598 9.97295 97.636C11.5732 95.5061 13.1219 94.2644 15.4231 93.6547C18.2922 92.8946 21.5471 92.5327 24.9949 92.0928C26.5844 91.8895 27.9021 91.7921 28.9427 91.7977C30.0648 91.806 34.3222 91.7364 41.7204 91.5944C44.6547 91.536 47.0837 91.5499 49.01 91.6362C55.2617 91.9146 62.918 91.8979 68.1862 91.7782C71.2156 91.7086 74.1119 90.4697 77.307 89.2725C79.6952 88.376 81.5536 87.1593 83.6782 85.9065C84.784 85.2578 85.9251 84.4727 87.1043 83.5511C89.3621 81.7944 90.6961 80.7392 91.1118 80.3884C92.4866 79.2358 93.644 78.601 95.2497 77.4372C95.4589 77.2869 95.5649 77.028 95.5295 76.769C94.997 72.9854 94.9454 69.1211 95.3719 65.1704C95.4643 64.3213 95.6545 63.4805 95.9425 62.648C97.0184 59.5409 98.5399 56.0831 100.51 52.2716C103.373 46.7285 106.017 42.6275 108.027 37.165C108.997 34.5313 110.951 32.4209 113.828 32.4989C115.431 32.5406 116.689 32.6381 118.279 33.0084C119.27 33.2394 120.352 33.49 121.523 33.7656C124.234 34.4032 126.848 34.6398 129.532 34.7122C133.787 34.8236 136.346 35.1911 141.612 35.8593C143.212 36.0625 145.089 36.185 147.241 36.224C153.506 36.3354 159.723 33.7684 165.287 31.0344C165.328 31.0149 165.374 31.0428 165.377 31.0873ZM106.397 77.2674C106.384 77.5068 106.647 77.6572 106.84 77.5207C108.815 76.137 110.342 74.3357 111.424 72.1168C112.16 70.5994 112.736 68.2691 113.399 66.969C114.078 65.6354 114.66 64.8447 116.151 64.2906C117.985 63.6113 120.265 62.5756 121.623 61.5873C122.544 60.9191 124.272 58.4551 124.337 56.793C124.354 56.3838 123.968 56.0831 123.587 56.2111C123.185 56.3448 122.775 56.6037 122.354 56.9907C118.998 60.0699 115.369 62.3974 111.459 63.9733C110.655 64.299 109.986 64.9031 109.451 65.7857C109.383 65.8999 109.332 66.0251 109.296 66.1532C108.601 68.7369 107.739 71.0226 106.71 73.0077C106.65 73.1246 106.615 73.2555 106.607 73.3863L106.397 77.2674ZM113.812 71.8384C113.796 71.8801 113.847 71.9163 113.877 71.8829C115.673 69.8477 117.447 67.8682 119.194 65.9388C119.42 65.691 119.588 65.4266 119.697 65.1454C119.718 65.0869 119.667 65.0284 119.607 65.0451C118.583 65.3597 116.257 65.9416 115.86 66.8409C115.431 67.8125 114.749 69.4802 113.812 71.8384ZM100.684 90.3249C100.154 90.4891 99.8114 90.5977 99.6539 90.645C98.0373 91.1239 96.3881 90.6868 95.6953 89.0581C95.66 88.9746 95.6436 88.8883 95.6491 88.7992C95.7442 87.3013 95.5975 85.9399 95.2089 84.7177C95.0894 84.3363 95.0704 83.9298 95.16 83.5372C95.467 82.1618 95.6735 81.3712 95.5404 80.394C95.5241 80.2798 95.3991 80.2241 95.3067 80.2854C94.364 80.9229 91.503 83.0277 86.7239 86.5997C84.9199 87.9472 83.325 88.9579 81.9367 89.6288C78.478 91.3049 74.8617 93.354 71.4411 93.9331C70.5934 94.0751 69.6072 94.1141 68.4824 94.05C68.1726 94.0305 66.9147 93.9943 64.7058 93.9414C63.562 93.9164 62.3067 93.9192 60.9347 93.9526C56.6256 94.0611 52.4958 94.0333 48.5454 93.8635C44.6711 93.6992 41.6878 93.6296 39.5958 93.6547C33.931 93.7271 30.1816 93.7772 28.3449 93.805C27.106 93.8245 26.8696 94.6848 25.9676 95.3084C24.0522 96.6309 22.2807 98.1677 20.6587 99.9245C18.3846 102.38 16.2844 104.861 14.3581 107.369C13.6626 108.274 12.8774 109.065 12.0922 109.867C12.0161 109.945 12.0324 110.073 12.1248 110.125C12.6872 110.457 13.2931 110.682 13.937 110.808C16.9582 111.398 19.5013 111.381 22.4274 111.643C24.294 111.81 25.7502 111.763 27.5135 111.966C29.5567 112.2 32.2927 112.113 34.382 112.397C36.0502 112.626 37.626 112.57 39.7371 112.782C41.2423 112.932 42.5002 112.912 44.3287 112.954C45.0976 112.971 45.5079 113.104 46.2713 113.252C46.4805 113.291 46.6925 113.311 46.9044 113.313C48.108 113.319 51.5775 113.324 57.3184 113.327C58.3726 113.327 59.3779 113.567 60.3152 113.589C65.635 113.723 71.1124 113.745 76.7446 113.656C77.6031 113.642 78.7361 113.931 79.7441 113.887C82.2464 113.778 85.6643 113.631 90.0006 113.444C90.8836 113.405 91.9024 113.118 92.5952 113.01C92.7963 112.979 93.0001 112.96 93.2038 112.957C94.527 112.946 95.3176 112.896 95.5757 112.807C96.8771 112.364 98.059 111.673 99.1268 110.732C99.3088 110.568 99.7354 109.822 100.406 108.488C100.461 108.383 100.491 108.268 100.496 108.152C100.61 106.2 100.189 103.973 100.034 101.511C99.8033 97.842 100.059 94.1475 100.798 90.4307C100.811 90.3611 100.749 90.3026 100.684 90.3249ZM103.721 86.6554C103.64 86.7529 103.58 86.867 103.539 86.9979C101.822 92.786 101.689 98.9306 102.382 104.933C102.395 105.036 102.534 105.056 102.569 104.958C103.311 102.912 103.618 101.105 103.626 98.6438C103.64 95.0857 103.71 91.1072 103.843 86.7055C103.846 86.6387 103.765 86.6053 103.721 86.6554ZM11.057 108.238C11.1032 108.235 11.1548 108.199 11.2092 108.126C14.1869 104.103 17.2489 100.328 20.3979 96.8007C21.3325 95.7567 22.3106 95.0606 23.3295 94.7182C23.3811 94.7015 23.411 94.6458 23.3947 94.5901L23.3892 94.5706C23.3729 94.515 23.3159 94.4816 23.2588 94.4955C21.9764 94.8435 20.4006 95.0606 19.3138 95.701C18.3221 96.2884 17.5016 97.029 16.8523 97.9227C14.6216 100.988 12.6627 104.379 10.9701 108.101C10.9402 108.165 10.9864 108.238 11.057 108.238ZM16.7707 95.2917C14.9667 95.4114 13.4724 96.1854 12.2878 97.6137C8.27486 102.455 6.19368 104.777 4.33258 107.497C4.26465 107.598 4.29454 107.737 4.39778 107.798L7.75049 109.783C7.8646 109.85 8.00588 109.791 8.04392 109.663C8.45418 108.28 9.06006 106.865 9.86427 105.423C10.9511 103.477 11.9563 101.793 12.8774 100.37C13.9859 98.6577 15.328 97.068 16.9012 95.6035C17.0234 95.4894 16.9365 95.2806 16.7707 95.2917ZM105.971 96.8842L105.908 99.1255C105.903 99.3315 105.96 99.5319 106.069 99.7073L112.608 110.153C112.684 110.276 112.839 110.309 112.959 110.231L114.578 109.168C114.673 109.106 114.703 108.978 114.646 108.881C111.72 103.694 109.628 99.969 108.37 97.7083C107.908 96.8787 106.517 97.0234 106.142 96.7896C106.069 96.745 105.973 96.7979 105.971 96.8842ZM100.477 112.225C100.404 112.294 100.461 112.417 100.559 112.406C102.537 112.189 104.944 111.891 107.78 111.515C108.43 111.428 109.041 111.312 109.617 111.158C109.785 111.114 109.87 110.925 109.796 110.763C108.517 108.026 107.066 105.362 105.444 102.775C105.414 102.728 105.343 102.736 105.324 102.789C104.327 105.649 103.064 108.424 101.537 111.117C101.455 111.264 101.349 111.398 101.227 111.512L100.477 112.225ZM7.47065 111.033C7.58747 111.412 7.73419 111.687 7.90807 111.86C8.02219 111.971 7.91894 112.166 7.76408 112.13C6.661 111.874 5.61226 111.621 4.61514 111.373C3.80277 111.17 3.21863 111.467 2.86543 112.266C2.77033 112.484 2.85999 112.737 3.0692 112.837C3.72126 113.155 4.26193 113.169 4.8814 112.901C5.11777 112.798 5.29437 112.756 5.40577 112.776C10.5055 113.625 14.1788 114.157 16.4284 114.374C34.8466 116.145 52.7947 116.479 72.3323 116.632C81.8905 116.704 92.2638 116.225 100.11 115.783C104.357 115.541 108.758 114.786 113.32 113.517C114.812 113.102 116.893 112.709 116.882 111.061C116.882 110.863 116.665 110.746 116.507 110.86L115.219 111.785C115.127 111.852 115.029 111.905 114.926 111.944C110.693 113.53 105.944 114.349 101.463 114.694C97.5401 114.995 91.9051 115.287 84.5558 115.568C73.1256 116.006 60.1794 115.666 48.6215 115.396C42.7339 115.259 37.7564 115.048 33.6919 114.767C26.5735 114.271 20.7674 113.803 16.2735 113.366C13.7712 113.121 11.2988 112.868 8.97312 112.208C8.75848 112.147 8.59003 111.98 8.51939 111.765C8.37811 111.334 8.07653 111.041 7.61464 110.888C7.5277 110.86 7.44348 110.944 7.47065 111.033ZM13.3392 116.167C13.2659 116.139 13.198 116.214 13.2306 116.287C14.1625 118.439 15.1134 120.755 16.0779 123.233C16.6023 124.581 17.469 126.076 18.6753 126.883C19.466 127.412 21.1396 127.601 21.9302 127.599C29.861 127.568 37.4168 127.824 44.9808 128.754C50.1701 129.392 55.5823 129.893 60.2391 129.921C67.7787 129.965 75.6143 129.781 83.7407 129.369C87.0146 129.205 91.4297 129.222 96.9858 129.425C97.0972 129.428 98.1405 129.353 100.116 129.197C101.072 129.121 101.789 128.921 102.265 128.601C103.77 127.585 104.941 125.767 105.514 124.369C106.598 121.727 107.625 119.363 108.593 117.278C108.639 117.18 108.56 117.069 108.454 117.083C104.572 117.643 100.681 117.993 96.782 118.133C90.5331 118.353 84.7541 118.567 78.9372 118.598C70.4195 118.639 60.7418 118.617 49.8984 118.531C46.7115 118.506 43.9619 118.436 41.6471 118.322C36.1915 118.057 30.3555 117.913 24.9922 117.545C21.3488 117.297 18.5449 117.105 16.586 116.972C15.3226 116.888 14.4668 116.607 13.3392 116.167Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M62.1899 62.1107C60.3234 56.6789 58.647 51.5617 57.1663 46.7591C56.8919 45.871 56.631 44.8436 56.3784 43.6799C55.9219 41.5723 55.5687 39.757 55.6529 37.8861C55.6665 37.5771 55.9273 37.3237 56.2615 37.2959C56.9924 37.2374 57.4054 38.8299 57.639 39.6485C58.0438 41.0656 58.6117 43.4516 59.3371 46.8064C60.4157 51.7872 61.421 56.8793 62.3529 62.0884C62.3584 62.1246 62.3366 62.1608 62.304 62.1691H62.3013C62.2551 62.1831 62.2062 62.1552 62.1899 62.1107Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M80.7258 45.4385C81.0096 44.0462 80.6944 42.8008 80.0216 42.6568C79.3489 42.5128 78.5735 43.5247 78.2896 44.917C78.0058 46.3092 78.3211 47.5546 78.9938 47.6986C79.6665 47.8426 80.4419 46.8307 80.7258 45.4385Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M48.4325 58.8732C47.2006 57.4711 45.767 56.7357 45.2307 57.2306C44.6943 57.7255 45.2582 59.2633 46.4902 60.6653C47.7221 62.0674 49.1557 62.8028 49.692 62.3079C50.2284 61.813 49.6645 60.2752 48.4325 58.8732Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M118.888 90.6995C119.397 90.491 119.673 89.9749 119.506 89.5466C119.339 89.1183 118.791 88.94 118.283 89.1485C117.774 89.3569 117.498 89.873 117.665 90.3013C117.832 90.7296 118.38 90.9079 118.888 90.6995Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M116.263 97.6387V97.636C116.254 97.6053 116.268 97.5747 116.298 97.5636C120.773 95.8597 125.408 94.6096 130.141 95.5869C130.241 95.6063 130.309 95.701 130.301 95.8068C130.29 95.9098 130.209 95.9906 130.105 95.9933C125.451 96.1131 120.862 96.6782 116.333 97.6833C116.303 97.6916 116.271 97.6721 116.263 97.6387Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M125.22 101.202C127.285 100.793 129.388 100.891 131.526 101.492C131.757 101.556 131.994 101.734 132.238 102.021C132.377 102.185 132.339 102.439 132.157 102.55C131.882 102.72 131.339 102.748 131.075 102.695C130.165 102.508 128.793 102.285 126.959 102.021C126.451 101.949 125.864 101.804 125.199 101.589C125.006 101.528 125.022 101.241 125.22 101.202Z"
                          fill="#2C2D74"
                        />
                        <path
                          d="M127.049 110.028C127.033 110.022 127.024 110.003 127.027 109.986C127.033 109.97 127.049 109.958 127.065 109.961C130.684 110.412 134.42 111.359 137.542 113.324C137.982 113.603 138.324 113.923 138.569 114.282C138.661 114.419 138.525 114.597 138.373 114.536L127.049 110.028Z"
                          fill="#2C2D74"
                        />
                      </svg>
                    </div>
                    <div className="w-44 h-6 left-[16.01px] top-[244.22px] absolute" />
                    <div className="w-[708px] h-[522px] left-[-224.49px] top-[-114.50px] absolute overflow-hidden">
                      <div className="w-24 h-32 left-[56.20px] top-[97.55px] absolute bg-indigo-900" />
                      <div className="w-6 h-2.5 left-[195.11px] top-[263.43px] absolute origin-top-left rotate-[-132deg] bg-indigo-900" />
                      <div
                        data-svg-wrapper
                        className="left-[280.90px] top-[249.80px] absolute"
                      >
                        <svg
                          width="3"
                          height="3"
                          viewBox="0 0 3 3"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.02912 2.60452C0.729116 2.82452 0.31912 2.53451 0.40912 2.17451C0.70912 1.02451 0.959111 0.394508 1.14911 0.284508C1.56911 0.0645084 2.07911 0.374516 2.05911 0.854516C2.03911 1.54452 1.69912 2.12452 1.02912 2.60452Z"
                            fill="#2C2D74"
                          />
                        </svg>
                      </div>
                      <div className="w-5 h-6 left-[434.67px] top-[270.03px] absolute bg-white" />
                      <div className="w-80 h-32 left-[60.11px] top-[324.69px] absolute bg-white" />
                      <div className="w-1.5 h-16 left-[391.17px] top-[347.57px] absolute bg-white" />
                      <div className="w-2 h-1.5 left-[447.75px] top-[357.97px] absolute origin-top-left rotate-[-21.80deg] bg-indigo-900" />
                      <div className="w-11 h-12 left-[56.13px] top-[375.81px] absolute bg-white" />
                      <div className="w-12 h-14 left-[31.60px] top-[378.68px] absolute bg-white" />
                      <div className="w-12 h-2 left-[443.69px] top-[378.51px] absolute bg-indigo-900" />
                      <div className="w-8 h-12 left-[405.59px] top-[384px] absolute bg-white" />
                      <div className="w-7 h-1.5 left-[476.09px] top-[399.02px] absolute bg-indigo-900" />
                      <div className="w-9 h-9 left-[385.48px] top-[405.45px] absolute bg-white" />
                      <div className="w-11 h-4 left-[483.32px] top-[431.37px] absolute bg-indigo-900" />
                      <div className="w-96 h-5 left-[26.19px] top-[434.44px] absolute bg-white" />
                      <div className="w-80 h-12 left-[64.45px] top-[453.64px] absolute bg-white" />
                    </div>
                  </div>
                </div>
                <div className="text-text-sub-600 text-label-xl">passo 01</div>
                <div className="text-text-sub-600 text-paragraph-md">
                  ainda congelada, descole parcialmente o selo transparente,
                  deixando a sua marmitinha entreaberta.
                </div>
              </div>
              <div className="w-52 h-80 inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch h-52 relative">
                  <div className="w-52 h-52 left-0 top-0 absolute rounded-lg overflow-hidden">
                    <div
                      data-svg-wrapper
                      className="left-[21.99px] top-[12.50px] absolute"
                    >
                      <svg
                        width="90"
                        height="166"
                        viewBox="0 0 90 166"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M20.601 79.7445C20.8949 86.9883 -2.05351 99.1142 0.539433 114.091C1.95464 122.263 8.62775 124.046 16.7161 121.929C24.0199 120.012 31.0012 112.433 36.7936 108.667C37.3148 115.878 30.2405 146.367 31.4661 155.9C32.4651 163.614 41.2879 166.64 49.9411 165.837C59.1987 164.979 67.9844 159.779 74.2491 152.378C82.826 142.248 87.2328 123.782 88.6605 108.209C90.3745 89.5494 86.6426 68.5743 71.5787 57.6859C67.3745 54.6516 61.6689 53.52 55.2555 54.6055C47.3646 55.9393 45.5925 59.5986 45.2188 51.7388C45.0258 47.7128 45.8955 43.5824 46.0702 39.5519C46.4841 30.091 46.5479 9.62281 39.1999 2.58567C33.3354 -3.03488 22.2757 2.71505 15.8744 8.94985C-0.897319 25.2935 1.70944 48.2988 4.12078 66.621C4.59068 70.1848 7.36147 75.1434 9.84852 77.0676C13.3151 79.7482 15.6836 79.2136 20.5959 79.748"
                          fill="#FFF0D1"
                        />
                      </svg>
                    </div>
                    <div
                      data-svg-wrapper
                      className="left-[-1.50px] top-[17.50px] absolute"
                    >
                      <svg
                        width="158"
                        height="107"
                        viewBox="0 0 158 107"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M77.033 30.5636C70.1658 32.8874 52.0631 14.2873 38.4241 20.9967C30.9828 24.6579 31.1525 31.5631 35.4638 38.7267C39.3621 45.1939 48.6016 49.7559 53.8479 54.2518C47.0758 56.7845 15.8287 58.5911 7.02763 62.4541C-0.0920449 65.587 -0.508453 74.905 2.70097 82.981C6.13445 91.6211 13.5993 98.5851 22.4662 102.51C34.6034 107.883 53.5622 106.907 68.907 103.887C87.2927 100.272 106.365 90.7788 112.566 73.2565C114.292 68.3676 113.77 62.5743 110.921 56.727C107.417 49.532 103.406 48.8631 110.842 46.2892C114.651 44.9692 118.859 44.6394 122.775 43.671C131.969 41.4013 151.625 35.6932 156.306 26.6596C160.045 19.4486 151.411 10.458 143.625 6.07374C123.216 -5.41117 101.879 3.57439 84.9792 11.0524C81.6923 12.5078 77.7158 16.5639 76.5706 19.4925C74.9758 23.5741 76.1563 25.6959 77.0282 30.5597"
                          fill="#FFF0D1"
                        />
                      </svg>
                    </div>
                    <div className="w-44 h-6 left-[16.01px] top-[244.22px] absolute" />
                    <div
                      data-svg-wrapper
                      className="left-[37.50px] top-[26.50px] absolute"
                    >
                      <svg
                        width="136"
                        height="153"
                        viewBox="0 0 136 153"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M51.1698 51.0182C51.1797 51.0753 51.1031 51.1051 51.0734 51.0554C50.6605 50.3722 50.4578 50.0318 50.2896 49.2939C50.0523 48.2578 49.6394 47.3285 49.3922 46.4366C48.5911 43.5445 48.1362 41.7879 48.0249 41.1668C47.6813 39.2263 47.4959 38.1902 47.4711 38.0635C47.1299 36.3864 47.0953 34.9901 46.8407 33.2459C46.7467 32.5974 46.6849 31.9489 46.6552 31.3054C46.455 27.0791 46.4426 23.7374 46.6231 21.2801C47.0434 15.5482 47.8519 9.60998 49.0485 3.4631C49.2389 2.48666 49.5578 1.56488 50.0053 0.702724C50.0449 0.628187 50.1067 0.571041 50.1833 0.538741C50.799 0.285313 51.3256 0.419481 51.7681 0.943729C51.9832 1.19964 52.0796 1.47792 52.0549 1.77855C51.9634 2.8668 51.783 4.1737 51.5135 5.69675C51.4195 6.22348 51.0882 8.23352 50.522 11.7244C50.3539 12.7629 50.1017 14.3978 49.768 16.6314C49.4243 18.9346 49.046 22.2491 48.9595 25.0269C48.8779 27.6804 48.8359 29.2482 48.8359 29.7302C48.8433 32.4285 48.9892 35.9268 49.276 40.2251C49.3279 40.9829 49.4688 42.0811 49.6987 43.5197C50.0919 45.9769 50.4157 48.0317 50.6679 49.6889C50.6951 49.8752 50.7544 50.0541 50.8385 50.2206C51.0314 50.6057 51.1426 50.8716 51.1698 51.0182Z"
                          fill="#303172"
                        />
                        <path
                          d="M64.3896 34.1229H64.3871C64.3352 34.108 64.3006 34.0559 64.3105 34.0012C64.4415 33.3627 64.6492 32.4732 64.9385 31.3352C65.1412 30.5302 65.611 28.2792 66.3453 24.5821C66.9164 21.7025 67.6161 18.9073 68.4418 16.1966C68.8844 14.7431 69.4234 13.322 70.0588 11.9331C70.2912 11.4237 70.5384 11.0436 70.8005 10.7926C70.8623 10.733 70.9439 10.7032 71.0279 10.7057C71.5397 10.7305 71.7771 10.984 71.7425 11.466C71.6906 12.2213 71.5348 13.0313 71.2752 13.8934C69.6459 19.3024 68.2811 23.4839 67.1809 26.4356C67.0771 26.7139 66.7384 27.6779 66.1648 29.3277C65.3514 31.6657 64.7976 33.2459 64.4984 34.0683C64.4811 34.113 64.4341 34.1354 64.3896 34.1229Z"
                          fill="#303172"
                        />
                        <path
                          d="M70.981 54.6581L70.9983 54.0195C71.0008 53.9251 71.0156 53.8332 71.0378 53.7413C71.4309 52.1983 71.7993 50.1287 72.2246 48.6677C74.0616 42.3768 76.9073 36.5305 80.7617 31.129C82.9547 28.0581 85.3653 24.997 87.9983 21.9435C88.3025 21.5932 88.7969 21.1683 89.4867 20.6689C89.5584 20.6167 89.6499 20.5944 89.7389 20.6093C90.3273 20.7012 90.6364 21.0639 90.666 21.6975C90.6685 21.7795 90.6487 21.859 90.6067 21.9286C90.2334 22.5522 89.7908 23.1734 89.279 23.792C86.8536 26.7263 84.626 29.4991 82.5962 32.1079C79.167 36.5131 76.3831 41.5767 74.0047 46.685C72.9836 48.874 72.1875 51.2095 71.2134 53.7462C71.201 53.7761 71.1936 53.8059 71.1911 53.8382L71.0947 54.6606C71.0898 54.6904 71.065 54.7127 71.0329 54.7152C71.0032 54.7127 70.9785 54.6879 70.981 54.6581Z"
                          fill="#303172"
                        />
                        <path
                          d="M23.991 60.7801C23.8401 60.6932 23.7116 60.5565 23.6028 60.3702C22.06 57.7514 19.9882 54.109 18.171 50.7449C14.7987 44.4986 10.3929 39.0424 5.70525 33.7527C4.45175 32.339 2.9881 30.6073 1.31925 28.5599C0.762965 27.8767 0.362439 27.5338 0.814884 26.694C1.14124 26.0853 2.03624 26.289 2.47138 26.6369C3.04744 27.0965 3.74465 27.8046 4.55806 28.7612C6.63981 31.2011 8.89709 34.1254 11.3843 37.0821C15.2017 41.619 18.5047 46.859 20.7843 52.1934C21.9438 54.9016 23.3061 57.6843 24.1245 60.6758C24.1467 60.7553 24.0627 60.8224 23.991 60.7801Z"
                          fill="#303172"
                        />
                        <path
                          d="M31.1584 43.1867C31.1683 43.229 31.1435 43.2737 31.1015 43.2886H31.099C31.0694 43.2985 31.0348 43.2812 31.0249 43.2513C29.0742 38.0089 27.4078 33.0546 26.0232 28.3885C25.8947 27.9487 25.7958 27.3425 25.7513 26.9027C25.7266 26.6617 25.9169 26.4456 26.1765 26.4232C26.4065 26.4033 26.5845 26.5126 26.7155 26.7512C27.1778 27.6059 27.6031 28.6419 27.9888 29.8619C29.3931 34.282 30.0854 38.9679 31.1584 43.1867Z"
                          fill="#303172"
                        />
                        <path
                          d="M44.8875 63.4759L46.8407 62.656C46.8605 62.6485 46.8802 62.6411 46.9025 62.6361C48.4947 62.3007 49.9435 62.2684 51.4195 61.9926C52.5049 61.7913 53.657 61.6125 54.8759 61.4559C55.7412 61.3466 56.923 61.036 57.6549 60.9516C58.6265 60.8373 59.8924 60.6609 61.45 60.4248C62.7653 60.2236 64.0756 59.6645 65.2154 59.5925C67.1809 59.4658 68.8226 59.2471 70.5508 59.0906C74.6994 58.7129 78.0495 58.3204 80.601 57.9154C83.3255 57.4855 85.7213 57.0657 88.2382 57.0557C89.0812 57.0532 90.1642 57.2048 91.4918 57.5054C93.534 57.97 95.769 58.4024 97.9299 59.021C100.583 59.7813 102.993 60.4869 105.159 61.1354C106.222 61.451 107.231 61.9081 108.185 62.5044C108.353 62.6088 108.269 62.8672 108.074 62.8523C107.36 62.7951 106.61 62.6808 105.827 62.5094C105.379 62.4125 103.958 62.0721 101.562 61.4907C100.845 61.3143 100.153 61.1006 99.4825 60.8447C98.4021 60.4298 97.7123 60.2161 97.4132 60.2012C96.8717 60.1739 95.6949 59.9254 93.8876 59.4608C91.7044 58.8993 89.6647 58.4272 87.5879 58.6359C87.002 58.6955 85.5779 58.8819 83.3157 59.1974C81.6246 59.4335 79.2634 59.6447 76.2298 59.831C75.6266 59.8683 74.8725 59.9378 73.9701 60.0447C72.9836 60.159 72.2271 60.2335 71.7054 60.2658C71.3889 60.2882 71.0725 60.313 70.7535 60.3403C68.8102 60.5168 65.5516 60.8944 60.9753 61.4683C60.3893 61.5429 58.5548 61.8311 55.4693 62.333C52.1612 62.8697 48.6455 63.2995 44.9221 63.62C44.885 63.6225 44.8529 63.6001 44.843 63.5629C44.8356 63.5281 44.8529 63.4908 44.8875 63.4759Z"
                          fill="#303172"
                        />
                        <path
                          d="M130.316 68.4004C128.634 67.7891 127.809 67.7718 125.628 67.4562C124.745 67.327 123.865 67.1655 122.99 66.9717C118.258 65.9232 115.991 65.4362 113.545 64.7232C113.365 64.671 113.261 64.5766 113.231 64.4399C113.214 64.3604 113.271 64.2834 113.353 64.2759C115.432 64.0921 116.668 64.3604 119.202 64.8424C122.688 65.5058 124.827 65.9307 127.312 66.2636C129.247 66.522 131.626 66.8947 133.129 67.9208C134.163 68.6264 134.724 70.1048 135.013 71.4067C135.119 71.8837 135.171 72.7608 135.169 74.0404C135.164 76.4082 135.216 78.4058 135.327 80.0282C135.54 83.1091 135.53 85.5117 135.438 88.528C135.295 93.2413 135.238 96.9558 135.27 99.6714C135.295 101.88 135.201 103.895 135.196 105.634C135.186 111.178 135.169 115.476 135.142 118.532C135.139 118.629 135.127 118.723 135.102 118.815C134.857 119.754 134.922 120.766 134.875 121.797C134.855 122.209 134.855 122.689 134.872 123.238C134.897 123.946 134.867 124.423 134.783 124.674C133.789 127.648 132.578 129.79 129.71 130.756C128.753 131.079 127.907 131.367 127.178 131.623C126.909 131.715 126.723 131.969 126.622 132.379C126.152 134.264 126.038 136.259 123.462 135.616C123.381 135.596 123.309 135.546 123.257 135.477C122.696 134.699 122.283 133.894 122.016 133.064C121.991 132.99 121.924 132.938 121.845 132.935C121.457 132.923 121.168 132.94 120.977 132.99C117.128 133.966 114.794 134.533 113.978 134.694C113.14 134.856 112.225 135.072 111.239 135.34C110.168 135.631 106.46 136.523 100.113 138.016C99.2254 138.222 98.4417 138.419 97.7618 138.6C97.0126 138.799 96.3624 138.943 95.8111 139.032C95.0347 139.157 94.12 139.467 93.2151 139.658C90.4831 140.232 88.2802 140.737 86.6015 141.167C83.6025 141.939 80.8878 142.608 78.4575 143.174C70.8104 144.956 65.831 146.148 63.5193 146.747C60.8319 147.445 58.6314 148.004 56.9206 148.424C55.9069 148.673 54.997 148.916 54.1935 149.152C53.882 149.244 53.5977 149.383 53.343 149.572C53.2392 149.646 53.1527 149.746 53.0933 149.86C52.5346 150.916 51.7385 152.288 50.4503 152.402C49.6666 152.469 49.0683 152.27 48.6529 151.803C48.2672 151.371 48.0546 150.608 47.8098 150.153C47.748 150.034 47.6269 149.957 47.4909 149.952C46.2275 149.882 45.0037 149.537 43.7329 148.973C40.724 147.639 37.908 146.138 34.9609 144.819C34.3107 144.528 33.4082 144.123 32.2536 143.606C30.0137 142.603 28.6761 141.716 26.2334 140.59C23.7932 139.465 21.615 138.352 19.3676 137.499C19.0858 137.392 18.7693 137.499 18.6061 137.753C18.3094 138.215 18.0993 138.94 17.4144 139.174C16.7345 139.405 16.0225 139.33 15.2758 138.948C15.1843 138.901 15.1077 138.831 15.0508 138.744C14.9346 138.568 14.811 138.289 14.68 137.912C14.3561 136.982 14.2251 136.009 14.2869 134.992C14.2918 134.893 14.2374 134.801 14.1484 134.761C13.3474 134.399 12.1112 133.884 10.4423 133.221C8.49162 132.446 6.26648 131.39 4.7163 129.817C3.69273 128.778 2.96585 126.888 2.65433 125.394C2.47385 124.545 2.37001 123.625 2.34281 122.634C2.30326 121.225 2.13019 120.249 2.08074 118.934C2.01893 117.275 1.96701 116.132 1.92498 115.508C1.90026 115.131 1.72719 114.47 1.71977 113.935C1.70247 112.43 1.65549 110.45 1.58379 107.992C1.56896 107.48 1.42062 106.951 1.41073 106.504C1.38353 105.478 1.31925 102.332 1.21788 97.0676C1.21541 96.9036 1.17091 96.6576 1.08932 96.3321C1.0547 96.193 1.0374 96.0514 1.0374 95.9097C1.02998 93.0226 0.992896 90.8188 0.931086 89.2982C0.923669 89.1218 0.876693 88.9057 0.787688 88.6498C0.733295 88.4957 0.708572 88.3317 0.711045 88.1702C0.760492 86.3888 0.711044 82.6048 0.533033 79.5661C0.416831 77.6058 0.607205 75.7274 1.10415 73.936C1.14618 73.7845 1.1981 73.6354 1.26238 73.4888C1.37611 73.2354 1.53682 72.9695 1.7445 72.6888C2.03871 72.2962 1.80136 71.6502 2.53319 71.3843C2.97574 71.2253 3.24523 71.68 3.78421 71.4912C3.85344 71.4663 3.91277 71.4166 3.94986 71.352C4.25643 70.8129 4.81766 70.4178 5.63108 70.1619C6.87716 69.7719 7.98973 69.4861 8.96879 69.2998C13.7924 68.3879 18.4825 67.4463 23.588 66.5518C26.7773 65.9928 28.6984 65.6623 29.3511 65.5605C30.4315 65.394 31.2325 65.2896 31.7493 65.2524C31.8902 65.2424 32.0311 65.2027 32.1572 65.1381C32.4811 64.9691 32.6789 64.8698 33.0497 64.8424C34.4343 64.743 35.4776 64.7281 36.3306 64.2436C36.4418 64.179 36.5655 64.1418 36.694 64.1318C37.8808 64.0449 38.9043 64.0374 40.2988 63.707C40.9737 63.5455 41.9206 63.4386 43.1371 63.384C43.1989 63.3815 43.2533 63.4287 43.2582 63.4908V63.4983C43.2631 63.5629 43.2162 63.62 43.1519 63.6275C41.08 63.8883 38.7313 64.6859 36.7781 65.0884C33.4058 65.7866 29.1211 66.6338 23.9267 67.6326C23.1775 67.7767 19.8992 68.4351 14.0965 69.6104C13.2163 69.7892 11.3522 70.075 8.50645 70.47C7.54964 70.6017 6.36537 70.87 5.62366 71.0141C5.42834 71.0514 5.40609 71.3222 5.59152 71.3943C6.67195 71.8117 7.88588 72.1943 9.2358 72.5447C15.8717 74.2565 21.882 75.879 25.6648 76.8778C26.4238 77.079 27.2298 77.32 28.0803 77.6058C32.3946 79.0543 36.5407 80.4407 40.5139 81.765C42.3681 82.3836 43.7008 82.9079 44.5117 83.3377C44.801 83.4942 45.0433 83.6905 45.2361 83.9315C45.2855 83.9936 45.2262 84.0831 45.1496 84.0632C44.0246 83.7576 43.1173 83.5042 42.4225 83.298C42.0171 83.1762 41.666 83.1017 41.3718 83.0743C40.8674 83.0271 40.5287 82.724 40.0317 82.5973C39.3889 82.4333 38.8821 82.2669 38.5088 82.0954C38.442 82.0656 38.3654 82.0656 38.2986 82.0929L38.0019 82.2172C37.9327 82.247 37.8511 82.2246 37.8017 82.165C37.6508 81.9762 37.5223 81.8643 37.4135 81.8271C36.5284 81.5289 33.6852 80.6295 28.8813 79.1313C25.4175 78.0505 22.4754 77.4542 18.7075 76.4057C17.1771 75.9808 14.9816 75.387 12.1211 74.6267C9.73522 73.9932 6.91424 73.1931 3.65812 72.2241C3.60867 72.2092 3.5617 72.1844 3.52214 72.1496L3.19578 71.8713C3.09194 71.7844 2.9436 71.7695 2.82493 71.8365C2.50105 72.0229 2.31562 72.2366 2.26617 72.4776C2.20189 72.7981 2.25134 73.3521 2.41698 74.1398C2.53813 74.7162 2.30078 75.6479 2.27853 76.3809C2.24145 77.5213 2.25134 78.4605 2.31067 79.2009C2.52083 81.8221 2.41699 84.3266 2.46643 86.918C2.48127 87.6236 2.58511 88.041 2.65186 88.6274C2.80762 89.9914 2.77795 91.3803 2.90157 92.7394C3.18837 95.952 3.29468 99.6764 3.49494 102.347C3.78916 106.231 4.02403 109.943 4.19957 113.483C4.23666 114.224 4.28363 114.872 4.33802 115.426C4.58279 117.891 4.57784 120.321 4.59021 123.789C4.59268 124.818 4.74597 126.038 5.04018 126.912C5.43081 128.075 7.00325 129.096 8.20729 129.633C10.0987 130.475 11.9159 131.318 13.6589 132.165C19.7805 135.146 25.6672 137.703 31.6751 140.642C33.9546 141.755 37.2825 143.38 41.661 145.515C43.5178 146.419 45.0853 147.075 46.3685 147.48C47.6664 147.89 48.9966 148.128 50.035 147.371C50.1017 147.323 50.1809 147.296 50.26 147.296C50.5295 147.294 50.8978 147.234 51.3627 147.117C58.4337 145.333 66.459 143.497 74.2173 141.581C80.6505 139.996 83.736 139.283 88.0923 138.183C91.3287 137.365 95.3611 136.426 100.19 135.368C101.71 135.032 105.832 134.038 112.552 132.386C117.192 131.246 121.63 130.393 125.927 129.372C128.192 128.836 130.256 128.15 131.305 125.847C131.604 125.191 131.782 123.991 131.841 122.246C131.937 119.344 131.999 116.686 132.026 114.268C132.029 114.171 132.034 113.799 132.046 113.15C132.113 109.448 132.204 106.584 132.326 104.554C132.432 102.722 132.442 100.839 132.355 98.8987C132.298 97.6042 132.284 94.9557 132.316 90.9579C132.321 90.297 132.459 89.333 132.476 88.8088C132.578 85.6881 132.605 82.7091 132.558 79.8692C132.556 79.7997 132.511 79.7375 132.444 79.7152C132.185 79.6282 131.913 79.6183 131.626 79.6804C127.591 80.5773 125.489 81.0395 125.324 81.0668C124.718 81.1637 123.86 81.4022 122.753 81.7774C121.912 82.0631 121.371 82.6569 121.128 83.5613C120.718 85.0968 120.216 86.3714 120.196 88.1181C120.174 90.0387 120.137 92.0661 120.09 94.2053C120.018 97.3533 119.984 99.3832 119.986 100.293C119.988 106.417 119.979 110.981 119.956 113.988C119.944 115.575 119.924 116.673 119.902 117.282C119.808 119.59 119.885 121.72 119.6 123.973C119.447 125.203 119.271 126.326 119.076 127.337C118.985 127.814 118.824 128.175 118.592 128.421C118.535 128.478 118.448 128.485 118.381 128.44C117.538 127.844 117.39 126.694 117.378 125.697C117.328 121.558 117.385 119.424 117.486 114.022C117.504 113.086 117.479 110.807 117.407 107.187C117.328 103.118 117.345 99.4726 117.459 96.2551C117.595 92.4711 117.741 88.7665 117.894 85.1366C117.951 83.78 118.231 82.493 118.73 81.2755C118.812 81.0792 118.94 80.9053 119.106 80.7761L120.456 79.7152C120.555 79.6382 120.666 79.576 120.785 79.5288C123.833 78.3586 127.027 77.7126 130.281 77.0467C130.966 76.9051 131.586 76.6641 132.145 76.3187C132.333 76.202 132.457 76.0057 132.476 75.7846C132.563 74.7609 132.464 73.9335 132.177 73.3C132.133 73.2056 132.12 73.0987 132.138 72.9968C132.38 71.603 131.569 70.629 130.11 70.962C124.582 72.2217 118.473 73.4888 111.785 74.7609C111.305 74.8528 110.947 74.9323 110.71 75.0044C110.092 75.1883 109.347 75.0864 108.811 75.382C108.554 75.5237 108.079 75.4491 107.696 75.5237C101.075 76.8107 93.7615 77.9735 87.4618 79.2903C85.1996 79.7624 81.6666 80.5773 76.8603 81.7351C72.1108 82.8805 68.5754 83.6905 66.2563 84.1651C62.3796 84.9601 58.4213 85.7577 54.3839 86.5553C53.8276 86.6646 53.3356 86.7913 52.9079 86.9379C52.6607 87.0224 52.4777 87.2286 52.4184 87.482C52.2947 88.0162 52.2305 88.4758 52.228 88.8634C52.2008 91.7207 51.8893 95.8849 51.778 98.8888C51.3874 109.441 51.0981 119.17 50.9077 128.075C50.9003 128.411 50.8855 128.798 50.8657 129.241C50.7273 132.187 50.5616 137.258 50.3688 144.456C50.349 145.204 50.2526 146.014 50.082 146.886C50.0449 147.07 49.7927 147.095 49.721 146.921C49.5084 146.404 49.3996 145.81 49.3971 145.139C49.3402 135.365 49.3328 123.543 49.3749 109.672C49.3823 107.602 49.1598 105.12 49.1202 102.879C49.1054 101.977 49.0584 99.7261 48.9768 96.1309C48.9471 94.814 48.9941 92.4537 49.1202 89.0473C49.1721 87.6087 49.6097 86.4658 50.4355 85.6211C50.5418 85.5142 51.0066 85.2558 51.8349 84.8483C52.2725 84.6322 52.7793 84.4657 53.3504 84.344C53.9043 84.2297 54.8685 83.9539 55.6201 83.8123C63.7616 82.2842 71.4087 80.5326 80.8482 78.3561C83.9659 77.6381 87.4421 77.0542 90.493 76.3709C93.0865 75.787 96.7407 75.0715 101.453 74.2242C101.475 74.2193 102.254 74.0553 103.787 73.7323C112.532 71.8912 121.101 70.2464 129.49 68.8004C129.7 68.7631 129.977 68.6761 130.318 68.5345C130.377 68.5097 130.377 68.4227 130.316 68.4004Z"
                          fill="#303172"
                        />
                        <path
                          d="M61.9296 64.2113L60.5376 65.2325C60.3176 65.3965 60.0531 65.4884 59.7786 65.4959C57.734 65.5654 55.3951 65.7543 52.7645 66.0648C51.9239 66.1617 50.9893 66.1518 50.3786 66.2388C49.2043 66.4052 47.6096 66.6264 45.5995 66.9021C45.5229 66.9146 45.4487 66.9295 45.377 66.9518C44.5364 67.2202 43.7724 67.3593 43.0876 67.3668C42.9986 67.3693 42.9121 67.3444 42.8404 67.2947C42.6846 67.1879 42.5288 67.0661 42.3731 66.9245C42.0888 66.6661 41.6388 66.7829 41.5671 67.1357C41.5448 67.2525 41.5251 67.332 41.5127 67.3692C41.4904 67.4388 41.4336 67.4935 41.3619 67.5134C39.6584 67.9805 37.5495 68.3631 35.5889 68.9494C33.5442 69.5631 31.5787 70.2688 29.6923 71.0613C28.6044 71.521 27.6946 71.9732 26.9603 72.4204C26.7106 72.572 26.5993 72.8776 26.6933 73.1559C26.9652 73.9683 27.9344 74.3882 28.7602 74.6292C31.9298 75.5535 35.1191 76.2293 38.3283 76.6591C39.8216 76.8604 41.6759 76.9871 43.8887 77.0442C47.9434 77.1461 52.2008 77.1064 56.661 76.925C59.0344 76.8281 61.1508 76.7511 63.01 76.6889C66.187 76.5846 68.3009 76.4778 69.3566 76.3709C74.6079 75.8318 78.005 75.4317 79.5502 75.1758C82.0547 74.7584 85.1452 74.1795 88.8192 73.4391C91.0344 72.9919 93.9766 72.0477 95.952 70.7483C96.0385 70.6936 96.0979 70.6017 96.1127 70.4998L96.2165 69.8166C96.2264 69.7545 96.266 69.6998 96.3253 69.6749L97.2747 69.2774C97.386 69.2302 97.517 69.2724 97.5788 69.3768C97.9497 69.9955 97.9002 70.5545 97.4329 71.0539C95.9075 72.6788 93.4574 73.4242 91.116 74.0826C88.5175 74.8131 86.374 75.3423 84.6804 75.6728C82.8731 76.0256 80.8581 76.4753 79.303 76.7138C76.6501 77.1188 73.9478 77.5263 71.1936 77.9337C69.814 78.1375 68.5432 78.2468 67.3787 78.2642C65.5121 78.2915 63.8877 78.5251 62.2634 78.5325C61.7466 78.535 58.9603 78.6195 53.9092 78.7859C50.7594 78.8903 48.6134 78.9176 47.4736 78.8654C44.7639 78.7487 40.5163 78.6468 37.28 78.1499C34.553 77.73 31.8927 77.1014 29.2992 76.2591C28.0308 75.8492 27.0295 75.4342 26.2952 75.0168C25.2296 74.4106 24.2159 73.0217 25.284 71.8713C26.3644 70.7085 28.2904 69.9756 29.7491 69.506C32.1004 68.7507 35.312 67.8985 39.3889 66.9518C40.1727 66.768 40.8724 66.7083 41.4855 66.7729C41.5646 66.7804 41.6462 66.768 41.7179 66.7332L42.4473 66.3903C42.5264 66.3531 42.608 66.3232 42.6945 66.3058C45.1298 65.7567 47.2214 65.3965 48.9719 65.2201C51.9906 64.917 54.5026 64.6586 56.5126 64.4474C58.357 64.2511 60.3003 64.189 61.895 64.1095C61.9494 64.107 61.9741 64.179 61.9296 64.2113Z"
                          fill="#303172"
                        />
                        <path
                          d="M111.975 84.8881C112.111 84.985 112.087 85.1937 111.933 85.2583C110.519 85.8521 109.209 86.3789 107.552 86.8161C103.851 87.7951 100.385 88.692 97.156 89.507C94.4315 90.1952 91.3929 90.8039 88.4928 91.4723C85.6669 92.1232 83.4146 92.5083 80.821 93.1494C80.596 93.2065 79.5725 93.4301 77.7528 93.8252C71.8067 95.1147 66.4071 96.3346 61.5587 97.485C59.9838 97.8577 58.7303 98.131 57.8007 98.3024C57.0961 98.4341 56.5967 98.6378 56.2975 98.9136C55.3086 99.8279 54.9451 101.167 54.8907 102.467C54.8388 103.669 54.9105 105.947 55.1058 109.302C55.138 109.886 55.2468 112.41 55.4297 116.875C55.4544 117.486 55.4668 117.804 55.4668 117.826C55.5434 120.492 55.6201 124.706 55.6967 130.47C55.7165 132.066 55.9143 133.529 55.8896 134.972C55.8846 135.122 55.7635 135.236 55.6325 135.209C55.5954 135.201 55.5583 135.174 55.5212 135.127C55.2468 134.781 55.0589 134.346 54.9525 133.827C54.5743 131.976 54.3616 130.406 54.3147 129.116C54.1886 125.601 54.1292 122.204 54.1317 118.927C54.1317 118.579 54.0625 118.209 54.06 117.849C54.0427 113.165 54.013 109.197 53.971 105.945C53.9537 104.561 54.0427 103.239 54.238 101.98C54.4803 100.424 55.0589 98.6403 56.5522 97.9148C57.2346 97.5844 58.0183 97.2986 58.9059 97.0601C61.6601 96.3222 70.4544 94.1034 85.2861 90.3989C85.7312 90.2871 86.6385 90.0859 88.0107 89.7902C93.2101 88.6746 98.9015 87.4174 105.082 86.0161C107.711 85.4198 109.832 85.0173 111.444 84.8111C111.684 84.7788 111.859 84.8061 111.975 84.8881Z"
                          fill="#303172"
                        />
                        <path
                          d="M111.35 121.566C111.256 121.354 111.197 121.017 111.172 120.547C111.115 119.464 111.071 118.428 111.036 117.436C110.895 113.389 110.232 109.734 110.096 105.952C109.911 100.78 109.946 95.6016 110.205 90.4163C110.262 89.2933 110.418 88.2125 110.675 87.1764C110.692 87.1019 110.752 87.0447 110.828 87.0298C111.476 86.8956 111.911 87.1565 112.131 87.81C112.277 88.2497 112.391 88.7516 112.47 89.3156C112.72 91.1219 112.843 93.3183 112.838 95.9073C112.819 104.904 112.725 112.248 112.559 117.941C112.519 119.3 112.374 120.485 112.119 121.499C112.025 121.876 111.508 121.921 111.35 121.566Z"
                          fill="#303172"
                        />
                        <path
                          d="M47.837 87.8174C47.8914 87.7702 47.9755 87.8249 47.9557 87.8944C47.7208 88.7492 47.5997 89.6933 47.5873 90.7269C47.5107 97.7061 47.575 104.889 47.6615 112.229C47.7208 117.193 47.7332 128.45 47.6961 145.999C47.6936 146.25 47.5008 146.459 47.2511 146.476H47.2313C46.9865 146.491 46.7739 146.305 46.7591 146.059C46.7269 145.547 46.7121 144.951 46.7171 144.27C46.7492 140.376 46.6701 128.12 46.4797 107.498C46.4278 101.87 46.4822 96.506 46.6404 91.4101C46.675 90.307 46.9396 88.5852 47.837 87.8174Z"
                          fill="#303172"
                        />
                        <path
                          d="M124.394 92.3692C124.946 91.7754 125.378 91.2014 126.216 91.0375C127.492 90.7915 128.54 91.1294 129.361 92.0536C129.45 92.1555 129.522 92.2723 129.574 92.399C129.601 92.4686 129.737 92.8537 129.982 93.5543C130.437 94.8612 130.019 96.2924 129.04 97.1719C128.81 97.3781 128.385 97.6266 127.764 97.9173C126.674 98.4266 125.813 98.2602 124.748 97.7309C123.109 96.921 122.508 94.6997 123.465 93.1096C123.685 92.7493 123.885 92.7121 124.199 92.5282C124.271 92.486 124.337 92.4313 124.394 92.3692ZM128.345 94.4267C128.763 93.7481 128.412 92.7717 127.562 92.2442C126.713 91.7182 125.687 91.84 125.27 92.518C124.852 93.1966 125.203 94.173 126.052 94.7005C126.901 95.2265 127.927 95.1047 128.345 94.4267Z"
                          fill="#303172"
                        />
                        <path
                          d="M129.752 106.934C131.03 109.043 129.005 112.022 126.839 112.755C125.265 113.289 123.445 112.837 122.54 111.346C121.635 109.853 122.073 108.022 123.269 106.859C124.911 105.264 128.474 104.822 129.752 106.934ZM123.788 108.146C123.702 108.395 123.727 108.633 123.86 108.862C124.456 109.878 125.299 110.243 126.392 109.953C127.418 109.682 127.344 108.452 127.2 107.704C127.153 107.451 126.951 107.254 126.696 107.215C125.663 107.053 124.753 107.282 123.969 107.895C123.887 107.96 123.823 108.047 123.788 108.146Z"
                          fill="#303172"
                        />
                        <path
                          d="M121.764 119.824C121.754 118.184 123.845 116.557 125.136 115.978C126.503 115.364 128.422 115.461 129.401 116.664C130.672 118.226 129.969 120.907 128.338 121.976C126.501 123.176 123.729 123.648 122.278 121.583C121.939 121.101 121.769 120.515 121.764 119.824ZM127.406 118.05C126.958 117.71 126.543 117.555 126.16 117.588C125.391 117.652 124.595 117.913 123.769 118.373C123.682 118.423 123.613 118.492 123.564 118.579C123.242 119.153 123.324 119.652 123.806 120.075C124.525 120.703 125.346 120.785 126.268 120.326C126.938 119.99 127.794 119.151 127.564 118.286C127.539 118.192 127.485 118.11 127.406 118.05Z"
                          fill="#303172"
                        />
                        <path
                          d="M111.444 121.884C111.471 121.869 111.503 121.871 111.526 121.894C111.894 122.256 111.884 122.609 111.498 122.95C111.16 123.25 110.779 123.489 110.356 123.665C109.441 124.05 107.997 124.505 106.022 125.032C98.9559 126.912 93.3189 128.214 85.5062 130.274C74.7415 133.114 66.3032 135.303 60.194 136.846C59.5883 136.997 58.3496 137.137 58.2606 136.354C58.2408 136.187 58.3521 136.033 58.5152 135.999C61.1607 135.435 64.3624 134.528 67.2155 133.899C70.934 133.082 74.2099 132.053 78.6627 130.848C86.1812 128.816 90.8737 127.509 96.753 126.112C101.107 125.081 105.431 124.005 109.679 122.676C110.349 122.465 110.937 122.202 111.444 121.884Z"
                          fill="#303172"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-text-sub-600 text-label-xl">passo 02</div>
                <div className="text-text-sub-600 text-paragraph-md">
                  aqueça de 04 a 06 minutos em potência máxima. Cuidado que
                  ainda está muito quente!
                </div>
              </div>
              <div className="w-52 h-80 inline-flex flex-col justify-start items-start gap-3">
                <div className="self-stretch h-52 relative">
                  <div className="w-52 h-52 left-0 top-0 absolute rounded-lg overflow-hidden">
                    <div
                      data-svg-wrapper
                      className="left-[44.49px] top-[15.77px] absolute"
                    >
                      <svg
                        width="122"
                        height="175"
                        viewBox="0 0 122 175"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M72.0076 167.369C98.92 155.286 116.478 129.061 120.377 96.7338C123.691 69.175 117.124 26.3617 95.0003 10.1578C89.1612 5.89462 87.1003 4.17723 78.1296 2.01535C50.7323 -4.59149 22.7694 14.1178 20.951 41.4747C20.6277 46.3641 22.6683 54.4863 25.0121 57.4968C34.1445 69.276 41.3373 63.8612 42.3475 69.8619C43.2971 75.5191 39.9432 79.5398 36.3266 83.5201C28.9317 91.6827 23.5776 95.7842 17.0515 103.886C9.41425 113.342 2.42348 123.586 1.04958 137.325C0.362625 144.295 0.160606 147.811 1.39307 154.7C2.12044 158.721 7.51501 164.116 10.0002 165.934C13.2329 168.278 19.2336 170.763 23.5776 172.177C39.8825 177.471 56.6927 172.723 72.0076 167.348"
                          fill="#FFF0D1"
                        />
                      </svg>
                    </div>
                    <div className="w-44 h-6 left-[16.01px] top-[244.22px] absolute" />
                    <div
                      data-svg-wrapper
                      className="left-[29.49px] top-[33.50px] absolute"
                    >
                      <svg
                        width="152"
                        height="139"
                        viewBox="0 0 152 139"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M91.8304 22.7933C91.8883 22.0654 91.9987 21.2844 92.0066 20.4795C92.0382 16.6277 92.2223 13.5303 92.5564 11.1846C93.0326 7.84018 93.3061 5.99928 93.3719 5.66722C93.7823 3.64036 93.9059 2.16073 94.824 0.686404C94.8792 0.596085 94.966 0.524361 95.066 0.487171C95.2633 0.415447 95.429 0.396852 95.5579 0.431386C95.8894 0.519048 96.1025 0.837821 96.0577 1.17253C95.6973 3.82631 95.0344 6.73776 94.6977 9.46858C94.29 12.7572 93.8928 16.3169 93.5087 20.1448C93.464 20.5778 93.2956 21.4279 93.001 22.6923C92.9589 22.873 92.8011 23.0005 92.6196 23.0031L92.0356 23.0138C91.9172 23.0164 91.8199 22.9128 91.8304 22.7933Z"
                          fill="#303172"
                        />
                        <path
                          d="M100.766 21.728C100.716 21.4916 100.795 21.1463 101.006 20.6867C101.511 19.5949 102.908 16.3833 105.196 11.0465C105.657 9.9733 109.397 1.25222 111.426 4.00429C111.481 4.07867 111.497 4.17696 111.468 4.26462C111.215 5.06952 111.044 5.54502 110.952 5.69644C109.15 8.67431 107.732 11.1793 106.693 13.2115C106.301 13.9766 105.273 16.0619 103.608 19.4647C103.373 19.9403 103.066 20.5114 102.679 21.1755C102.303 21.821 101.721 22.0601 100.932 21.8954C100.848 21.8768 100.785 21.813 100.766 21.728Z"
                          fill="#303172"
                        />
                        <path
                          d="M83.6203 23.5875C83.4757 23.8399 83.21 23.9249 82.818 23.8399C82.7391 23.824 82.6707 23.7708 82.6339 23.6965C82.3024 23.027 82.113 22.5701 82.0657 22.3231C81.3265 18.5722 80.9503 16.6489 80.9371 16.556C80.7004 14.9222 80.5162 13.849 80.4215 12.5368C80.3111 11.0332 80.1269 9.7236 79.8665 8.60524C79.7718 8.19615 79.7481 7.08044 79.7928 5.25547C79.7955 5.19703 79.8139 5.14125 79.8481 5.09609L80.2427 4.58339C80.411 4.36557 80.7372 4.36025 80.9082 4.57543C81.145 4.87029 81.3054 5.34845 81.3922 6.01521C81.9525 10.3877 82.7101 16.1708 83.6624 23.3671C83.6729 23.4441 83.6572 23.5211 83.6203 23.5875Z"
                          fill="#303172"
                        />
                        <path
                          d="M75.0604 24.071C74.9631 24.0896 74.8316 24.079 74.6711 24.0391C74.5922 24.0179 74.5211 23.9754 74.4659 23.9143C73.6267 22.9978 73.1348 21.9698 72.5719 20.5698C70.6831 15.8786 69.1495 10.9137 67.9684 5.67253C67.8658 5.22625 68.071 4.76403 68.4682 4.54089L68.5024 4.5223C68.8443 4.32838 69.2758 4.5223 69.3599 4.90748C69.5467 5.73098 69.9202 6.41634 70.1175 7.18936C71.2277 11.5486 72.4877 16.022 73.9003 20.6097C74.2291 21.6749 74.6816 22.6764 75.2577 23.6114C75.3708 23.7921 75.2682 24.0312 75.0604 24.071Z"
                          fill="#303172"
                        />
                        <path
                          d="M108.414 23.9515C108.884 22.9712 109.282 22.2328 109.611 21.7387C111.497 18.8856 113.422 16.293 115.387 13.9606C115.585 13.7268 115.942 13.3975 116.463 12.9724C116.563 12.8901 116.689 12.8423 116.821 12.8343C117.31 12.8104 117.713 12.9007 118.026 13.1079C118.228 13.2407 118.273 13.5223 118.12 13.7136C116.003 16.3275 113.775 19.2204 111.436 22.3895C111.102 22.8437 110.526 23.4786 109.713 24.2995C109.66 24.3526 109.595 24.3951 109.521 24.419C109.255 24.5146 108.945 24.5014 108.59 24.3792C108.416 24.3181 108.332 24.1188 108.414 23.9515Z"
                          fill="#303172"
                        />
                        <path
                          d="M117.531 23.6327C118.307 22.5064 118.973 21.6218 120.054 20.5831C122.243 18.4792 124.565 16.5347 127.022 14.7496C127.885 14.1253 128.958 13.509 130.24 12.906C130.647 12.7147 131.131 12.8077 131.442 13.1345L131.465 13.161C131.728 13.44 131.655 13.8969 131.315 14.0748C128.43 15.5943 125.694 17.4273 123.111 19.571C121.519 20.8913 120.241 21.9804 119.278 22.8358C118.862 23.2077 118.286 23.5132 117.813 23.8319C117.789 23.8505 117.75 23.8611 117.7 23.8665C117.655 23.8718 117.618 23.8638 117.586 23.8426C117.497 23.7815 117.479 23.7097 117.531 23.6327Z"
                          fill="#303172"
                        />
                        <path
                          d="M40.3709 81.8804C41.0496 80.1431 41.8624 78.868 42.8095 78.0551C45.0691 76.1186 47.6708 74.6628 50.6197 73.6826C50.6802 73.6614 50.6775 73.5763 50.617 73.5551C48.8124 72.9733 46.9631 72.0223 46.0188 70.0858C44.9876 67.966 44.7982 66.04 44.2458 63.3358C44.2247 63.2402 44.1221 63.1897 44.0353 63.2348C40.071 65.2883 36.5276 68.1758 33.8392 71.855C33.2604 72.6493 32.8159 73.4196 32.5055 74.1714C31.3559 76.9447 30.4799 80.0634 30.2773 83.113C30.1721 84.7148 30.1011 85.6445 30.0643 85.8996C29.6855 88.4869 29.0252 91.0849 28.0834 93.6909C26.4183 98.3051 24.4111 102.848 22.0647 107.324C21.7832 107.86 21.2808 108.378 21.0756 108.785C17.8663 115.144 13.6941 121.326 9.46154 127.284C6.96775 130.796 4.13461 133.888 0.638561 136.433C0.559643 136.491 0.462312 136.396 0.514923 136.313C2.30635 133.572 3.83735 131.33 5.10792 129.587C7.05982 126.91 8.63291 124.691 9.82982 122.936C11.4371 120.574 13.6573 117.017 16.4852 112.259C20.7441 105.098 24.0113 98.1218 26.2868 91.3293C27.4495 87.8627 27.8993 84.0161 28.5543 80.4804C29.2435 76.7614 30.6167 73.4568 32.6738 70.5693C34.5126 67.9846 36.3566 65.8355 38.2033 64.1248C39.7396 62.7009 41.289 61.9252 43.5355 60.6023C43.646 60.5386 43.7039 60.4137 43.6828 60.2889C43.425 58.7189 42.9436 56.1634 42.2386 52.6224C41.8677 50.7602 41.5389 48.8901 41.2495 47.0067C40.8918 44.6717 40.5761 42.7962 40.3025 41.3803C40.2104 40.8969 40.3683 40.6286 40.776 40.5754C40.8023 40.5701 40.8234 40.5462 40.8234 40.5197V40.517C40.8207 40.4931 40.805 40.4772 40.7813 40.4745C39.2897 40.4134 37.4615 40.3629 35.2965 40.3231C34.4495 40.3071 33.6235 40.2168 32.8159 40.0495C32.6791 40.0202 32.5686 39.914 32.537 39.7759C32.1082 37.9615 32.466 36.3198 33.6129 34.8508C34.3311 33.9317 35.0913 33.3792 35.891 33.1906C37.0143 32.9249 38.0139 32.7894 38.8951 32.7868C39.0214 32.7868 39.1424 32.731 39.224 32.6327C40.8181 30.7254 42.7831 28.7809 45.2349 28.0318C45.3716 27.9893 45.5111 27.9653 45.6531 27.9574C47.4182 27.8591 49.5779 27.8113 52.1322 27.8139C62.4336 27.8272 71.6117 27.8033 79.6666 27.7422C84.3438 27.7077 89.2682 27.7077 94.4399 27.7422C106.575 27.8219 113.683 27.697 125.126 27.6333C125.541 27.6306 125.865 27.7103 126.275 27.7528C126.388 27.7635 126.504 27.7581 126.615 27.7395C127.935 27.5111 129.35 27.6014 130.784 27.4394C133.01 27.1844 135.348 27.1073 137.634 27.5881C140.025 28.0875 142.103 30.2366 143.335 32.2794C143.382 32.3564 143.461 32.4096 143.55 32.4228C144.282 32.5238 145.189 32.4282 145.913 32.5982C146.457 32.7257 147.004 32.8505 147.559 32.9754C147.757 33.0205 147.949 33.0949 148.122 33.2012C148.635 33.512 149.161 33.9423 149.701 34.4922C149.998 34.7977 150.285 35.3529 150.561 36.1631C150.884 37.1088 151.19 38.2617 151.476 39.6218C151.542 39.9379 151.471 40.1478 151.266 40.2487C151.171 40.2939 151.066 40.3151 150.961 40.3098L145.373 40.0176C145.26 40.0123 145.16 40.0973 145.15 40.2115C145.118 40.4878 145.126 40.7481 145.055 41.043C143.661 46.9084 142.269 52.6064 141.317 57.9538C140.82 60.7564 140.312 63.7369 139.799 66.8954C139.349 69.6581 137.997 71.4246 135.943 73.6321C131.271 78.6581 126.102 83.19 120.385 87.2729C118.552 88.5826 117.058 89.5522 115.898 90.1817C115.553 90.3677 114.046 91.1407 111.37 92.4981C108.03 94.1929 105.01 95.2369 101.272 96.2517C100.735 96.3978 100.196 96.5811 99.6564 96.8069C98.9382 97.1044 98.2622 97.0035 97.4493 97.3249C93.3272 98.9506 89.0157 100.13 84.52 100.861C78.5828 101.828 72.8691 102.354 66.974 101.894C66.8688 101.886 66.7714 101.95 66.7346 102.048C66.611 102.385 66.4926 102.741 66.3742 103.116C64.3776 109.505 61.0184 120.502 56.2991 136.114C56.065 136.885 55.7283 138.205 54.9154 138.412C54.8496 138.428 54.7891 138.367 54.8049 138.298C57.6223 126.596 59.1427 120.284 59.3663 119.36C60.7816 113.489 62.0048 108.867 63.3675 104.651C63.6332 103.828 63.8857 102.85 64.1277 101.719C64.1409 101.652 64.0961 101.586 64.0277 101.575C63.1176 101.445 62.1653 101.325 61.1736 101.211C60.9184 101.182 60.7027 101.07 60.5212 100.871C60.4659 100.81 60.5001 100.715 60.5817 100.701C61.071 100.629 61.5576 100.537 62.0443 100.425C63.0308 100.199 64.0593 100.345 65.3693 100.356C66.0743 100.359 66.682 100.319 67.1897 100.236C68.4234 100.032 69.6204 99.9627 70.7778 100.024C73.077 100.146 74.9815 100.093 77.5147 100.088C78.2355 100.085 79.0142 99.9946 79.8533 99.8113C82.8864 99.1499 86.051 98.4007 89.3471 97.5666C92.6196 96.7378 96.4023 95.2954 99.5222 94.3098C99.8458 94.2089 100.204 94.0362 100.595 93.7918C103.494 91.9934 105.488 90.7051 106.577 89.9294C107.006 89.6239 107.945 88.6835 109.397 87.1029C109.489 87.0046 109.587 86.9143 109.695 86.832C110.573 86.1652 111.326 85.4984 111.954 84.8317C112.83 83.9046 113.896 83.2352 114.822 82.3213C117.634 79.548 119.983 77.306 121.83 74.2431C121.88 74.1608 121.945 74.0864 122.019 74.0253C122.185 73.8925 122.414 73.7411 122.529 73.6029C123.242 72.7449 124.123 71.7434 125.173 70.5958C125.528 70.208 126.046 69.4482 126.728 68.3193C127.409 67.1929 127.996 64.5843 126.846 63.5828C126.052 62.8895 125.323 62.2095 124.342 62.1882C123.729 62.1776 122.834 62.1696 121.664 62.1643C119.365 62.1563 117.326 62.9798 115.393 64.3612C113.396 65.785 111.933 66.9645 111.002 67.9022C110.294 68.6168 109.663 69.9317 108.887 70.9199C108.227 71.7567 107.638 72.6094 107.114 73.4781C106.925 73.7915 106.659 74.0386 106.32 74.2192C105.683 74.5566 105.149 75.0055 104.718 75.5607C104.576 75.7467 104.397 75.9034 104.194 76.0229C101.882 77.3697 99.2828 78.0923 96.3944 78.1932C92.7879 78.3207 89.5549 78.2836 86.2457 77.3326C84.6278 76.8677 83.06 76.44 81.5448 76.0521C79.1773 75.4491 77.712 75.1144 77.1491 75.048C76.4152 74.9604 75.5023 74.7478 74.408 74.4131C72.5929 73.8579 70.6989 73.8712 68.6997 73.7942C67.2239 73.7357 65.2457 73.6985 62.7624 73.68C61.2577 73.672 60.0371 73.7623 59.1033 73.9562C57.4881 74.2909 55.623 74.4131 53.9368 74.9152C53.0977 75.1649 51.9613 75.4837 50.5328 75.8742C49.5148 76.1531 48.431 76.5941 47.2814 77.1997C44.3957 78.7219 42.2781 79.7101 40.4104 81.9043C40.4025 81.9122 40.3893 81.9149 40.3814 81.9096C40.3709 81.9043 40.3656 81.891 40.3709 81.8804ZM40.8076 33.3473C42.1834 33.2384 43.4776 33.0976 44.6851 32.9196C46.7553 32.6141 48.0627 32.5397 50.354 32.2794C51.3299 32.1705 53.3055 32.0908 56.2754 32.0456C59.5137 31.9952 64.5565 32.0509 71.4013 32.213C76.8229 32.3405 83.1573 32.5105 90.4099 32.7204C94.9634 32.8505 99.0908 32.8505 102.792 32.7204C107.89 32.5371 112.557 32.2528 117.15 32.2661C125.023 32.2874 131.258 32.3246 135.853 32.3803C137.787 32.4042 139.689 32.5929 141.564 32.9488C141.735 32.9807 141.885 32.8372 141.856 32.6726C141.848 32.6354 141.804 32.5716 141.719 32.4786C139.781 30.3747 137.495 29.1182 134.535 29.1793C131.434 29.2404 128.388 29.3653 125.597 29.36C118.347 29.3493 111.099 29.538 104.633 29.4848C85.8116 29.3361 65.6982 29.3786 48.844 29.6442C47.3604 29.6681 46.3318 29.7239 45.761 29.8063C44.6193 29.971 43.375 30.8263 42.5885 31.5622C41.9966 32.112 41.3837 32.6619 40.7497 33.2065C40.6918 33.257 40.7313 33.3526 40.8076 33.3473ZM129.898 33.4031C129.666 33.5837 129.393 33.5571 129.079 33.3234C129.006 33.2676 128.903 33.2729 128.835 33.3313C128.59 33.5306 128.327 33.52 128.046 33.2995C127.964 33.2357 127.854 33.2277 127.762 33.2756L127.53 33.4031C127.454 33.4429 127.364 33.4403 127.291 33.3951C127.12 33.2888 126.914 33.2756 126.67 33.3553C126.559 33.3924 126.438 33.3898 126.33 33.3446L126.162 33.2756C126.057 33.2331 125.941 33.2357 125.839 33.2809C125.539 33.4137 125.176 33.4217 124.747 33.3074C124.534 33.2517 124.363 33.2756 124.234 33.3792C124.066 33.5173 123.897 33.4828 123.731 33.2782C123.666 33.1985 123.547 33.1959 123.479 33.2729C123.203 33.5943 122.924 33.6395 122.642 33.4057C122.553 33.3313 122.429 33.3074 122.319 33.342C121.827 33.4987 121.435 33.4721 121.143 33.2623C121.067 33.2065 120.959 33.2277 120.909 33.3101C120.762 33.5545 120.556 33.5651 120.291 33.342C120.23 33.2915 120.162 33.2623 120.088 33.257C120.02 33.2517 119.949 33.2809 119.878 33.3446C119.807 33.4057 119.704 33.4403 119.57 33.4482C118.541 33.5067 116.445 33.5943 113.275 33.7112C112.912 33.7245 112.138 33.7803 110.955 33.8839C109.65 33.9928 108.871 34.038 108.619 34.0167C108.001 33.9662 107.624 34.0008 107.493 34.1256C107.482 34.1362 107.469 34.1416 107.453 34.1416L106.677 34.0698C106.633 34.0672 106.591 34.0698 106.549 34.0805C106.088 34.1973 105.683 34.2638 105.336 34.277C101.13 34.4444 96.2392 34.4736 90.6703 34.3674C90.3993 34.362 90.0968 34.386 89.7575 34.4391C89.6812 34.4524 89.6049 34.4577 89.5286 34.455C81.7237 34.3036 75.4024 34.0247 67.9447 34.0698C58.4983 34.1309 52.5558 34.1734 50.1172 34.2027C49.4648 34.2106 48.944 34.0858 48.4573 34.1787C47.4735 34.37 46.2687 34.277 45.4111 34.3966C43.575 34.6489 42.0334 34.5586 39.5291 34.5692C36.6565 34.5825 34.2864 35.3263 33.4761 38.3254C33.4341 38.4848 33.5235 38.6522 33.6813 38.7027C33.9838 38.7983 34.2048 38.8461 34.3442 38.8461C35.6464 38.8408 37.8613 38.9178 40.9891 39.0799C43.525 39.2127 45.4637 39.2472 48.189 39.2552C58.6561 39.2924 68.4971 39.2525 77.9804 39.2818C78.9221 39.2844 79.8428 39.311 80.7398 39.3561C85.4986 39.6032 90.452 39.6749 95.6026 39.574C96.7943 39.5501 97.886 39.5022 98.8751 39.4252C101.811 39.1994 103.392 39.2525 107.167 39.1091C108.269 39.0666 109.942 39.0453 112.191 39.0427C114.303 39.04 118.752 38.9736 125.536 38.8408C126.678 38.8195 127.68 38.7691 128.545 38.6867C131.247 38.429 132.654 38.4955 136.069 38.2484C137.324 38.1581 138.876 38.1182 140.725 38.1289C142.722 38.1421 144.781 38.1156 147.273 38.1448C147.951 38.1528 148.675 38.5406 149.438 38.437C149.574 38.4184 149.656 38.2723 149.601 38.1448C149.424 37.7331 149.317 37.4568 149.277 37.316C148.959 36.2162 148.164 35.3768 147.144 34.8641C147.044 34.8136 146.933 34.7818 146.817 34.7711C144.6 34.5746 142.451 33.9795 140.12 33.9237C138.828 33.8918 137.208 33.7909 135.259 33.6236C134.551 33.5625 133.843 33.5439 133.136 33.5731C132.978 33.5811 132.86 33.5625 132.781 33.5226C132.562 33.411 132.178 33.5943 131.902 33.5757C131.392 33.5412 130.934 33.5385 130.529 33.5704C130.447 33.5757 130.308 33.5173 130.111 33.3924C130.045 33.3499 129.958 33.3553 129.898 33.4031ZM124.01 73.9243C126.207 73.9722 128.527 73.7968 130.971 73.3957C131.823 73.2549 133.015 72.8697 134.017 72.6838C134.359 72.62 134.675 72.4633 134.93 72.2322C135.49 71.7248 136.04 71.1935 136.579 70.633C137.15 70.0406 137.666 69.1746 138.123 68.035C138.155 67.9527 138.179 67.8703 138.194 67.7853C138.371 66.744 138.736 64.6135 139.286 61.3913C139.783 58.4772 141.017 52.7632 142.982 44.2493C143.292 42.8998 143.803 41.5477 144.04 40.1159C144.061 39.9777 143.95 39.8582 143.813 39.8715C136.224 40.6472 132.136 41.0563 131.555 41.0988C130.592 41.1705 127.793 41.3166 123.155 41.5371C116.468 41.8585 107.256 41.6593 102.155 41.7576C99.4196 41.8107 96.5865 41.9993 93.8375 41.8877C90.2257 41.7416 87.1532 41.6965 83.765 41.4149C81.8315 41.2528 78.9826 41.0616 75.2209 40.8358C73.0164 40.7029 70.1623 40.6392 66.6583 40.6472C62.7414 40.6551 57.5697 40.6312 51.1458 40.5754C48.2074 40.5489 45.4663 40.4798 42.9278 40.3656C42.6753 40.355 42.407 40.3736 42.1229 40.424C42.044 40.44 41.9913 40.5143 42.0071 40.594C42.1045 41.1227 42.1781 41.4999 42.2307 41.7204C43.2724 46.1593 43.8959 48.9299 44.0984 50.0324C44.9271 54.5191 45.711 58.9766 46.4554 63.4102C46.5843 64.1673 46.6843 64.8765 46.758 65.5406C46.9553 67.2753 47.4787 68.8452 48.3337 70.2505C48.3863 70.3382 48.4494 70.4205 48.5231 70.4922C49.4622 71.4353 50.5697 71.9134 51.8455 71.9294C52.3138 71.9373 52.8057 71.9851 53.3239 72.0755C54.2998 72.2455 54.9022 72.3013 55.1285 72.2428C60.3239 70.9173 65.6192 70.8137 71.0146 71.9373C73.0664 72.365 74.8473 72.806 76.3599 73.2602C76.9097 73.4276 77.6226 73.5099 78.1724 73.5179C82.4629 73.5923 86.635 73.5232 90.6913 73.3081C91.5989 73.2602 92.4617 73.3984 93.2456 73.3957C98.6199 73.3931 102.213 73.3745 104.026 73.3399C105.081 73.3187 107.072 70.8641 107.709 70.0539C110.447 66.558 114.138 62.4937 118.483 61.1602C119.749 60.7723 121.156 60.5572 122.708 60.5147C125.084 60.4482 126.838 61.3063 127.969 63.0887C129.529 65.5486 128.443 67.9128 126.967 70.0167C126.06 71.3104 125.06 72.5828 123.971 73.834C123.942 73.8686 123.966 73.9243 124.01 73.9243ZM132.673 74.8886C129.606 75.5129 126.386 75.7785 123.011 75.6856C122.748 75.6776 122.495 75.7945 122.329 76.0017C119.096 80.0448 115.713 83.8754 112.186 87.4961C110.302 89.4273 108.911 90.6386 106.756 91.7012C106.554 91.7995 106.585 92.0997 106.801 92.1581C107.719 92.4052 109.668 91.4781 110.365 91.1195C110.942 90.8219 111.568 90.5775 112.241 90.3863C112.709 90.2535 113.322 89.9719 114.077 89.5415C116.266 88.2903 118.268 87.1162 120.435 85.4639C124.526 82.3426 126.641 80.7301 126.786 80.6239C127.538 80.066 128.411 79.3302 129.406 78.4137C130.86 77.0722 131.694 76.2939 131.913 76.0734C132.284 75.6988 132.562 75.3376 132.746 74.9896C132.773 74.9364 132.731 74.878 132.673 74.8886ZM101.264 75.2101C100.701 75.2552 100.072 75.218 99.3749 75.0932C99.3144 75.0826 99.2539 75.0772 99.1934 75.0799L91.8883 75.2207C91.7673 75.2233 91.6462 75.2154 91.5252 75.1915C90.8965 75.0693 90.2599 75.0082 89.6181 75.0055C87.2111 74.9975 84.9856 74.963 82.939 74.9019C82.9627 74.9046 82.9785 74.9072 82.989 74.9099C83.9649 75.1755 84.9172 75.3083 85.9274 75.6245C87.6609 76.1664 89.1446 76.7349 90.7071 76.9421C94.4873 77.4441 98.0149 76.9075 101.295 75.3323C101.358 75.3004 101.335 75.2048 101.264 75.2101Z"
                          fill="#303172"
                        />
                        <path
                          d="M77.442 47.6401C77.6661 48.5756 78.3514 49.2108 78.9728 49.0591C79.5941 48.9073 79.9161 48.0259 79.692 47.0905C79.4679 46.155 78.7825 45.5197 78.1612 45.6715C77.5399 45.8233 77.2179 46.7047 77.442 47.6401Z"
                          fill="#303172"
                        />
                        <path
                          d="M93.0878 47.6044C93.3482 47.6017 93.5324 47.6575 93.6376 47.7717C94.3847 48.574 94.9082 50.0005 94.3689 51.0391C94.0743 51.6023 93.6613 51.8866 93.1299 51.8919C92.5985 51.8972 92.1803 51.6209 91.8751 51.0657C91.3148 50.035 91.812 48.6005 92.5433 47.7824C92.6459 47.6681 92.8274 47.607 93.0878 47.6044Z"
                          fill="#303172"
                        />
                        <path
                          d="M64.5338 51.9411C65.0582 53.165 66.0401 53.9139 66.7267 53.6139C67.4134 53.3138 67.5449 52.0784 67.0204 50.8544C66.4959 49.6305 65.5141 48.8816 64.8274 49.1817C64.1407 49.4817 64.0093 50.7172 64.5338 51.9411Z"
                          fill="#303172"
                        />
                        <path
                          d="M116.715 51.7179C117.267 52.5962 118.158 53.0233 118.707 52.6719C119.255 52.3205 119.252 51.3237 118.7 50.4454C118.148 49.5671 117.256 49.14 116.708 49.4914C116.16 49.8428 116.163 50.8397 116.715 51.7179Z"
                          fill="#303172"
                        />
                        <path
                          d="M106.466 53.9092C106.645 54.8112 107.245 55.4504 107.808 55.3368C108.371 55.2233 108.682 54.4 108.504 53.4979C108.325 52.5959 107.725 51.9567 107.162 52.0703C106.599 52.1838 106.288 53.0071 106.466 53.9092Z"
                          fill="#303172"
                        />
                        <path
                          d="M129.213 55.4265C129.146 56.4247 129.565 57.2666 130.149 57.3068C130.733 57.347 131.261 56.5704 131.329 55.5721C131.396 54.5739 130.977 53.732 130.393 53.6918C129.809 53.6516 129.281 54.4282 129.213 55.4265Z"
                          fill="#303172"
                        />
                        <path
                          d="M81.5317 60.0418C81.7447 59.8373 82.1025 59.8532 82.3603 60.0763C83.21 60.8148 83.8545 62.5017 82.7075 63.3942C81.266 64.5179 80.8477 60.6979 81.5317 60.0418Z"
                          fill="#303172"
                        />
                        <path
                          d="M36.3461 109.89C36.3119 109.834 36.3172 109.741 36.3619 109.616C36.5697 109.056 36.8012 108.575 37.0511 108.176C37.8587 106.893 38.661 105.294 39.4607 103.379C39.5107 103.262 39.5396 103.137 39.5502 103.01L40.0105 97.8615C40.0421 97.4869 40.4314 97.2558 40.7707 97.4099L40.7813 97.4152C41.2758 97.6384 41.5994 98.1271 41.6152 98.6744C41.652 99.9627 41.5547 101.009 41.3258 101.814C40.555 104.5 38.953 106.909 37.5246 108.995C37.2642 109.374 36.9354 109.685 36.5408 109.932C36.4592 109.983 36.3961 109.967 36.3461 109.89Z"
                          fill="#303172"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="text-text-sub-600 text-label-xl">passo 03 </div>
                <div className="text-text-sub-600 text-paragraph-md">
                  pronto! tenha uma refeição prazerosa, a sua comida está pronta
                  para o consumo!
                </div>
                <div className="self-stretch flex flex-col justify-start items-center gap-2">
                  <div className="self-stretch h-16 flex flex-col justify-start items-start gap-2.5">
                    <div className="self-stretch h-14 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="w-full flex justify-center items-center p-6">
      <div className="max-w-[1200px] w-full flex flex-col justify-center items-center mt-12">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-title-h2 text-text-sub-600 mb-6">
            você também pode gostar
          </h2>
          <Button.Root>Abrir</Button.Root>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1200px]">
          {relatedProducts &&
            relatedProducts.map(
              (product: {
                id: string;
                handle: string;
                title: string;
                featuredImage?: {
                  altText?: string | null;
                  url: string;
                  width?: number | null;
                  height?: number | null;
                } | null;
                priceRange?: {
                  minVariantPrice: MoneyV2;
                };
              }) => <ProductCard key={product.id} product={product} />,
            )}
        </div>
      </div>
      </div>
      
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    collections(first: 1) {
      nodes {
        handle
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
