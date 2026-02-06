'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import theme from '@/lib/theme';
import { useState } from 'react';
import { AccountProvider } from '@/contexts/AccountContext';

// Create RTL cache for Emotion
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

/**
 * Providers component - Wraps app with necessary context providers.
 * 
 * Provides:
 * - React Query for data fetching
 * - MUI Theme with RTL support
 * - Emotion cache for RTL styling
 * - Account context for multi-account support
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance (one per component, not recreated on render)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AccountProvider>
            {children}
          </AccountProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
