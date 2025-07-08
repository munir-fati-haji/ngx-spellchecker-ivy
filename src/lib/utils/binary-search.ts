import { Comparator } from '../types/comparator';

export class BinarySearch {
  public static search<T>(list: T[], target: T, compare: Comparator<T>): number {
    return this.recursiveSearch(list, target, compare, 0, list.length - 1);
  }

  private static recursiveSearch<T>(list: T[], target: T, compare: Comparator<T>, start: number, end: number): number {
    if (this.isOutOfBounds(start, end)) return -1;

    const mid = this.getMiddleIndex(start, end);
    const comparison = compare(list[mid], target);

    if (this.isEqual(comparison)) return mid;
    if (this.isLess(comparison)) {
      return this.recursiveSearch(list, target, compare, mid + 1, end);
    }

    return this.recursiveSearch(list, target, compare, start, mid - 1);
  }

  public static closest<T>(list: T[], target: T, compare: Comparator<T>): number {
    if (list.length === 0) return -1;

    let start = 0;
    let end = list.length - 1;
    let closestIndex = -1;

    while (!this.isOutOfBounds(start, end)) {
      const mid = this.getMiddleIndex(start, end);
      const comparison = compare(list[mid], target);

      if (this.isEqual(comparison)) return mid;

      if (this.shouldUpdateClosest(closestIndex, list, mid, target, compare)) {
        closestIndex = mid;
      }

      if (this.isLess(comparison)) start = mid + 1;
      else end = mid - 1;
    }

    return closestIndex;
  }

  private static shouldUpdateClosest<T>(
    currentIndex: number,
    list: T[],
    candidateIndex: number,
    target: T,
    compare: Comparator<T>,
  ): boolean {
    if (currentIndex === -1) return true;

    const candidate = list[candidateIndex];
    const currentClosest = list[currentIndex];

    return this.isCloser(candidate, currentClosest, target, compare);
  }

  private static isCloser<T>(candidate: T, currentClosest: T, target: T, compare: Comparator<T>): boolean {
    const a = Math.abs(compare(candidate, target));
    const b = Math.abs(compare(currentClosest, target));
    return a < b;
  }

  private static getMiddleIndex(start: number, end: number): number {
    return Math.floor((start + end) / 2);
  }

  private static isEqual(result: number): boolean {
    return result === 0;
  }

  private static isLess(result: number): boolean {
    return result < 0;
  }

  private static isOutOfBounds(start: number, end: number): boolean {
    return start > end;
  }
}
