import { useCallback, useRef, useEffect } from 'react';
import { debounce, throttle } from '@/lib/performance';

/**
 * Hook for creating optimized callbacks with debouncing
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay) as T,
    [delay]
  );
}

/**
 * Hook for creating optimized callbacks with throttling
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    throttle((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, limit) as T,
    [limit]
  );
}

/**
 * Hook for creating memoized callbacks that only update when dependencies change
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}
