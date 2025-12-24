---
trigger: glob
globs: **/*.ts
---

---
name: obsidian-events
description: Enforces best practices for handling events and intervals in Obsidian plugins to prevent memory leaks.
---

# Rules for Obsidian Event Handling

To ensure proper cleanup when a plugin unloads, always use the `Plugin` class's registration helpers for events and intervals.

## Application Events

Use `this.registerEvent()` to manage event listeners from the Obsidian API. This guarantees they are detached when the plugin is disabled.

❌ **Bad:** Directly attaching an event listener. This will cause memory leaks.

```ts
// This listener is never removed, even after the plugin is disabled.
this.app.vault.on('create', () => {
  console.log('a new file has entered the arena');
});
```

✅ **Good:** Wrap the event listener registration with `this.registerEvent()`.

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.vault.on('create', () => {
        console.log('a new file has entered the arena');
      })
    );
  }
}
```

## Timing Events (Intervals)

Use `this.registerInterval()` to manage `setInterval` timers. This is crucial for UI elements that need periodic updates, ensuring the interval is cleared when the plugin is disabled.

❌ **Bad:** Directly calling `window.setInterval()`. The interval will continue to run after the plugin is disabled, causing errors and performance issues.

```ts
// This interval is never cleared.
window.setInterval(() => this.updateStatusBar(), 1000);
```

✅ **Good:** Create UI elements and wrap the `window.setInterval()` call with `this.registerInterval()`.

```ts
import { moment, Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  statusBar: HTMLElement;

  async onload() {
    this.statusBar = this.addStatusBarItem();
    
    // Run once on load
    this.updateStatusBar();

    this.registerInterval(
      window.setInterval(() => this.updateStatusBar(), 1000)
    );
  }

  updateStatusBar() {
    this.statusBar.setText(moment().format('H:mm:ss'));
  }
}
```

## Date and Time Formatting

- **Use the built-in Moment.js library.** Obsidian bundles it, so you do not need to install it separately.
- **Import `moment` directly from the `obsidian` package.**

✅ **Correct Import:**

```ts
import { moment } from 'obsidian';
```