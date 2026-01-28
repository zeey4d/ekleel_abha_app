import { useEffect, useState } from "react";

/**
 * A custom hook that delays updating a value until a specified time has passed.
 * Useful for search inputs to prevent API spamming while typing.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
// export function useDebounce<T>(value: T, delay: number = 500): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     // Set a timer to update the debounced value after the delay
//     const timer = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     // Clean up the timer if the value changes before the delay expires
//     // This prevents the previous value from being set
//     return () => {
//       clearTimeout(timer);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// }

// Helper hook for debounce (if not in codebase)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}