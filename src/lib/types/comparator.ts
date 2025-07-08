/**
 * A function that compares two values.
 * @param a First value
 * @param b Second value
 * @returns A negative number if `a < b`, 0 if `a === b`, and a positive number if `a > b`.
 */
export type Comparator<T> = (a: T, b: T) => number;
