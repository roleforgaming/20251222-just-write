---
trigger: model_decision
description: When working with CodeMirror6
globs: **/*.ts
---

---
name: obsidian-codemirror-state-management
description: Enforces the use of immutable transactions for updating the CodeMirror editor state in Obsidian plugins.
filters:
  glob: "**/*.ts"
---

# CodeMirror State Management

The editor's state is immutable. To update it, you must dispatch a transaction containing a set of changes. This ensures a reliable history for features like undo and redo.

## The Transaction Model

The editor's state is not a single string but a history of **transactions**. A transaction is an atomic update that contains one or more change descriptions (`ChangeSpec` objects). Even a single modification is a transaction.

❌ **Wrong:** Thinking of the document as a simple, mutable variable.

```typescript
// This mental model is incorrect for CodeMirror
let note = '';
note = '# Heading'; // Old state is lost
```

✅ **Right:** Model the document as a sequence of transactions, each containing changes.

```typescript
// This is the correct mental model for CodeMirror state.
// Every update is a transaction dispatched to the view.
view.dispatch({
  changes: { from: 0, insert: 'Heading' }
});

view.dispatch({
  changes: { from: 0, insert: '# ' }
});
```
- Each `ChangeSpec` describes a modification. For simple insertions, use `{ from: number, insert: string }`. To replace text, use `{ from: number, to: number, insert: string }`.
- Use `view.dispatch()` to apply a transaction, where `view` is your instance of `EditorView`.

## Grouping Changes in a Single Transaction

When a single user action requires multiple document modifications (e.g., surrounding selected text), group all related `ChangeSpec` objects into a single transaction. This creates one atomic step in the undo history.

❌ **Wrong:** Dispatching multiple transactions for a single logical action. This pollutes the undo history.

```typescript
// Creates TWO separate entries in the undo history
view.dispatch({
  changes: [{ from: selectionStart, insert: `"` }]
});
view.dispatch({
  changes: [{ from: selectionEnd, insert: `"` }]
});
```

✅ **Right:** Provide an array of `ChangeSpec` objects in a single transaction's `changes` property.

```typescript
// Creates ONE atomic entry in the undo history
view.dispatch({
  changes: [
    { from: selectionStart, insert: `"` },
    { from: selectionEnd, insert: `"` }
  ]
});
```