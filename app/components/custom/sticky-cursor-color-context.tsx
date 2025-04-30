import React, {createContext, useContext, useState, ReactNode} from 'react';

interface StickyCursorColorContextType {
  color: string;
  setColor: (color: string) => void;
}

const StickyCursorColorContext = createContext<StickyCursorColorContextType | undefined>(undefined);

export function StickyCursorColorProvider({children}: {children: ReactNode}) {
  const [color, setColor] = useState<string>('#00ffea'); // default color
  return (
    <StickyCursorColorContext.Provider value={{color, setColor}}>
      {children}
    </StickyCursorColorContext.Provider>
  );
}

export function useStickyCursorColor() {
  const context = useContext(StickyCursorColorContext);
  if (!context) {
    throw new Error('useStickyCursorColor must be used within a StickyCursorColorProvider');
  }
  return context;
} 