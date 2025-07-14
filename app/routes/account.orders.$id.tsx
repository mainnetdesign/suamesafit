import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Link} from '@remix-run/react';
import {Money, Image, flattenConnection} from '@shopify/hydrogen';
import type {OrderLineItemFullFragment} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Sua Mesa Fit | Pedido ${data?.order?.name}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: {orderId},
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4">
          <Link
            to="/account/orders"
            className="inline-flex items-center text-label-lg text-text-sub-600 hover:text-gray-700 mb-4"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            voltar para pedidos
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h6 className="text-title-h6 text-text-sub-600">
                pedido {order.name}
              </h6>
              <p className="text-gray-600">
                feito em {new Date(order.processedAt!).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fulfillmentStatus)}`}>
              {fulfillmentStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itens do Pedido */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h6 className="text-label-lg text-text-sub-600">
                  itens do pedido
                </h6>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {lineItems.map((lineItem, lineItemIndex) => (
                    <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h6 className="text-label-lg text-text-sub-600">
                  resumo financeiro
                </h6>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <Money data={order.subtotal!} />
                </div>
                
                {((discountValue && discountValue.amount) || discountPercentage) && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>
                      {discountPercentage ? (
                        `-${discountPercentage}%`
                      ) : (
                        discountValue && <Money data={discountValue!} />
                      )}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos</span>
                  <Money data={order.totalTax!} />
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <Money data={order.totalPrice!} />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h6 className="text-label-lg text-text-sub-600">
                  endereço de entrega
                </h6>
              </div>
              <div className="p-6">
                {order?.shippingAddress ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.name}
                    </p>
                    {Array.isArray(order.shippingAddress.formatted)
                      ? order.shippingAddress.formatted.map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))
                      : (
                          <p>{order.shippingAddress.formatted}</p>
                        )
                    }
                    {order.shippingAddress.formattedArea && (
                      <p className="text-gray-500">{order.shippingAddress.formattedArea}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Nenhum endereço de entrega definido
                  </p>
                )}
              </div>
            </div>

            {/* Link para Status do Pedido */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <a
                  href={order.statusPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Ver Status do Pedido
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  const precoTotal = Number(lineItem.price?.amount || 0) * (lineItem.quantity || 1);
  const desconto = Number(lineItem.totalDiscount?.amount || 0);
  return (
    <div className="flex items-center space-x-4">
      {lineItem?.image && (
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          <Image 
            data={lineItem.image} 
            width={64} 
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {lineItem.title}
        </h3>
        {lineItem.variantTitle && (
          <p className="text-sm text-gray-500">{lineItem.variantTitle}</p>
        )}
        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
          <span>Qtd: {lineItem.quantity}</span>
          <span>Preço unitário: R${Number(lineItem.price?.amount || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-medium text-gray-900">
          R${precoTotal.toFixed(2)}
        </p>
        {desconto > 0 && (
          <p className="text-xs text-green-700">
            Desconto: -R${desconto.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
