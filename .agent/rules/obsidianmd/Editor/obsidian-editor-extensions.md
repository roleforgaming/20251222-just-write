---
trigger: model_decision
description: interacting with CodeMirror 6, accessing EditorView, or communicating with editor extensions in Obsidian
globs: **/*.ts
---

---
name: obsidian-editor-extensions
description: Comprehensive guidelines for creating CodeMirror 6 extensions, registering them in Obsidian, and safely interacting with the underlying editor instance (Live Preview & Source Mode).
---

## Concepts & Scope

- **Identity:** An Obsidian "Editor Extension" is synonymous with a **CodeMirror 6 (CM6) Extension**.
- **Scope:** Defines the behavior, look, and feel of the **Markdown Editor** (Live Preview and Source Mode).
- **API Warning:** The API is unconventional compared to the rest of Obsidian's API. It relies entirely on the CodeMirror 6 architecture (`@codemirror/view`, `@codemirror/state`).

## Usage Decision Matrix

❌ **Incorrect Use Case (Reading View)**
- Do not use Editor Extensions to modify the **Reading View**.
- If the goal is to change how **Markdown is converted to HTML**, use `registerMarkdownPostProcessor` instead.

✅ **Correct Use Case (Live Preview / Source)**
- Use Editor Extensions to modify the **look and feel** of the document while editing.
- Use for interacting with the editor's internal state, decorations, or input handling.

## Implementation: Registration & Architecture

### Registration
Extensions must be registered via `registerEditorExtension` within the plugin's `onload` lifecycle.

❌ **Bad Practice**
- Attempting to modify the `.cm-editor` DOM directly (bypasses CM6 state).
- Initializing extensions outside the `onload` method without proper cleanup.

✅ **Good Practice**
- Pass a single extension or an array of extensions to `this.registerEditorExtension`.
- Import functionality from `@codemirror` packages to build the extension logic.

```typescript
import { Plugin } from 'obsidian';
import { examplePlugin, exampleField } from './my-cm6-extensions';

export default class MyPlugin extends Plugin {
    onload() {
        // Registering a list of CM6 extensions (ViewPlugins, StateFields, etc.)
        this.registerEditorExtension([examplePlugin, exampleField]);
    }
}
```

### Common Architecture Types
1.  **View Plugins** (`@codemirror/view`): For UI effects, decorations, and direct DOM interactions within the editor.
2.  **State Fields** (`@codemirror/state`): For maintaining and updating state across document changes.

## Advanced Interaction: Accessing Editor Internals

The Obsidian API does not expose the underlying CodeMirror instance directly in TypeScript definitions. You must use type suppression and casting to access `view.editor.cm`.

### Accessing CodeMirror 6 EditorView

❌ **Bad: Accessing without type suppression**
```typescript
// Causes TS error: Property 'cm' does not exist on type 'Editor'
const editorView = view.editor.cm; 
```

✅ **Good: Casting with @ts-expect-error**
```typescript
import { EditorView } from '@codemirror/view';

// @ts-expect-error, not typed in Obsidian API
const editorView = view.editor.cm as EditorView;
```

### Retrieving Active View Plugins

To communicate with an editor extension (View Plugin) from a command or ribbon action, retrieve the plugin instance from the `EditorView`.

❌ **Bad: Passing a Class Constructor or instantiating directly**
```typescript
const plugin = new ExamplePlugin(); // Creates a detached instance
// OR
const plugin = editorView.plugin(ExamplePluginClass); // Fails: expects Plugin Definition
```

✅ **Good: Retrieving the active plugin instance**
```typescript
// Must use the exported ViewPlugin definition, not the class constructor
const plugin = editorView.plugin(examplePluginDefinition);

if (plugin) {
    // Often requires passing the view back to the method
    plugin.doSomething(editorView);
}
```

### Dispatching State Changes

Use the CodeMirror `dispatch` method to trigger state effects or changes, rather than manipulating the DOM or internal properties directly.

❌ **Bad: Direct mutation**
```typescript
editorView.state.field = newValue; // Read-only or ineffective
```

✅ **Good: Dispatching effects**
```typescript
editorView.dispatch({
    effects: [
        // Assuming myStateField is a defined StateField
        myStateField.effect.of(newValue)
    ],
});
```

## Workflows

### 1. Scaffolding a New Extension
1.  **Verify Intent:** Ensure the target is the **Markdown Editor** (Live Preview/Source), not Reading View.
2.  **Import Modules:** Import necessary classes from `@codemirror/view` (ViewPlugin, Decoration) and `@codemirror/state` (StateField, StateEffect).
3.  **Consult CM6 Docs:** Refer to [CodeMirror 6 Documentation](https://codemirror.net/docs/) for logic construction.
4.  **Register:** Import the built extension and register it in `onload` using `this.registerEditorExtension([])`.

### 2. Connecting a Command to an Extension
Follow this sequence when creating an Obsidian command that triggers logic inside a View Plugin.

1.  **Define Command:** Use `this.addCommand` in your `onload` method.
2.  **Use editorCallback:** Ensure the command only runs when an editor is active.
3.  **Access EditorView:** Cast `view.editor.cm` to `EditorView` using `@ts-expect-error`.
4.  **Retrieve Plugin:** Call `editorView.plugin(YourPluginDefinition)`.
5.  **Guard Clause:** Check `if (plugin)` to ensure the extension is active in the current view.
6.  **Execute Logic:** Call the public method on the plugin instance.

```typescript
this.addCommand({
    id: 'trigger-extension',
    name: 'Trigger Extension Action',
    editorCallback: (editor, view) => {
        // @ts-expect-error, not typed
        const editorView = view.editor.cm as EditorView;
        
        const plugin = editorView.plugin(YourPluginDefinition);
        if (plugin) {
            plugin.performAction(editorView);
        }
    },
});
```