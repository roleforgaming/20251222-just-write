---
trigger: model_decision
description: When working with CodeMirror6
globs: **/*.ts
---

---
name: obsidian-view-plugins
description: How to correctly implement Obsidian Editor View Plugins using CodeMirror 6.
---

# Obsidian Editor: View Plugins

View plugins are editor extensions that run *after* the viewport has been recomputed, giving them access to the editor's viewport.

## Prerequisites

- A basic understanding of the editor `Viewport`.

## Core Implementation Pattern

To create a view plugin, define a class that implements the `PluginValue` interface and export it using `ViewPlugin.fromClass()`.

- ✅ **Right:** A class that implements `PluginValue` with its required lifecycle methods.

  ```ts
  import {
    ViewUpdate,
    PluginValue,
    EditorView,
    ViewPlugin,
  } from '@codemirror/view';

  class ExamplePlugin implements PluginValue {
    constructor(view: EditorView) {
      // ...
    }

    update(update: ViewUpdate) {
      // ...
    }

    destroy() {
      // ...
    }
  }

  export const examplePlugin = ViewPlugin.fromClass(ExamplePlugin);
  ```

## Limitations

A View Plugin runs after the layout is calculated, so it can read the viewport but cannot change it.

- ❌ **Wrong:** Do not use a View Plugin to make changes that impact the document's vertical layout, such as inserting blocks or line breaks. For that, use a `State Field`.

## Primary Use Case: Decorations

The main purpose of a View Plugin is to provide `Decorations` to change how the document is displayed without altering its content or vertical layout.

## Plugin Lifecycle Methods

- `constructor(view: EditorView)`: Initializes the plugin when it is first added to an editor.
- `update(update: ViewUpdate)`: Updates the plugin when something has changed, for example when the user entered or selected some text.
- `destroy()`: Cleans up after the plugin when it is removed from an editor.

## Debugging

To understand what causes the plugin to update, you can log the `update` object within the `update()` method. This is useful for inspecting document changes, selection updates, and viewport movements.

```ts
// ... inside the ExamplePlugin class
update(update: ViewUpdate) {
  console.log(update);
}
```