import { QueryClient } from '@tanstack/react-query';

// API Configuration - Use Supabase Edge Functions in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : `${SUPABASE_URL}/functions/v1`;

// Custom fetcher with retry logic
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Map API paths to Edge Functions in production
  let fullUrl = url.startsWith('http') ? url : url;
  
  if (process.env.NODE_ENV === 'production') {
    // Map /api/ routes to Edge Functions
    if (url.startsWith('/api/admin/ai-credentials')) {
      fullUrl = `${API_BASE_URL}/ai-credentials`;
    } else if (url.startsWith('/api/')) {
      // Other API routes aren't available in production yet
      console.warn(`API endpoint ${url} not available in production`);
      throw new Error('Backend endpoint not available');
    } else {
      fullUrl = `${API_BASE_URL}${url}`;
    }
  } else {
    fullUrl = `${API_BASE_URL}${url}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      ...options.headers,
    },
  };

  const response = await fetch(fullUrl, config);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Default query function
const defaultQueryFn = ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const [url, ...params] = queryKey as string[];
  const queryString = params.length > 0 ? `/${params.join('/')}` : '';
  return apiRequest(`${url}${queryString}`);
};

// Create QueryClient with optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default queryClient;
