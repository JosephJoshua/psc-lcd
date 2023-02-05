import { useEffect, useState } from 'react';

/**
 * @see https://usehooks.com/useDebounce/
 */
const useDebounce = <T>(value: T, delayMs: number) => {
  const [debouncedVal, setDebouncedVal] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedVal(value);
    }, delayMs);

    /**
     * Cancel the timeout everytime the value changes,
     * which effectively debounces the call to setDebouncedVal().
     */
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedVal;
};

export default useDebounce;
