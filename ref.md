---
name: obsidian-ui-components
description: Rules for adding and managing core Obsidian UI elements like the ribbon and status bar.
filters:
  glob: "**/*.ts"
---

# Obsidian UI Components

## Ribbon Actions

The ribbon is the vertical icon bar on the far left of the interface.

### ✅ Add a Ribbon Icon

- Place the call to `this.addRibbonIcon()` inside the `async onload() { ... }` method of your plugin class.
- The method takes three arguments: the icon ID, a tooltip title, and a callback function.
- Find available icon IDs in the official Obsidian developer documentation. Using an invalid ID will not display an icon.

```ts
// In async onload():
this.addRibbonIcon('dice', 'Sample action', () => {
  console.log('Ribbon icon clicked!');
});
```

### ❌ WRONG: Relying solely on the ribbon for functionality

Users can hide the ribbon or remove individual plugin icons. Critical functionality must be accessible through other means, like a command.

```ts
// ❌ BAD: This action is ONLY available from the ribbon.
import { Plugin } from 'obsidian';

export default class BadPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('vault', 'Do critical task', () => {
      this.doCriticalTask();
    });
  }
  doCriticalTask() { /* ... */ }
}
```

### ✅ RIGHT: Provide a command as an alternative

Always register a command for any action added to the ribbon. This ensures users can always access the functionality via the command palette or by assigning it a hotkey.

```ts
// ✅ GOOD: The action is available via the ribbon AND the command palette.
import { Plugin } from 'obsidian';

export default class GoodPlugin extends Plugin {
  async onload() {
    // Add the icon, which calls the command.
    this.addRibbonIcon('vault', 'Do critical task', () => {
      this.app.commands.executeCommandById('my-plugin:do-critical-task');
    });

    // Register the command itself.
    this.addCommand({
      id: 'do-critical-task',
      name: 'Do critical task',
      callback: () => {
        this.doCriticalTask();
      },
    });
  }
  doCriticalTask() { /* ... */ }
}
```

## Status Bar Items

The status bar is the horizontal bar at the bottom of the application window.

### ❌ WRONG: Assuming status bar is available on mobile

The status bar is a desktop-only feature. It is **not** displayed on Obsidian mobile apps. Do not place critical information or functionality exclusively in the status bar.

### ✅ Add a Status Bar Item

- Use `this.addStatusBarItem()` within the `onload()` method.
- This returns an `HTMLElement` that you can add content to using methods like `createEl()`.

```ts
// Right: Add a simple text element to the status bar.
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    const item = this.addStatusBarItem();
    item.createEl('span', { text: 'Hello from the status bar 👋' });
  }
}
```

### ❌ WRONG: Creating multiple items for logically grouped elements

Calling `addStatusBarItem()` multiple times for related elements will add unwanted default spacing between them and treat them as separate components.

```ts
// ❌ BAD: Creates two separate status bar items with a gap between them.
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    const fruits = this.addStatusBarItem();
    fruits.createEl('span', { text: '🍎' });

    const moreFruits = this.addStatusBarItem();
    moreFruits.createEl('span', { text: '🍌' });
  }
}
```

### ✅ RIGHT: Grouping related elements into one item

To control the layout and spacing of related elements, create a single status bar item and append multiple child elements to it.

```ts
// ✅ GOOD: Creates one status bar item containing two icons with no extra gap.
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    const fruits = this.addStatusBarItem();
    fruits.createEl('span', { text: '🍎' });
    fruits.createEl('span', { text: '🍌' });
  }
}
```

---

---
name: obsidian-ui
description: Rules for creating user interface elements like icons, HTML elements, and menus in Obsidian plugins.
filters:
  glob: "**/*.ts"
---

## HTML Element Creation

- Obtain a container element (`containerEl`) from API components like a `PluginSettingTab` or `View` before using `createEl`.
- Use the Obsidian-provided `createEl()` method on a container element to build your UI. This is the idiomatic and preferred approach.

- ❌ **Wrong:** Using standard `document.createElement`. It is verbose and bypasses Obsidian's helpers.
  ```ts
  const h1 = document.createElement('h1');
  h1.textContent = 'My Settings';
  containerEl.appendChild(h1);
  ```

- ✅ **Right:** Using the built-in `createEl()` helper.
  ```ts
  containerEl.createEl('h1', { text: 'My Settings' });
  ```

