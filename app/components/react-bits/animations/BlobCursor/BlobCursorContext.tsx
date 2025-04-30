// app/components/react-bits/animations/BlobCursor/BlobCursorContext.tsx
import React, {createContext, MutableRefObject, useContext, useRef, useState} from 'react';

type Proximity = {
  isActive: boolean;
  position: {x: number; y: number};
  targetRect?: DOMRect | null;
};

type BlobCursorContextType = {
  // stickyElement: MutableRefObject<HTMLElement | null>;
  // setStickyElement: (stickyElement: MutableRefObject<HTMLElement | null>) => void;
  proximity: Proximity | null;
  setProximity: (p: Proximity | null) => void;
};

const BlobCursorContext = createContext<BlobCursorContextType | undefined>(
  undefined,
);

export const useBlobCursorProximity = () => {
  const ctx = useContext(BlobCursorContext);
  if (!ctx)
    throw new Error(
      'useBlobCursorProximity must be used within BlobCursorProvider',
    );
  return ctx;
};

export const BlobCursorProvider: React.FC<{children: React.ReactNode}> = ({
  children,
  // stickyElement,
  // setStickyElement,
}) => {
  const [proximity, setProximity] = useState<Proximity | null>(null);
  return (
    <BlobCursorContext.Provider value={{proximity, setProximity}}>
      {children}
    </BlobCursorContext.Provider>
  );
};
