"use client";
import { createContext, useContext, ReactNode } from "react";

interface AccountContextType {
  accountId: string | null;
  account: any;
  currentAccount: any;
}

const AccountContext = createContext<AccountContextType>({ accountId: null, account: null, currentAccount: null });

export function AccountProvider({ children }: { children: ReactNode }) {
  return <AccountContext.Provider value={{ accountId: null, account: null, currentAccount: null }}>{children}</AccountContext.Provider>;
}

export function useAccountContext() {
  return useContext(AccountContext);
}

export const useAccount = useAccountContext;

export { AccountContext };
export default AccountContext;
