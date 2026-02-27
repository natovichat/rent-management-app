'use client';

import React, { createContext, useContext } from 'react';

interface Account {
  id: string;
  name: string;
}

interface AccountContextType {
  selectedAccountId: string;
  setSelectedAccountId: (accountId: string) => void;
  accounts: Account[];
  isLoading: boolean;
  error: null;
}

const AccountContext = createContext<AccountContextType>({
  selectedAccountId: '',
  setSelectedAccountId: () => {},
  accounts: [],
  isLoading: false,
  error: null,
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  return (
    <AccountContext.Provider
      value={{
        selectedAccountId: '',
        setSelectedAccountId: () => {},
        accounts: [],
        isLoading: false,
        error: null,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
