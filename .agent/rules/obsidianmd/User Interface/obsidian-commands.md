---
trigger: model_decision
description: When the user wants to create an obsidian command
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