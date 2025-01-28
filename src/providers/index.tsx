'use client';

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { AuthProvider } from './Auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
