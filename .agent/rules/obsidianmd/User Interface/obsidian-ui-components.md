---
trigger: model_decision
description: When the user wants to add or manage  obsidian ui elements like the ribbon and status bar.
---

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