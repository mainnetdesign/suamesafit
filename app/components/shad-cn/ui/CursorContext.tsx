import { createContext, useContext } from "react";

export const CursorColorContext = createContext({
  color: "black",
  setColor: (color: string) => {},
  borderColor: "#303172",
  setBorderColor: (color: string) => {},
});

export const useCursorColor = () => useContext(CursorColorContext); 