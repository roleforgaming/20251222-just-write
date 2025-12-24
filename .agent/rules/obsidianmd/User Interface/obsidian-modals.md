---
trigger: model_decision
description: When the user wants to create or edit an obsidian modal
---

---
name: obsidian-modals
description: Guidelines for creating and using standard, suggestion, and fuzzy-search modals in Obsidian plugins.
filters:
  - glob: "**/*.ts"
---

# General Principles

- All modals must extend one of the base Obsidian `Modal` classes.
- To display a modal, instantiate it and call the `.open()` method.

```ts
// The basic invocation
new ExampleModal(this.app, /*...args*/).open();
```

### Common Usage Pattern

Modals are typically opened in response to a user action, such as executing a command.

```ts
// Inside a Plugin's `onload` method
this.addCommand({
  id: 'display-modal',
  name: 'Display modal',
  callback: () => {
    new GoodModal(this.app, (result) => {
      new Notice(`Result: ${result}`);
    }).open();
  },
});
```

---

## Basic Modal (`Modal`)

Use the base `Modal` class for simple information display or custom forms. Always use the `onOpen` and `onClose` lifecycle methods for building and tearing down the modal's content.

The most basic modal simply displays content using `setContent`.

```ts
import { App, Modal } from 'obsidian';

export class InfoModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    this.setTitle('Information');
    this.setContent('Look at me, I\'m a modal! 👀');
  }

  onClose() {
    this.contentEl.empty();
  }
}
```

### ❌ Wrong: Building complex UI in the constructor.

Do not add complex elements like `Setting` to `contentEl` inside the `constructor`, even though some documentation examples show this. The DOM element may not be attached to the document yet, and this pattern provides no clear method for cleanup, leading to potential memory leaks.

```ts
import { App, Modal, Setting } from 'obsidian';

export class BadModal extends Modal {
  // ❌ AVOID THIS PATTERN
  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    // This logic should be in `onOpen`.
    this.setTitle("What's your name?");

    let name = '';
    new Setting(this.contentEl)
      .setName('Name')
      .addText((text) => text.onChange((value) => { name = value; }));

    new Setting(this.contentEl)
      .addButton((btn) => btn.setButtonText('Submit').setCta()
        .onClick(() => {
          this.close();
          onSubmit(name);
        }));
  }
}
```

### ✅ Right: Use `onOpen` to build content and `onClose` to clean up.

This is the correct, lifecycle-aware approach. `onOpen` is called when the modal is attached to the DOM, and `onClose` is called just before it's removed. This pattern should be used for any modal more complex than a simple text display.

```ts
import { App, Modal, Setting, Notice } from 'obsidian';

export class GoodModal extends Modal {
  result: string;
  onSubmit: (result: string) => void;

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty(); // Start with a clean slate

    this.setTitle("What's your name?");

    new Setting(contentEl)
      .setName("Name")
      .addText((text) =>
        text.onChange((value) => {
          this.result = value
        }));

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.close();
            this.onSubmit(this.result);
          }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

---

## Suggest Modal (`SuggestModal`)

Extend `SuggestModal<T>` to present a filterable list of items to the user. You must implement three methods.

1.  **`getSuggestions(query: string): T[]`**: Return a list of items matching the user's query.
2.  **`renderSuggestion(item: T, el: HTMLElement)`**: Render a single item in the suggestion list.
3.  **`onChooseSuggestion(item: T, evt: MouseEvent | KeyboardEvent)`**: Handle the action when a user selects an item.

### ✅ Right: Implement all three required methods.

```ts
import { App, Notice, SuggestModal } from 'obsidian';

interface Book { title: string; author: string; }
const ALL_BOOKS: Book[] = [ /* ...data... */ ];

