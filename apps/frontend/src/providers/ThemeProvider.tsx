'use client';

import { CacheProvider } from '@emotion/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { ReactNode, useMemo } from 'react';
import theme from '@/lib/theme';

/**
 * RTL-aware Emotion cache with stylis-plugin-rtl.
 * This ensures all CSS is properly transformed for RTL layout.
 */
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

/**
 * React Query client configuration.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that wraps the application with:
 * - RTL Emotion cache for proper CSS transformation
 * - MUI ThemeProvider with Hebrew RTL theme
 * - React Query provider for server state management
 * - CssBaseline for consistent styling
 * 
 * @param children - React children to wrap
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CacheProvider value={cacheRtl}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
}
