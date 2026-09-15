import { useEffect, useState } from "react";

/**
 * Returns a debounced version of a value.
 *
 * The returned value updates only after the specified delay
 * has passed without the original value changing.
 *
 * @param {*} value - Value to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {*} Debounced value.
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;