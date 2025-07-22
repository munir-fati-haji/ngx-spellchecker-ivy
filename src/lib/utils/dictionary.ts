// @ts-ignore
const BinarySearch = require('binarysearch');
// @ts-ignore
const Levenshtein = require('damerau-levenshtein');
import { SpellCheckResult } from '../types/spell-checker-result';

export class Dictionary {
  private regExps: RegExp[] = [];
  private readonly collator = new Intl.Collator(undefined, { sensitivity: 'accent' });
  private readonly suggestRadius = 1000;

  public constructor(private wordlist: string[]) {}

  public setWordlist(words: string[]): void {
    this.wordlist = words;
  }

  /**
   * Returns the number of words in the dictionary.
   * @returns {number} The length of the wordlist.
   * */
  public getLength(): number {
    return this.wordlist.length;
  }

  /**
   *
   * @param patterns An array of RegExp patterns to be used for spell checking.
   * Sets the regular expressions that will be used to match words against the dictionary.
   */
  public setRegExps(patterns: RegExp[]): void {
    this.regExps = patterns;
  }

  /**
   * Clears the regular expressions used for spell checking.
   * This will remove all previously set RegExp patterns.
   */
  public clearRegExps(): void {
    this.regExps = [];
  }

  /**
   * Checks if a word is spelled correctly according to the dictionary.
   * @param word The word to check.
   * @returns {boolean} True if the word is spelled correctly, false otherwise.
   */
  public spellCheck(word: string): boolean {
    if (!word) return false;
    if (this.matchesRegEx(word)) return true;

    const index = BinarySearch(this.wordlist, word.toLowerCase(), this.collator.compare);
    return index >= 0;
  }

  /**
   * Checks if a word is misspelled according to the dictionary.
   * @param word The word to check.
   * @returns {boolean} True if the word is misspelled, false otherwise.
   */
  public isMisspelled(word: string): boolean {
    return !this.spellCheck(word);
  }

  /**
   * Provides suggestions for a misspelled word based on the dictionary.
   * @param word The word to get suggestions for.
   * @param limit The maximum number of suggestions to return.
   * @param maxDistance The maximum Levenshtein distance for suggestions.
   * @returns {string[]} An array of suggested words.
   */
  public getSuggestions(word: string, limit = 5, maxDistance = 3): string[] {
    if (!word) return [];

    const normalized = word.toLowerCase();
    const max = this.getValidDistance(normalized, maxDistance);
    const closest = BinarySearch.closest(this.wordlist, normalized, this.collator.compare);
    const buckets = this.generateDistanceBuckets(normalized, closest, max);

    return this.collectSuggestions(buckets, limit);
  }

  /**
   * Checks a word and provides suggestions if it is misspelled.
   * @param word The word to check.
   * @param limit The maximum number of suggestions to return.
   * @param maxDistance The maximum Levenshtein distance for suggestions.
   * @returns {SpellCheckResult} An object containing the misspelled status and suggestions.
   */
  public checkAndSuggest(word: string, limit = 5, maxDistance = 3): SpellCheckResult {
    const normalized = word.toLowerCase();
    const raw = this.getSuggestions(word, limit + 1, maxDistance);

    const misspelled = raw.length === 0 || raw[0].toLowerCase() !== normalized;
    const suggestions = this.refineSuggestions(raw, misspelled, limit);

    return { misspelled: misspelled && !this.matchesRegEx(word), suggestions };
  }

  /**
   * Checks if a word matches any of the regular expressions set in the dictionary.
   * @param word The word to check against the regular expressions.
   * @returns {boolean} True if the word matches any RegExp, false otherwise.
   */
  private matchesRegEx(word: string): boolean {
    return this.regExps.some((regex) => regex.test(word));
  }

  /**
   * Ensures the distance is within valid bounds.
   * @param word The word to check against.
   * @param distance The distance to validate.
   * @returns {number} A valid distance value.
   */
  private getValidDistance(word: string, distance: number): number {
    return Math.min(Math.max(distance, 1), word.length - 1);
  }

  /**
   * Generates distance buckets for suggestions based on the Levenshtein distance.
   * @param word The word to generate suggestions for.
   * @param centerIndex The index of the closest word in the dictionary.
   * @param maxDistance The maximum Levenshtein distance for suggestions.
   * @returns {string[][]} An array of arrays, where each sub-array contains words at a specific distance.
   */
  private generateDistanceBuckets(word: string, centerIndex: number, maxDistance: number): string[][] {
    return Array.from({ length: this.suggestRadius }).reduce<string[][]>((buckets, _, i) => {
      const index = this.offsetIndex(centerIndex, i);
      if (!this.isValidIndex(index)) return buckets;

      const candidate = this.wordlist[index];
      const distance = Levenshtein(word, candidate.toLowerCase()).steps;

      if (distance > maxDistance) return buckets;

      return buckets.map((group, d) => (d === distance ? [...group, candidate] : group));
    }, this.initDistanceBuckets(maxDistance));
  }

  /**
   * Calculates the index offset based on the center index and the offset value.
   * @param center The center index.
   * @param offset The offset value.
   * @returns {number} The calculated index.
   */
  private offsetIndex(center: number, offset: number): number {
    return offset % 2 === 0 ? center - offset / 2 : center + Math.ceil(offset / 2);
  }

  /**
   * Checks if the index is within the bounds of the wordlist.
   * @param index The index to check.
   * @returns {boolean} True if the index is valid, false otherwise.
   */
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this.wordlist.length;
  }

  /**
   * Initializes the distance buckets for suggestions.
   * @param maxDistance The maximum distance for suggestions.
   * @returns {string[][]} An array of empty arrays for each distance level.
   */
  private initDistanceBuckets(maxDistance: number): string[][] {
    return Array.from({ length: maxDistance + 1 }, () => []);
  }

  /**
   * Collects suggestions from the distance buckets, limiting the number of suggestions returned.
   * @param buckets The distance buckets containing suggested words.
   * @param limit The maximum number of suggestions to return.
   * @returns {string[]} An array of collected suggestions.
   */
  private collectSuggestions(buckets: string[][], limit: number): string[] {
    return buckets.flat().slice(0, limit);
  }

  /**
   * Refines the suggestions based on whether the word is misspelled and the limit.
   * @param raw The raw suggestions collected.
   * @param misspelled Indicates if the word is misspelled.
   * @param limit The maximum number of suggestions to return.
   * @returns {string[]} An array of refined suggestions.
   */
  private refineSuggestions(raw: string[], misspelled: boolean, limit: number): string[] {
    if (!misspelled) return raw.slice(1);
    return raw.length > limit ? raw.slice(0, limit) : raw;
  }
}
