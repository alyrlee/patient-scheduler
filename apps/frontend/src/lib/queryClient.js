import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry logic with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Don't retry on 401 (unauthorized) - redirect to login
        if (error?.status === 401) {
          return false;
        }
        // Retry up to 3 times for other errors with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Refetch when reconnecting to network
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
      // Network error retry for mutations
      retryOnMount: false,
    },
  },
  // Global error handling
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});