export class BookSuggestModal extends SuggestModal<Book> {
  getSuggestions(query:string): Book[] {
    return ALL_BOOKS.filter((book) =>
      book.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(book: Book, el: HTMLElement) {
    el.createEl("div", { text: book.title });
    el.createEl("small", { text: book.author });
  }

  onChooseSuggestion(book: Book, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${book.title}`);
  }
}
```

---

## Fuzzy Suggest Modal (`FuzzySuggestModal`)

Extend `FuzzySuggestModal<T>` for a powerful suggestion modal with built-in fuzzy search logic.

### ✅ Right: For simple fuzzy search, implement `getItems` and `getItemText`.

This is the fastest way to create a fuzzy-searchable list. Obsidian handles the filtering and rendering automatically.

```ts
import { App, Notice, FuzzySuggestModal } from "obsidian";

interface Book { title: string; author: string; }
const ALL_BOOKS: Book[] = [ /* ...data... */ ];

export class SimpleFuzzyModal extends FuzzySuggestModal<Book> {
  getItems(): Book[] {
    return ALL_BOOKS;
  }

  getItemText(book: Book): string {
    return book.title; // This is the string that will be searched.
  }

  onChooseItem(book: Book, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${book.title}`);
  }
}
```

### ✅ Right: For custom UI, additionally implement `renderSuggestion`.

To control the appearance of results and highlight matched characters, add the `renderSuggestion` method. Use the `renderResults` helper for highlighting.

```ts
import { FuzzySuggestModal, Notice, FuzzyMatch, renderResults } from "obsidian";

interface Book { title: string; author: string; }
const ALL_BOOKS: Book[] = [ /* ...data... */ ];

export class CustomFuzzyModal extends FuzzySuggestModal<Book> {
  getItems(): Book[] {
    return ALL_BOOKS;
  }

  getItemText(item: Book): string {
    // Provide a comprehensive string for searching.
    return item.title + " " + item.author;
  }

  onChooseItem(book: Book, evt: MouseEvent | KeyboardEvent) {
    new Notice(`Selected ${book.title}`);
  }

  renderSuggestion(match: FuzzyMatch<Book>, el: HTMLElement) {
    const titleEl = el.createDiv();
    renderResults(titleEl, match.item.title, match.match); // Highlight title

    const authorEl = el.createEl('small');
    const offset = -(match.item.title.length + 1); // Offset to search author
    renderResults(authorEl, match.item.author, match.match, offset);
  }
}
```

Of course. Upon a more rigorous re-evaluation of the source document against my previous output, I have identified a significant feature that was completely missed, as well as a subtle flaw in one of the code examples I provided.

My apologies for the oversight. The goal is technical completeness, and I will now correct it.

### Actionable Fixes

*   **Missing Context:** The concept of "Leaf groups" for creating linked views, and the associated `leaf.setGroup()` API method, are entirely missing from the rule file.
*   **Correction:** Add a new final section to the rule file titled `## Leaf Groups (Linked Views)`. This section should explain that `setGroup()` is used to link leaves and provide the example from the documentation.
*   **Reasoning:** This is a distinct feature of the Workspace API explicitly mentioned in the source document. Omitting it leaves the rules incomplete and prevents developers from learning how to implement the core "linked panes" functionality.

*   **Correction:** The code example for `### Individual Leaf Cleanup` is inefficient and potentially destructive. It calls `detachLeavesOfType` (a bulk operation) every time it opens a single view, which contradicts the purpose of managing an *individual* leaf.
*   **Correction:** Replace the `openMyView` method in the `Individual Leaf Cleanup` example with a more idiomatic pattern that checks if the leaf instance already exists before creating a new one.
    ```ts
    // Replace the existing openMyView method with this one:
    async openMyView() {
      // If our leaf is already open, just reveal it
      if (this.myLeaf && !this.myLeaf.detached) {
        this.app.workspace.revealLeaf(this.myLeaf);
        return;
      }
      // Otherwise, create a new leaf
      this.myLeaf = this.app.workspace.getRightLeaf(false);
      await this.myLeaf.setViewState({ type: 'my-custom-view', active: true });
      this.app.workspace.revealLeaf(this.myLeaf);
    }
    ```
*   **Reasoning:** The original example was functionally correct but demonstrated a poor practice. The corrected version is more efficient and accurately reflects the common use case for managing a single, persistent view without unnecessarily destroying and recreating other views of the same type.