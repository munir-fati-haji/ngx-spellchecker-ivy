
# ngx-spellchecker-ivy

[![npm version](https://img.shields.io/npm/v/ngx-spellchecker-ivy.svg)](https://www.npmjs.com/package/ngx-spellchecker-ivy)

**ngx-spellchecker-ivy** is a simple Angular spellchecker library compatible with Angular Ivy and Angular 16+.  
It is a fork and continuation of the [ngx-spellchecker](https://www.npmjs.com/package/ngx-spellchecker) library, rewritten to support Angular's Ivy rendering engine and future Angular versions.

---

## Why ngx-spellchecker-ivy?

The original **ngx-spellchecker** library is not maintained anymore and does not support Angular Ivy. This causes incompatibilities starting from Angular 16, as Ivy is now the default and only supported rendering engine.  
**ngx-spellchecker-ivy** fixes this by supporting Ivy and providing the same spellchecking functionality with improved compatibility.

---

## Features

- Compatible with Angular Ivy
- Spellcheck words against a dictionary
- Suggest similar words using Levenshtein distance
- Regex support for ignoring certain patterns
- Dictionary normalization utilities
- Lightweight and easy to integrate

---

## Installation

```bash
npm install ngx-spellchecker-ivy
```

---

## Usage

### Import and Use SpellCheckerService

```typescript
import { Component, Inject } from '@angular/core';
import { SpellCheckerService, Dictionary, SpellCheckResult } from 'ngx-spellchecker-ivy';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private spellCheckerService = Inject(SpellCheckerService);
  private dictionary!: Dictionary;

  public constructor() {
    this.dictionary = this.spellCheckerService('example\nlist\nof\nwords\nfor\nspellchecking\n');
    
    // Example usage of spellCheck 
    this.dictionary.spellCheck('example'); // Returns True
    this.dictionary.spellCheck('exmple'); // Returns False

    // Example usage of Check and Suggest
    const result: SpellCheckResult = this.dictionary.checkAndSuggest('exmple');
    console.log(result); // { misspelled: true, suggestions: ['example'] }

    // Example usage of getSuggestions
    const suggestions: string[] = this.dictionary.getSuggestions('exmple');
    console.log(suggestions); // ['example']
  }
}

```

---

## API Reference

### SpellCheckerService

- `getDictionary(rawContent: string): Dictionary`  
  Creates a `Dictionary` instance from raw dictionary content string.

- `normalizeDictionary(content: string): Promise<string>`  
  Cleans, sorts, and normalizes raw dictionary content.

### Dictionary

- `spellCheck(word: string): boolean`  
  Checks if the word is spelled correctly.

- `isMisspelled(word: string): boolean`  
  Returns true if the word is misspelled.

- `getSuggestions(word: string, limit?: number, maxDistance?: number): string[]`  
  Returns suggestions for a misspelled word.

- `checkAndSuggest(word: string, limit?: number, maxDistance?: number): SpellCheckResult`  
  Returns misspelled status and suggestions.

- `setRegExps(patterns: RegExp[]): void`  
  Add regex patterns to ignore in spell checking.

- `clearRegExps(): void`  
  Clear regex patterns.

---

## Differences from `ngx-spellchecker`

- Supports Angular Ivy and Angular 16+
- Updated TypeScript and Angular best practices

---

## Contributing

Contributions are welcome! Please open issues or pull requests on the [GitHub repository](#) (add your repo link here).

---

## License

MIT License © Munir

---

## Acknowledgments

This project is a fork of the original [ngx-spellchecker](https://www.npmjs.com/package/ngx-spellchecker) by [original author](link if known).
