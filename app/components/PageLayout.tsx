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

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedInPromise: Promise<boolean>;
  customerEmailPromise: Promise<string | null>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedInPromise,
  customerEmailPromise,
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
          isLoggedIn={isLoggedInPromise}
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
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
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
                    <p>
                      View all results for <q>{term.current}</q>
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
        <nav className="flex flex-col gap-10 p-10">
          <Link onClick={() => { close(); }} to="/" className="text-title-h3 text-text-sub-600">home</Link>
          <Link onClick={() => close()} to="/collections/all" className="text-title-h3 text-text-sub-600">cardápio</Link>
          <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">parcerias</span>
          <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">blog</span>
          <span className="text-title-h3 text-text-sub-600 opacity-40 cursor-not-allowed">sobre</span>

          <div className="mt-20 border-t border-gray-300 pt-10">
            <h4 className="text-title-h4 text-text-sub-600 mb-4">minha conta</h4>
            {/* poderia adicionar links de conta futuramente */}
          </div>

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
