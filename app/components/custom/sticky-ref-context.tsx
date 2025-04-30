import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  MutableRefObject,
} from 'react';

interface StickyRefContextType {
  stickyRef: MutableRefObject<HTMLElement | null>;
}

const StickyRefContext = createContext<StickyRefContextType | undefined>(
  undefined,
);

export function StickyRefProvider({children}: {children: ReactNode}) {
  const stickyRef = useRef<HTMLElement | null>(null);
  return (
    <StickyRefContext.Provider value={{stickyRef}}>
      {children}
    </StickyRefContext.Provider>
  );
}

export function useStickyRef() {
  const context = useContext(StickyRefContext);
  if (!context) {
    throw new Error('useStickyRef must be used within a StickyRefProvider');
  }
  return context.stickyRef;
}
