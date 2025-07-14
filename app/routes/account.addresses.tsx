import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
  type Fetcher,
} from '@remix-run/react';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: MetaFunction = () => {
  return [{title: 'Endereços'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {address, defaultAddress},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {addressId: decodeURIComponent(addressId)},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  return (
    <Form id={addressId}>
      <fieldset>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label
              htmlFor={`firstName-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Nome*
            </label>
            <div className="mt-1">
              <input
                id={`firstName-${addressId}`}
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Nome"
                aria-label="Nome"
                defaultValue={address?.firstName ?? ''}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`lastName-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Sobrenome*
            </label>
            <div className="mt-1">
              <input
                id={`lastName-${addressId}`}
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Sobrenome"
                aria-label="Sobrenome"
                defaultValue={address?.lastName ?? ''}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`company-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Empresa
            </label>
            <div className="mt-1">
              <input
                id={`company-${addressId}`}
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Empresa (opcional)"
                aria-label="Empresa"
                defaultValue={address?.company ?? ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`address1-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Endereço*
            </label>
            <div className="mt-1">
              <input
                id={`address1-${addressId}`}
                name="address1"
                type="text"
                autoComplete="address-line1"
                placeholder="Rua, número e bairro"
                aria-label="Endereço"
                defaultValue={address?.address1 ?? ''}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`address2-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Complemento
            </label>
            <div className="mt-1">
              <input
                id={`address2-${addressId}`}
                name="address2"
                type="text"
                autoComplete="address-line2"
                placeholder="Apto, bloco, etc. (opcional)"
                aria-label="Complemento"
                defaultValue={address?.address2 ?? ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`city-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Cidade*
            </label>
            <div className="mt-1">
              <input
                id={`city-${addressId}`}
                name="city"
                type="text"
                required
                autoComplete="address-level2"
                placeholder="Cidade"
                aria-label="Cidade"
                defaultValue={address?.city ?? ''}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`zoneCode-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Estado*
            </label>
            <div className="mt-1">
              <input
                id={`zoneCode-${addressId}`}
                name="zoneCode"
                type="text"
                autoComplete="address-level1"
                placeholder="Estado"
                aria-label="Estado"
                defaultValue={address?.zoneCode ?? ''}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`zip-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              CEP*
            </label>
            <div className="mt-1">
              <input
                id={`zip-${addressId}`}
                name="zip"
                type="text"
                autoComplete="postal-code"
                placeholder="CEP"
                aria-label="CEP"
                defaultValue={address?.zip ?? ''}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`territoryCode-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              País*
            </label>
            <div className="mt-1">
              <input
                id={`territoryCode-${addressId}`}
                name="territoryCode"
                type="text"
                autoComplete="country"
                placeholder="País"
                aria-label="País"
                defaultValue={address?.territoryCode ?? ''}
                required
                maxLength={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`phoneNumber-${addressId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <div className="mt-1">
              <input
                id={`phoneNumber-${addressId}`}
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+55 (11) 99999-9999"
                aria-label="Telefone"
                defaultValue={address?.phoneNumber ?? ''}
                pattern="^\+?[1-9]\d{3,14}$"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center">
          <input
            id={`defaultAddress-${addressId}`}
            name="defaultAddress"
            type="checkbox"
            defaultChecked={isDefaultAddress}
            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label
            htmlFor={`defaultAddress-${addressId}`}
            className="ml-2 block text-sm text-gray-900"
          >
            Definir como endereço padrão
          </label>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Ocorreu um erro
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6">
          {children({
            stateForMethod: (method) =>
              formMethod === method ? state : 'idle',
          })}
        </div>
      </fieldset>
    </Form>
  );
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px]">
        <div className="rounded-lg shadow-sm">
          <div className="py-4">
            <h5 className="text-title-h5 text-text-sub-600">meus endereços</h5>
            <p className="mt-1 text-sm text-text-sub-600">
              gerencie seus endereços de entrega
            </p>
          </div>

          <div className="">
            {!addresses.nodes.length ? (
              <EmptyAddresses />
            ) : (
              <div className="space-y-8 md:w-fit">
                <div>
                  <h6 className="text-title-h6 text-text-sub-600 mb-4">
                    adicionar novo endereço
                  </h6>
                  <NewAddressForm />
                </div>

                <div>
                  <h6 className="text-title-h6 text-text-sub-600 mb-4">
                    endereços salvos
                  </h6>
                  <ExistingAddresses
                    addresses={addresses}
                    defaultAddress={defaultAddress}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyAddresses() {
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Nenhum endereço cadastrado
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Comece adicionando um endereço para facilitar suas compras.
      </p>
      <div className="mt-6">
        <NewAddressForm />
      </div>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 md:w-fit">
      <AddressForm
        addressId={'NEW_ADDRESS_ID'}
        address={newAddress}
        defaultAddress={null}
      >
        {({stateForMethod}) => (
          <div className="flex justify-end">
            <button
              disabled={stateForMethod('POST') !== 'idle'}
              formMethod="POST"
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {stateForMethod('POST') !== 'idle' ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Criando...
                </>
              ) : (
                'Criar Endereço'
              )}
            </button>
          </div>
        )}
      </AddressForm>
    </div>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {addresses.nodes.map((address) => (
        <div
          key={address.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {address.firstName} {address.lastName}
              </h3>
              {defaultAddress?.id === address.id && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Padrão
                </span>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-4">
              {address.company && <p>{address.company}</p>}
              <p>{address.address1}</p>
              {address.address2 && <p>{address.address2}</p>}
              <p>
                {address.city}, {address.zoneCode} {address.zip}
              </p>
              <p>{address.territoryCode}</p>
              {address.phoneNumber && <p>{address.phoneNumber}</p>}
            </div>
          </div>

          <div className="px-6 py-3 rounded-b-lg">
            <AddressForm
              addressId={address.id}
              address={address}
              defaultAddress={defaultAddress}
            >
              {({stateForMethod}) => (
                <div className="flex justify-end space-x-3">
                  <button
                    disabled={stateForMethod('PUT') !== 'idle'}
                    formMethod="PUT"
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {stateForMethod('PUT') !== 'idle'
                      ? 'Salvando...'
                      : 'Salvar'}
                  </button>
                  <button
                    disabled={stateForMethod('DELETE') !== 'idle'}
                    formMethod="DELETE"
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {stateForMethod('DELETE') !== 'idle'
                      ? 'Excluindo...'
                      : 'Excluir'}
                  </button>
                </div>
              )}
            </AddressForm>
          </div>
        </div>
      ))}
    </div>
  );
}
