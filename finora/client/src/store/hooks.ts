import { useContext } from "react";
import { FinanceContext } from "./store.ts";

export function useFinance() {
  const value = useContext(FinanceContext);
  if (!value)
    throw new Error("FinanceProvider is required to use financial data.");
  return value;
}