- ✅ **Right:** Chain `createEl()` calls to create nested structures.
  ```ts
  const book = containerEl.createEl('div', { cls: 'book' });
  book.createEl('div', { text: 'How to Take Smart Notes', cls: 'book__title' });
  book.createEl('small', { text: 'Sönke Ahrens', cls: 'book__author' });
  ```

## Styling Elements

- Add custom styles by creating a `styles.css` file in your plugin's root directory.
- Always use Obsidian's CSS variables to ensure your plugin's UI is compatible with user themes.

- ❌ **Wrong:** Using hard-coded color or style values.
  ```css
  .my-plugin-text {
    color: #888888; /* Breaks with dark/light themes */
    border: 1px solid #ddd;
  }
  ```

- ✅ **Right:** Using Obsidian's theme-aware CSS variables.
  ```css
  .my-plugin-text {
    color: var(--text-muted);
    border: 1px solid var(--background-modifier-border);
  }
  ```

- To conditionally apply a class, use the `toggleClass` helper.
  ```ts
  element.toggleClass('is-error', status === 'error');
  ```

## Icons

### Using Built-in Icons

- Use the `setIcon()` utility to add a built-in icon to an HTML element.
- Browse available icons at [lucide.dev](https://lucide.dev/). Note: Only versions up to v0.446.0 are supported.

- ✅ **Right:** Call `setIcon()` on the target element.
  ```ts
  import { Plugin, setIcon } from 'obsidian';

  // ...
  const statusBarItem = this.addStatusBarItem();
  setIcon(statusBarItem, 'info'); // 'info' is a valid Lucide icon name
  ```

### Sizing Icons

- To change the size of an icon, set the `--icon-size` CSS variable on its container.
- Use Obsidian's preset size variables for consistency.

- ✅ **Right:** Apply the `--icon-size` variable in your CSS.
  ```css
  .my-custom-icon-container {
    --icon-size: var(--icon-size-m); /* m = medium, s = small, l = large */
  }
  ```

### Adding Custom Icons

- Use the `addIcon()` utility to register a custom SVG icon, making it available globally by its name for use in any component (e.g., `setIcon`, `addRibbonIcon`).

- ❌ **Wrong:** Including the outer `<svg>` wrapper tag in the SVG string.
  ```ts
  addIcon('my-icon', `<svg viewBox="0 0 100 100"><circle ... /></svg>`);
  ```

- ✅ **Right:** Provide only the inner SVG content. The `viewBox` must be `0 0 100 100`.
  ```ts
  import { addIcon } from 'obsidian';

  addIcon('my-icon', `<circle cx="50" cy="50" r="50" fill="currentColor" />`);

  // Now you can use 'my-icon' like any other icon
  this.addRibbonIcon('my-icon', 'My custom action', () => {});
  ```

### Icon Design Guidelines

Ensure custom icons match Obsidian's style by following Lucide's guidelines:
- Canvas: 24x24 pixels
- Padding: 1px minimum
- Stroke width: 2px
- Joins & Caps: Round
- Stroke: Centered
- Border Radius: 2px for shapes
- Spacing: 2px between distinct elements
- Use [Lucide's official templates](https://github.com/lucide-icons/lucide/blob/main/CONTRIBUTING.md) for Figma, Illustrator, or Inkscape.

## Context Menus

### Creating Standalone Menus

- Instantiate a `new Menu()` to create a context menu.
- Use `showAtMouseEvent(event)` as the default way to display it at the cursor's position.
- For more control, use `showAtPosition({x, y})` to open the menu at a specific coordinate relative to the window.

- ✅ **Right:** Create, populate, and show the menu on a user event (e.g., a ribbon icon click).
  ```ts
  this.addRibbonIcon('dice', 'Open menu', (event: MouseEvent) => {
    const menu = new Menu();

    menu.addItem((item) =>
      item
        .setTitle('Copy')
        .setIcon('documents')
        .onClick(() => new Notice('Copied'))
    );

    menu.showAtMouseEvent(event);
  });
  ```

### Adding to Existing Menus

- To add items to Obsidian's built-in menus, register an event listener for `file-menu` or `editor-menu`.

- ✅ **Right:** Use `this.registerEvent` to hook into the workspace menu events.
  ```ts
  // Add to the file explorer context menu
  this.registerEvent(
    this.app.workspace.on('file-menu', (menu, file) => {
      menu.addItem((item) => {
        item
          .setTitle('My File Action')
          .setIcon('document')
          .onClick(() => new Notice(file.path));
      });
    })
  );

  // Add to the editor context menu
  this.registerEvent(
    this.app.workspace.on("editor-menu", (menu, editor, view) => {
      menu.addItem((item) => {
        item
          .setTitle('My Editor Action')
          .setIcon('pencil')
          .onClick(() => new Notice(view.file.path));
      });
    })
  );
  ```
```

---

---
name: obsidian-views
description: Defines the standard pattern for creating, registering, and activating custom ItemViews in Obsidian plugins.
filters:
  glob: "**/*.ts"
---

# Obsidian Custom Views

## View Class Implementation

Define a custom view by extending `ItemView`. Always export a constant for the `viewType` to avoid magic strings.

- **`getViewType()`**: Return the unique string identifier for the view. Use the exported constant.
- **`getDisplayText()`**: Return the human-readable name for the view, used in UI elements like tab headers.
- **`onOpen()`**: Build the view's DOM inside `this.contentEl`. This method is called when the view is first opened.
- **`onClose()`**: Clean up all resources, event listeners, or intervals created in `onOpen`.

✅ **Right:**
```ts
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example view';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Example view' });
  }

  async onClose() {
    // Clean up any resources, listeners, etc.
  }
}
```

## View Registration & Activation

- Register your view in the plugin's `onload` method using `this.registerView()`.
- The second argument must be a factory function that returns a new instance of your view.
- Include the standard `onunload` method for a complete plugin structure.

✅ **Right:**
```ts
// In main.ts or plugin entry file

