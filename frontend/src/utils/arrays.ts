/**
 * Utility functions for safe array handling, especially important for
 * upgrade resilience when dealing with potentially undefined/null values
 * from backend data that may have been created before schema changes.
 */

/**
 * Normalizes a value to an array, treating undefined, null, or non-array values as empty arrays.
 * This is critical for upgrade safety when link arrays or entity collections may be missing.
 * 
 * @param value - The value to normalize (may be undefined, null, or any type)
 * @returns A safe array (empty if input was not a valid array)
 */
export function normalizeToArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Normalizes multiple array values at once, returning an object with the same keys.
 * Useful for normalizing all link arrays from a backend entity in one call.
 * 
 * @param arrays - Object with keys mapping to potentially undefined/null array values
 * @returns Object with same keys, all values normalized to arrays
 */
export function normalizeArrays<T extends Record<string, unknown>>(
  arrays: T
): { [K in keyof T]: T[K] extends unknown[] ? T[K] : never[] } {
  const result: any = {};
  for (const key in arrays) {
    result[key] = normalizeToArray(arrays[key]);
  }
  return result;
}

/**
 * Safely gets the length of an array-like value, returning 0 for undefined/null/non-arrays.
 * 
 * @param value - The value to check
 * @returns The length of the array, or 0 if not a valid array
 */
export function safeArrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Checks if a value is a non-empty array.
 * 
 * @param value - The value to check
 * @returns True if the value is an array with at least one element
 */
export function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}
