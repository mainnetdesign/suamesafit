import {Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
  Image,
} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export const meta: MetaFunction = () => {
  return [{title: 'Pedidos'}];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer};
}

export default function Orders() {
  const {customer} = useLoaderData<{customer: CustomerOrdersFragment}>();
  const {orders} = customer;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg shadow-sm">
          <div className="py-4">
            <h5 className="text-title-h5 text-text-sub-600">meus pedidos</h5>
            <p className="mt-1 text-sm text-text-sub-600">
              acompanhe o status dos seus pedidos
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            {orders.nodes.length ? (
              <OrdersTable orders={orders} />
            ) : (
              <EmptyOrders />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <PaginatedResourceSection
      connection={orders}
      resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
    >
      {({node: order}) => <OrderItem key={order.id} order={order} />}
    </PaginatedResourceSection>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Nenhum pedido encontrado
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Você ainda não fez nenhum pedido. Que tal começar agora?
      </p>
      <div className="mt-6">
        <Link
          to="/collections"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          Começar a Comprar
        </Link>
      </div>
    </div>
  );
}

function OrderItem({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const lineItems = flattenConnection(order.lineItems);

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

  const getFinancialStatusColor = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
      {/* Status Badge */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Confirmado</span>
          <span className="text-sm text-gray-500">
            {new Date(order.processedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        </div>
      </div>

      {/* Product Images - Fixed height container */}
      <div className="p-4 flex-grow flex flex-col">
        <div
          className={`gap-2 mb-4 ${
            lineItems.length === 1
              ? 'flex h-48'
              : lineItems.length === 2
                ? 'grid grid-cols-2 h-48'
                : lineItems.length === 3
                  ? 'grid grid-cols-2 h-48'
                  : 'grid grid-cols-2 h-48'
          }`}
        >
          {lineItems.length === 1 ? (
            // Single item - full width
            <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
              {lineItems[0].image ? (
                <Image
                  data={lineItems[0].image}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  alt={lineItems[0].image.altText || lineItems[0].title}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ) : lineItems.length <= 4 ? (
            // 2-4 items - show all
            lineItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-gray-100 rounded-lg overflow-hidden"
              >
                {item.image ? (
                  <Image
                    data={item.image}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                    alt={item.image.altText || item.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))
          ) : (
            // More than 4 items - show first 3 and counter
            <>
              {lineItems.slice(0, 3).map((item, index) => (
                <div
                  key={item.id}
                  className="bg-gray-100 rounded-lg overflow-hidden"
                >
                  {item.image ? (
                    <Image
                      data={item.image}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                      alt={item.image.altText || item.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {/* Counter for remaining items */}
              <div className="bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  +{lineItems.length - 3}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Order Info - Flexible space */}
        <div className="space-y-2 flex-grow flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lineItems.length} {lineItems.length === 1 ? 'item' : 'itens'}
            </span>
            <span className="text-sm text-gray-600">
              Pedido # {order.number}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              <Money data={order.totalPrice} />
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFinancialStatusColor(order.financialStatus)}`}
              >
                {order.financialStatus}
              </span>
              {fulfillmentStatus && (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fulfillmentStatus)}`}
                >
                  {fulfillmentStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at bottom */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <Link
          to={`/account/orders/${btoa(order.id)}`}
          className="bg-orange-50 w-full inline-flex items-center justify-center px-4 py-2 shadow-sm text-sm font-medium rounded-full text-orange-700 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          ver detalhes
        </Link>
      </div>
    </div>
  );
}
