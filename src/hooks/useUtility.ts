import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A hook that provides a debounced version of a value.
 * Useful for delaying updates that might be expensive or rapid.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * // Only triggered 500ms after searchTerm stops changing
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     searchApi(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set debouncedValue to value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Cancel the timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * A hook that returns the previous value of a variable.
 * Useful for comparing current and previous values.
 * 
 * @param value The value to track
 * @returns The previous value
 * 
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * console.log(`Current: ${count}, Previous: ${prevCount}`);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Options for the useLocalStorage hook
 */
export interface UseLocalStorageOptions<T> {
  /** Custom serialization function */
  serialize?: (value: T) => string;
  /** Custom deserialization function */
  deserialize?: (value: string) => T;
  /** Initial value if storage key doesn't exist */
  initialValue?: T;
  /** Whether to update storage when the value changes */
  updateStorage?: boolean;
  /** Callback when storage is updated */
  onStorageUpdate?: (newValue: T) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * A hook that synchronizes state with localStorage.
 * Provides persistent state that survives page refreshes.
 * 
 * @param key The localStorage key to use
 * @param options Configuration options
 * @returns A stateful value and a function to update it
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', { initialValue: 'light' });
 * 
 * // Theme will persist across page refreshes
 * const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((val: T) => T)) => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    initialValue,
    updateStorage = true,
    onStorageUpdate,
    onError
  } = options;
  
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue as T;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? deserialize(item) : initialValue as T;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      
      if (onError) {
        onError(error as Error);
      }
      
      return initialValue as T;
    }
  });
  
  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = deserialize(e.newValue);
          setStoredValue(newValue);
          
          if (onStorageUpdate) {
            onStorageUpdate(newValue);
          }
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
          
          if (onError) {
            onError(error as Error);
          }
        }
      }
    };
    
    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, deserialize, onStorageUpdate, onError]);
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage if updateStorage is true
      if (updateStorage && typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
      
      if (onStorageUpdate) {
        onStorageUpdate(valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      
      if (onError) {
        onError(error as Error);
      }
    }
  }, [key, serialize, storedValue, updateStorage, onStorageUpdate, onError]);
  
  return [storedValue, setValue];
}

/**
 * A hook that provides a throttled version of a callback function.
 * Useful for limiting the rate at which a function can fire.
 * 
 * @param callback The function to throttle
 * @param delay The minimum time between invocations (ms)
 * @returns A throttled version of the callback
 * 
 * @example
 * const handleScroll = useThrottle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 200);
 * 
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 200
): (...args: Parameters<T>) => void {
  const lastRan = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      lastArgs.current = args;
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        // If enough time has passed, run the callback immediately
        callback(...args);
        lastRan.current = now;
      } else {
        // Otherwise, schedule a delayed execution
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
        
        timeout.current = setTimeout(() => {
          if (lastArgs.current) {
            callback(...lastArgs.current);
            lastRan.current = Date.now();
            timeout.current = null;
          }
        }, delay - (now - lastRan.current));
      }
    },
    [callback, delay]
  );
}

/**
 * A hook that checks if the component is currently mounted.
 * Useful for avoiding state updates on unmounted components.
 * 
 * @returns A ref object that is true if the component is mounted
 * 
 * @example
 * const isMounted = useIsMounted();
 * 
 * useEffect(() => {
 *   fetchData().then(result => {
 *     // Only update state if component is still mounted
 *     if (isMounted.current) {
 *       setData(result);
 *     }
 *   });
 * }, []);
 */
export function useIsMounted(): { current: boolean } {
  const isMounted = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
}

/**
 * A hook for tracking window resize events.
 * 
 * @param options Optional configuration
 * @returns The current window dimensions
 * 
 * @example
 * const { width, height } = useWindowSize();
 * 
 * // Responsive layout based on window size
 * return (
 *   <div className={width < 768 ? 'mobile-layout' : 'desktop-layout'}>
 *     Content goes here
 *   </div>
 * );
 */
export function useWindowSize(options: { 
  throttleMs?: number;
  initialWidth?: number;
  initialHeight?: number;
} = {}) {
  const {
    throttleMs = 200,
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 0,
    initialHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  } = options;
  
  const [windowSize, setWindowSize] = useState({
    width: initialWidth,
    height: initialHeight
  });
  
  const handleResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, throttleMs);
  
  useEffect(() => {
    // Set size on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);
  
  return windowSize;
}

/**
 * A hook that provides a way to easily manage media queries.
 * 
 * @param query The media query to match
 * @returns Whether the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * return (
 *   <div>
 *     {isMobile ? 'Mobile View' : 'Desktop View'}
 *   </div>
 * );
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia(query);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      } 
      // Older browsers
      else if ('addListener' in mediaQuery) {
        // Using type assertion since addListener might not be recognized
        (mediaQuery as any).addListener(handleChange);
        return () => {
          (mediaQuery as any).removeListener(handleChange);
        };
      }
    }
    
    return undefined;
  }, [query]);
  
  return matches;
}