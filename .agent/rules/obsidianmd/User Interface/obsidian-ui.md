---
trigger: glob
globs: **/*.ts
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