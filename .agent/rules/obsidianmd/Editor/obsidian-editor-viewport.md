---
trigger: model_decision
description: When developing an Obsidian editor extension that interacts with rendering, scrolling, or large document performance.
---

---
name: obsidian-editor-viewport-concept
description: Defines the core principles of the Obsidian editor's viewport for performant plugin development.
---

## Editor Viewport Principles

To support huge documents with millions of lines, the editor uses a "viewport" system for performance. It does not render the entire document to the DOM at once.

### ❌ Wrong: Assuming the Full Document is in the DOM

Do not write code that assumes the entire document's content is rendered in the live browser DOM. Direct DOM queries for content outside the visible area will fail or return incomplete results.

```javascript
// BAD: This will only find elements within the rendered viewport.
const allLines = document.querySelectorAll(".cm-line");
console.log(
  `Found ${allLines.length} lines. This may not be the whole document!`
);
```

### ✅ Right: Work Within the Viewport Lifecycle

To maintain performance and work with the editor's rendering engine, plugins must be viewport-aware. Understand that only a fraction of the document is rendered.

-   **Core Analogy:** Think of the viewport as a "window" that renders only the visible portion of a document, plus a small buffer of content above and below the visible area to ensure smooth scrolling.
-   **Dynamic Updates:** The viewport is re-calculated and re-rendered whenever the user scrolls or the document content changes.
-   **Correct Tooling:** To interact with the editor view, decorations, or widgets, use CodeMirror 6 `ViewPlugin`s. They are designed to receive updates and work correctly with the viewport's state.

```typescript
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

// GOOD: A ViewPlugin correctly operates within the editor's update cycle,
// and is aware of the visible ranges (viewport).
export const myViewportAwarePlugin = ViewPlugin.fromClass(
  class {
    constructor() {
      // Initialization
    }

    update(update: ViewUpdate) {
      // React to changes, including viewport changes
      if (update.viewportChanged) {
        console.log("The visible part of the document has changed.");
        // Access viewport information via `update.view.viewport`
        // This includes the buffer zone, not just the strictly visible lines.
      }
    }
  }
);
```