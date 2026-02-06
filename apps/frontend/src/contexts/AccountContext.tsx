'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsApi, Account } from '@/lib/api/accounts';

interface AccountContextType {
  selectedAccountId: string;
  setSelectedAccountId: (accountId: string) => void;
  accounts: Account[];
  isLoading: boolean;
  error: Error | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const ACCOUNT_STORAGE_KEY = 'selectedAccountId';

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [selectedAccountId, setSelectedAccountIdState] = useState<string>('');

  // Fetch all accounts from API
  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.findAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes - accounts don't change often
  });

  const queryClient = useQueryClient();

  // Set default account on load
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      // Try to load from localStorage first
      if (typeof window !== 'undefined') {
        const savedAccountId = localStorage.getItem(ACCOUNT_STORAGE_KEY);
        if (savedAccountId && accounts.some((a) => a.id === savedAccountId)) {
          setSelectedAccountIdState(savedAccountId);
        } else {
          // Default to first account
          setSelectedAccountIdState(accounts[0].id);
        }
      }
    }
  }, [accounts, selectedAccountId]);

  // Save to localStorage when changed
  useEffect(() => {
    if (selectedAccountId && typeof window !== 'undefined') {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, selectedAccountId);
    }
  }, [selectedAccountId]);

  const setSelectedAccountId = (accountId: string) => {
    setSelectedAccountIdState(accountId);
    
    // Invalidate all queries to refresh data for new account
    // This ensures all entity lists update when account changes
    queryClient.invalidateQueries();
  };

  return (
    <AccountContext.Provider
      value={{
        selectedAccountId,
        setSelectedAccountId,
        accounts,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
}
