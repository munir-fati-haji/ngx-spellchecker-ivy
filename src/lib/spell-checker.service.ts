import { Injectable } from '@angular/core';
import { Dictionary } from './utils/dictionary';

@Injectable({
  providedIn: 'root',
})
export class SpellCheckerService {
  public getDictionary(rawContent: string): Dictionary {
    const lines = rawContent.split('\n');
    return new Dictionary(lines);
  }

  public async normalizeDictionary(content: string): Promise<string> {
    const stripped = this.stripBOM(content).replace(/\r/g, '');
    const sortedLines = this.sortLines(stripped);
    return this.joinCleanLines(sortedLines);
  }

  private stripBOM(text: string): string {
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  private sortLines(text: string): string[] {
    const lines = text.split('\n').filter(Boolean);
    const collator = new Intl.Collator();
    return lines.sort(collator.compare);
  }

  private joinCleanLines(lines: string[]): string {
    return lines.filter(Boolean).join('\n');
  }
}
