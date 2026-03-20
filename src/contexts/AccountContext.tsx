"use client";
import { createContext, useContext } from "react";

interface AccountContextType {
  accountId: string | null;
  account: any;
}

const AccountContext = createContext<AccountContextType>({ accountId: null, account: null });

export function useAccount() {
  return useContext(AccountContext);
}

export function AccountProvider({ children }: { children: any }) {
  return <AccountContext.Provider value={{ accountId: null, account: null }}>{children}</AccountContext.Provider>;
}

export default AccountContext;
