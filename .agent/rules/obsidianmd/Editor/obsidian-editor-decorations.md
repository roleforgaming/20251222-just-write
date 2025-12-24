---
trigger: model_decision
description: implementing editor styling, custom UI elements in editor, or replacing text with widgets
globs: **/*.ts
---

---
name: obsidian-editor-decorations
description: Best practices for implementing CodeMirror 6 decorations (styling, widgets) in Obsidian plugins.
---

## Decoration Strategy

Deciding between **View Plugins** and **State Fields** is critical for performance and correctness.

### When to use View Plugins
✅ **Use View Plugins** when the decoration depends **only** on what is currently visible in the viewport.
✅ **Use View Plugins** for high-performance updates (e.g., syntax highlighting, spell checking) on large documents.
❌ **Avoid View Plugins** if the decoration affects the document layout (e.g., adding line breaks) or needs to exist outside the viewport.

### When to use State Fields
✅ **Use State Fields** when decorations must persist or be calculated for the **entire document**, regardless of scroll position.
✅ **Use State Fields** if the decoration changes the vertical layout (block replacements) that affects scrolling.
❌ **Avoid State Fields** for expensive calculations on massive documents unless absolutely necessary (can block the main thread).

## Decoration Types

- **Mark Decorations**: Style existing text (e.g., color, font weight).
- **Widget Decorations**: Insert custom HTML elements (inline or block).
- **Replace Decorations**: Hide text and optionally replace it with a widget.
- **Line Decorations**: Style the line container (e.g., background color).

## Implementation Rules

### 1. Creating Widgets
Define custom HTML elements by extending `WidgetType`.

❌ **Bad**: Returning raw HTML strings or modifying DOM directly outside `toDOM`.
✅ **Good**: Subclass `WidgetType` and implement `toDOM(view: EditorView)`.

```typescript
class MyWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        const span = document.createElement("span");
        span.textContent = "👉";
        return span;
    }
}
```

### 2. Building Decorations
Always use a `RangeSetBuilder` to construct decorations efficiently.

❌ **Bad**: Returning arrays of decorations or manually sorting.
✅ **Good**: Use `RangeSetBuilder<Decoration>` and `builder.add(from, to, decoration)`.
✅ **Good**: Ensure decorations are added in ascending order of position.

```typescript
const builder = new RangeSetBuilder<Decoration>();
builder.add(from, to, Decoration.mark({ class: "my-style" }));
return builder.finish();
```

### 3. State Field Provider Pattern
Use `provide` to expose decorations from a State Field.

❌ **Bad**: Manually attaching decorations in a separate view plugin.
✅ **Good**: Define the field with `StateField.define<DecorationSet>` and provide via `EditorView.decorations`.

```typescript
export const myField = StateField.define<DecorationSet>({
    create(state) { return Decoration.none; },
    update(oldState, tr) { /* build logic using syntaxTree(tr.state).iterate */ },
    provide: (field) => EditorView.decorations.from(field)
});
```

### 4. View Plugin Provider Pattern
Manage lifecycle, visible range iteration, and strict registration via `PluginSpec`.

❌ **Bad**: Rebuilding decorations on every `update` call without checks.
❌ **Bad**: Forgetting the `PluginSpec` with the `decorations` accessor (decorations will not render).
✅ **Good**: Check `update.docChanged` or `update.viewportChanged`.
✅ **Good**: Iterate `view.visibleRanges` and pass `{from, to}` to `syntaxTree.iterate` for performance.

```typescript
class MyPlugin implements PluginValue {
    decorations: DecorationSet;
    constructor(view: EditorView) { this.decorations = this.build(view); }
    
    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.build(update.view);
        }
    }
    
    build(view: EditorView) {
        const builder = new RangeSetBuilder<Decoration>();
        // Iterate only visible ranges to save performance
        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from, 
                to,
                enter(node) {
                    // builder.add(...) logic here
                }
            });
        }
        return builder.finish();
    }
}

// CRITICAL: Register the plugin with a spec that exposes decorations
const pluginSpec: PluginSpec<MyPlugin> = {
    decorations: (value: MyPlugin) => value.decorations,
};

export const myPlugin = ViewPlugin.fromClass(MyPlugin, pluginSpec);
```

## Workflow: Implement Decoration Extension

1.  **Define Goal**: Determine if you are styling text (Mark), inserting elements (Widget), or hiding text (Replace).
2.  **Create Widget (If applicable)**:
    *   Create a class extending `WidgetType`.
    *   Implement `toDOM`.
3.  **Choose Provider**:
    *   If layout-shifting or global: Use **State Field**.
    *   If cosmetic/local: Use **View Plugin**.
4.  **Implement Builder Logic**:
    *   Instantiate `RangeSetBuilder`.
    *   Use `syntaxTree(state).iterate({ enter(node) { ... } })` to find target nodes.
    *   **Crucial**: If using View Plugin, loop through `view.visibleRanges` and pass `from/to` limits to `iterate`.
    *   `builder.add()` decorations at found positions.
    *   `return builder.finish()`.
5.  **Register Extension**:
    *   **State Field**: Export the field directly.
    *   **View Plugin**: Export `ViewPlugin.fromClass(Class, { decorations: ... })`.