import { Plugin } from 'obsidian';
import { ExampleView, VIEW_TYPE_EXAMPLE } from './view';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => new ExampleView(leaf)
    );

    this.addRibbonIcon('dice', 'Activate view', () => {
      this.activateView();
    });
  }

  async onunload() {
    // Any cleanup logic would go here.
  }

  async activateView() {
    // ... activation logic defined below
  }
}
```

## View State Management & Access

This is a critical rule. **Never manage references to views directly in your plugin.** Obsidian may call the view factory function multiple times, which would lead to stale references.

❌ **Wrong:** Storing a view instance as a plugin property.

```ts
// DO NOT DO THIS
export default class ExamplePlugin extends Plugin {
  myView: ExampleView; // Bad: direct reference

  async onload() {
    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => {
        this.myView = new ExampleView(leaf); // Bad: side-effect in factory
        return this.myView;
      }
    );
  }
}
```

✅ **Right:** Always query for active view instances using `workspace.getLeavesOfType()`.

```ts
// Correctly access view instances on-demand
async somePluginMethod() {
  this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE).forEach((leaf) => {
    if (leaf.view instanceof ExampleView) {
      // Now you can safely access the view instance and its methods
      // leaf.view.someMethod();
    }
  });
}
```

## Standard View Activation Logic

When activating a view, follow this pattern:
1.  Check if a leaf with the view already exists using `workspace.getLeavesOfType()`.
2.  If not, create a new leaf (e.g., in the sidebar or main pane).
3.  Use `leaf.setViewState()` to assign your view to the new leaf. The `active: true` flag makes it the visible tab in its pane.
4.  Always call `workspace.revealLeaf()` to ensure the leaf is visible to the user.

✅ **Right:**
```ts
// In main.ts or plugin entry file

