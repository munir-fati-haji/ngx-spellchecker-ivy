import { BinarySearch } from './binary-search';
import { Levenshtein } from './levenshtein';
import { SpellCheckResult } from '../types/spell-checker-result';

export class Dictionary {
  private regExps: RegExp[] = [];
  private readonly collator = new Intl.Collator(undefined, { sensitivity: 'accent' });
  private readonly suggestRadius = 1000;

  public constructor(private wordlist: string[]) {}

  public setWordlist(words: string[]): void {
    this.wordlist = words;
  }

  public getLength(): number {
    return this.wordlist.length;
  }

  public setRegExps(patterns: RegExp[]): void {
    this.regExps = patterns;
  }

  public clearRegExps(): void {
    this.regExps = [];
  }

  public spellCheck(word: string): boolean {
    if (!word) return false;
    if (this.matchesRegEx(word)) return true;

    const index = BinarySearch.search(this.wordlist, word.toLowerCase(), this.collator.compare);
    return index >= 0;
  }

  public isMisspelled(word: string): boolean {
    return !this.spellCheck(word);
  }

  public getSuggestions(word: string, limit = 5, maxDistance = 3): string[] {
    if (!word) return [];

    const normalized = word.toLowerCase();
    const max = this.getValidDistance(normalized, maxDistance);
    const closest = BinarySearch.closest(this.wordlist, normalized, this.collator.compare);
    const buckets = this.generateDistanceBuckets(normalized, closest, max);

    return this.collectSuggestions(buckets, limit);
  }

  public checkAndSuggest(word: string, limit = 5, maxDistance = 3): SpellCheckResult {
    const normalized = word.toLowerCase();
    const raw = this.getSuggestions(word, limit + 1, maxDistance);

    const misspelled = raw.length === 0 || raw[0].toLowerCase() !== normalized;
    const suggestions = this.refineSuggestions(raw, misspelled, limit);

    return { misspelled: misspelled && !this.matchesRegEx(word), suggestions };
  }

  private matchesRegEx(word: string): boolean {
    return this.regExps.some((regex) => regex.test(word));
  }

  private getValidDistance(word: string, distance: number): number {
    return Math.min(Math.max(distance, 1), word.length - 1);
  }

  private generateDistanceBuckets(word: string, centerIndex: number, maxDistance: number): string[][] {
    return Array.from({ length: this.suggestRadius }).reduce<string[][]>((buckets, _, i) => {
      const index = this.offsetIndex(centerIndex, i);
      if (!this.isValidIndex(index)) return buckets;

      const candidate = this.wordlist[index];
      const distance = Levenshtein.distance(word, candidate.toLowerCase());

      if (distance > maxDistance) return buckets;

      return buckets.map((group, d) => (d === distance ? [...group, candidate] : group));
    }, this.initDistanceBuckets(maxDistance));
  }

  private offsetIndex(center: number, offset: number): number {
    return offset % 2 === 0 ? center - offset / 2 : center + Math.ceil(offset / 2);
  }

  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this.wordlist.length;
  }

  private initDistanceBuckets(maxDistance: number): string[][] {
    return Array.from({ length: maxDistance + 1 }, () => []);
  }

  private collectSuggestions(buckets: string[][], limit: number): string[] {
    return buckets.flat().slice(0, limit);
  }

  private refineSuggestions(raw: string[], misspelled: boolean, limit: number): string[] {
    if (!misspelled) return raw.slice(1);
    return raw.length > limit ? raw.slice(0, limit) : raw;
  }
}
