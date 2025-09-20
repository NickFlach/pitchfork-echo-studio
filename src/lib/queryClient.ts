import { QueryClient } from '@tanstack/react-query';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : ''; // In production, assume same origin

// Custom fetcher function for React Query
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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

// Create QueryClient with proper configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default queryClient;