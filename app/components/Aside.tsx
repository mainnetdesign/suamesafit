import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const leftAside = type === 'mobile';

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${leftAside ? 'left-aside' : ''} ${expanded ? 'expanded' : ''} ${!expanded ? 'overflow-hidden' : ''}`}
      role="dialog"
      style={!expanded ? {overflow: 'hidden'} : {}}
    >
      <button className="close-outside" onClick={close} />
      <aside className={`bg-yellow-50 ${leftAside ? 'left-aside' : ''} ${!expanded ? 'overflow-hidden' : ''}`} style={!expanded ? {overflow: 'hidden'} : {}}>
        <header className='border-none flex items-center justify-between'>
          {type === 'mobile' ? (
            <>
              <button className="close reset" onClick={close} aria-label="Close">
                <p className='text-title-h4 text-text-sub-600'>&times;</p>
              </button>
              <span />
            </>
          ) : (
            <>
              <h3 className='text-title-h4 text-text-sub-600'>
                {type === 'cart' ? 'carrinho' : heading}
              </h3>
              <button className="close reset" onClick={close} aria-label="Close">
                <p className='text-title-h4 text-text-sub-600'>&times;</p>
              </button>
            </>
          )}
        </header>
        <main className={type === 'cart' ? 'h-full flex flex-col' : ''}>{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