async activateView() {
  const { workspace } = this.app;

  let leaf: WorkspaceLeaf | null = null;
  const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

  if (leaves.length > 0) {
    // A leaf with our view already exists, use that
    leaf = leaves[0];
  } else {
    // Our view could not be found in the workspace, create a new leaf.
    // For a new tab in the main pane, use `workspace.getLeaf(true)`.
    leaf = workspace.getRightLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
  }

  // "Reveal" the leaf in case it is in a collapsed sidebar
  workspace.revealLeaf(leaf);
}
```

---

## Workflow: create-view

Creates a new `ItemView`, registers it, and adds activation logic.

1.  Ask the user for the name of the new view (e.g., "My Awesome View").
2.  From the name, generate a PascalCase class name (`MyAwesomeView`), a SCREAMING_SNAKE_CASE constant name (`MY_AWESOME_VIEW_TYPE`), and a kebab-case view type string (`my-awesome-view`).
3.  Create a new file `./src/[ClassName].ts` with the boilerplate `ItemView` class implementation using the generated names.
4.  In `main.ts`, add an `import` for the new view class and its type constant.
5.  In the `onload` method of `main.ts`, add the `this.registerView(...)` call.
6.  In `main.ts`, add the standard `activateView` method, renaming it to reflect the new view (e.g., `activateMyAwesomeView`).
7.  In the `onload` method, add a `this.addRibbonIcon(...)` call that triggers the new activation method.
8.  Inform the user of all files created and modified.

---

---
name: obsidian-commands
description: Defines best practices for creating commands in Obsidian plugins.
filters:
  glob: "**/*.ts"
---

# Obsidian Plugin Commands

## General Registration

- Register all commands within the `onload()` method of your `Plugin` class.
- Every command requires a unique `id` and a user-facing `name`.
- The `id` should be descriptive and unique to your plugin to avoid conflicts. A common convention is to prefix it with your plugin's name.

```ts
import { Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: 'print-greeting-to-console',
      name: 'Print greeting to console',
      callback: () => {
        console.log('Hey, you!');
      },
    });
  }
}
```

## Conditional Commands

Use `checkCallback` to prevent commands from appearing in the Command Palette when their preconditions are not met. The callback runs twice: once to check (`checking: true`) and once to execute (`checking: false`).

❌ **Wrong:** Using a simple `callback` that does nothing if a condition isn't met. The command is still visible but non-functional.

```ts
// BAD: Command appears even if `getRequiredValue()` is null.
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  callback: () => {
    const value = getRequiredValue();
    if (value) {
      doCommand(value);
    }
    // else, nothing happens.
  },
});
```

✅ **Right:** Use `checkCallback`. The command is hidden from the user if the initial check returns `false`.

```ts
// GOOD: Command is hidden if `getRequiredValue()` is null.
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  checkCallback: (checking: boolean) => {
    const value = getRequiredValue();

    if (value) {
      if (!checking) {
        doCommand(value);
      }
      return true; // Tell Obsidian the command is available.
    }

    return false; // Tell Obsidian to hide the command.
  },
});
```

## Editor Commands

For commands that interact with the editor, use `editorCallback` or `editorCheckCallback` to get direct access to the `editor` and `view` context. These commands will only appear when an editor is active.

### Direct vs. Conditional Editor Access

❌ **Wrong:** Using a simple `callback` and manually trying to access the active editor state. This is verbose and less reliable.

✅ **Right:** Use `editorCallback` for direct, clean access to the active editor instance.

```ts
// GOOD: Provides editor and view directly.
this.addCommand({
  id: 'log-selection-command',
  name: 'Log selection',
  editorCallback: (editor: Editor, view: MarkdownView) => {
    console.log(editor.getSelection());
  },
});
```

❌ **Wrong:** Using `editorCallback` for an action that has additional conditions.

✅ **Right:** Use `editorCheckCallback` for conditional editor commands, following the same pattern as `checkCallback`.

```ts
// GOOD: Command is hidden if a required value is missing.
this.addCommand({
  id: 'conditional-editor-command',
  name: 'Conditional editor command',
  editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
    const value = getRequiredValue();

    if (value) {
      if (!checking) {
        // Perform action with editor and value
        editor.replaceSelection(`Value is: ${value}`);
      }
      return true;
    }

    return false;
  },
});
```

## Default Hotkeys

For public plugins, you **MUST NOT** define default hotkeys. This prevents conflicts with user settings and other plugins.

❌ **Wrong:** Hard-coding a default hotkey in a public plugin.

```ts
// BAD: This is highly likely to conflict with other plugins or user settings.
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'a' }],
  callback: () => { /* ... */ },
});
```

✅ **Right:** Omit the `hotkeys` property entirely. Let users configure their own hotkeys in Obsidian's settings.

```ts
// GOOD: No default hotkey is defined, preventing conflicts.
this.addCommand({
  id: 'example-command',
  name: 'Example command',
  callback: () => { /* ... */ },
});
```

### Hotkey Modifiers (For Personal Plugins)

If you must define a hotkey for a personal-use plugin, use the `Mod` key for cross-platform compatibility.

-   **`Mod`**: A special modifier that automatically becomes `Cmd` on macOS and `Ctrl` on Windows/Linux.
-   Always prefer `Mod` over hard-coding `Ctrl` or `Cmd`.

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

---



---







