import {Await, Link} from '@remix-run/react';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {RiInstagramLine, RiLinkedinBoxFill, RiWhatsappLine} from 'react-icons/ri';
import {useAside} from '~/components/Aside';
import ProfileDropdown from '~/assets/components/custom/ProfileDropdown';
import * as  Button  from './align-ui/ui/button';


interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: boolean;
  customerData: {id: string; firstName: string; lastName: string; emailAddress?: {emailAddress: string}} | null;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  customerData,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside header={header} publicStoreDomain={publicStoreDomain} />
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}
      <main className="bg-[#FAF6EC] py-[32px] gap-10 flex flex-col">{children}</main>
      
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="busca">
      <div className="flex flex-col gap-4 px-4 predictive-search">
        
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="flex flex-row items-center gap-1">
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="pesquisar..."
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                className="w-full border-stroke-soft-200 rounded-full"
              />
              &nbsp;
              <Button.Root variant="primary" mode="lighter" className="" onClick={goToSearch}>
                Buscar
              </Button.Root>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p className='text-paragraph-md text-orange-500'>
                      Ver todos os resultados para <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  header,
  publicStoreDomain,
}: {
  header: PageLayoutProps['header'];
  publicStoreDomain: PageLayoutProps['publicStoreDomain'];
}) {
  const {close} = useAside();
  return (
    header.menu &&
    header.shop.primaryDomain?.url && (
      <Aside type="mobile" heading="MENU">
        <nav className="flex flex-col  px-4 py-8">
          <div className="flex flex-col gap-4">
            <Link onClick={() => { close(); }} to="/" className="text-title-h3 text-text-sub-600">home</Link>
            <Link onClick={() => close()} to="/collections/all" className="text-title-h3 text-text-sub-600">cardápio</Link>
            <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">parcerias</span>
            <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">blog</span>
            <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">sobre</span>
          </div>

          <div className="border-t border-gray-300 my-4" />

     
          <ProfileDropdown 
            mobile 
            onLoginClick={() => { close(); window.location.href='/account/login'; }}
            onOrdersClick={() => { close(); window.location.href='https://shopify.com/65347551301/account/orders'; }}
            onProfileClick={() => { close(); window.location.href='https://shopify.com/65347551301/account/profile'; }}
            className="relative" />

          <div className="border-t border-gray-300 my-4" />

          <div className="mt-auto flex gap-6 pt-10">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-text-sub-600"><RiLinkedinBoxFill size={28}/></a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-sub-600"><RiInstagramLine size={28}/></a>
            <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer" className="text-text-sub-600"><RiWhatsappLine size={28}/></a>
          </div>
        </nav>
      </Aside>
    )
  );
}
