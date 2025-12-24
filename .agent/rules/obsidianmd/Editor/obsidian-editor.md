---
trigger: model_decision
description: user asks to create an Obsidian plugin command that edits text or manipulates cursor
globs: user asks to create an Obsidian plugin command that edits text or manipulates cursor
---

---
name: obsidian-editor-api
description: Standards for text manipulation and editor access in Obsidian plugins.
---

## Accessing the Editor

When accessing the active Markdown editor, ensure type safety and proper context scope. You must import types from the `obsidian` package.

❌ **Bad:**
- Accessing properties on `activeLeaf` without type checking.
- Using `editor` in a command without the `editorCallback` wrapper.
- Importing `moment` from the `moment` package (always import from `obsidian`).

✅ **Good:**
- Use `editorCallback` for commands specifically designed to manipulate text.
- Use `getActiveViewOfType(MarkdownView)` when accessing the editor from events or other contexts.

```typescript
import { Editor, MarkdownView, moment, Plugin } from 'obsidian';

// Inside a Command
this.addCommand({
    id: 'insert-date',
    name: 'Insert Date',
    // strictly typed callback
    editorCallback: (editor: Editor) => {
        editor.replaceRange(moment().format('YYYY-MM-DD'), editor.getCursor());
    }
});

// Outside a Command
const view = this.app.workspace.getActiveViewOfType(MarkdownView);
// Make sure the user is editing a Markdown file.
if (view) {
    const editor = view.editor;
    const cursor = editor.getCursor();
}
```

## Platform Compatibility (CodeMirror)

Obsidian uses CodeMirror (CM6) but provides an abstraction layer to support legacy (CM5) and mobile contexts.

❌ **Bad:**
- Directly accessing the CodeMirror instance (`view.sourceMode.cmEditor`).
- Using CM6 specific extensions or state fields without fallbacks.

✅ **Good:**
- Use the `Editor` class API methods for all text operations.
- Rely on `Editor` methods to bridge differences between Desktop and Mobile.

## Text Manipulation

Use built-in methods for reading and writing to the document to maintain history and undo/redo stacks.

### Inserting Text (at Cursor)
To insert text at the current cursor position, use `replaceRange` with a single coordinate argument.

```typescript
// Insert text at current cursor
editor.replaceRange('Inserted Text', editor.getCursor());
```

### Replacing Specific Ranges
To replace a specific block of text, use `replaceRange` with a start and end coordinate.

```typescript
// Replace text between two coordinates
editor.replaceRange('New Text', startPos, endPos);
```

### Modifying Selections
To modify currently highlighted text, use `getSelection` to read it and `replaceSelection` to write it.

❌ **Bad:** Deleting text manually and then inserting new text.
✅ **Good:** Use `replaceSelection` to swap currently highlighted text.

```typescript
// Transform selection (e.g., Uppercase)
const selection = editor.getSelection();
editor.replaceSelection(selection.toUpperCase());
```

## Workflow: Create Editor Command

Follow these steps when creating a new command that edits text:

1.  **Imports:** Ensure `Editor`, `MarkdownView`, `Plugin` (and `moment` if needed) are imported from `'obsidian'`.
2.  **Define Command:** Use `this.addCommand` inside `onload()`.
3.  **Set Strategy:** Use `editorCallback` to ensure the command only runs when a Markdown editor is active.
4.  **Read Context:** Use `editor.getCursor()` or `editor.getSelection()` to determine where to act.
5.  **Execute Change:** 
    *   Use `editor.replaceRange(text, from, [to])` for insertion or range replacement.
    *   Use `editor.replaceSelection(text)` for modifying user selection.