"use client";
import React, { createContext, useContext, type ReactNode } from "react";

interface AccountContextType {
  accountId: string | null;
  accountName: string | null;
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType>({
  accountId: null,
  accountName: null,
  isLoading: false,
});

export function AccountProvider({ children }: { children: ReactNode }) {
  return (
    <AccountContext.Provider value={{ accountId: null, accountName: null, isLoading: false }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccountContext() {
  return useContext(AccountContext);
}

export { AccountContext };
export default AccountContext;
