"use client";
import { createContext, useContext, ReactNode } from "react";

interface AccountContextType {
  accountId: string | null;
  account: any;
  currentAccount: any;
  currentLocation: any;
  currentRestaurant: any;
  currentRole: string | null;
  loading: boolean;
  locations: any[];
  restaurants: any[];
  refreshAccounts: () => void;
}

const defaultValue: AccountContextType = {
  accountId: null,
  account: null,
  currentAccount: null,
  currentLocation: null,
  currentRestaurant: null,
  currentRole: null,
  loading: false,
  locations: [],
  restaurants: [],
  refreshAccounts: () => {},
};

const AccountContext = createContext<AccountContextType>(defaultValue);

export function AccountProvider({ children }: { children: ReactNode }) {
  return <AccountContext.Provider value={defaultValue}>{children}</AccountContext.Provider>;
}

export function useAccountContext() {
  return useContext(AccountContext);
}

export const useAccount = useAccountContext;

export { AccountContext };
export default AccountContext;
