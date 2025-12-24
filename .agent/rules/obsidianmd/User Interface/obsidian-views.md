---
trigger: model_decision
description: When the user wants to create a new view.
---

---
name: obsidian-views
description: Defines the standard pattern for creating, registering, and activating custom ItemViews in Obsidian plugins.
filters:
  glob: "**/*.ts"
---

# Obsidian Custom Views

## View Class Implementation

Define a custom view by extending `ItemView`. Always export a constant for the `viewType` to avoid magic strings.

- **`getViewType()`**: Return the unique string identifier for the view. Use the exported constant.
- **`getDisplayText()`**: Return the human-readable name for the view, used in UI elements like tab headers.
- **`onOpen()`**: Build the view's DOM inside `this.contentEl`. This method is called when the view is first opened.
- **`onClose()`**: Clean up all resources, event listeners, or intervals created in `onOpen`.

✅ **Right:**
```ts
import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example view';
  }

  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl('h4', { text: 'Example view' });
  }

  async onClose() {
    // Clean up any resources, listeners, etc.
  }
}
```

## View Registration & Activation

- Register your view in the plugin's `onload` method using `this.registerView()`.
- The second argument must be a factory function that returns a new instance of your view.
- Include the standard `onunload` method for a complete plugin structure.

✅ **Right:**
```ts
// In main.ts or plugin entry file

import { Plugin } from 'obsidian';
import { ExampleView, VIEW_TYPE_EXAMPLE } from './view';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => new ExampleView(leaf)
    );

    this.addRibbonIcon('dice', 'Activate view', () => {
      this.activateView();
    });
  }

  async onunload() {
    // Any cleanup logic would go here.
  }

  async activateView() {
    // ... activation logic defined below
  }
}
```

## View State Management & Access

This is a critical rule. **Never manage references to views directly in your plugin.** Obsidian may call the view factory function multiple times, which would lead to stale references.

❌ **Wrong:** Storing a view instance as a plugin property.

```ts
// DO NOT DO THIS
export default class ExamplePlugin extends Plugin {
  myView: ExampleView; // Bad: direct reference

  async onload() {
    this.registerView(
      VIEW_TYPE_EXAMPLE,
      (leaf) => {
        this.myView = new ExampleView(leaf); // Bad: side-effect in factory
        return this.myView;
      }
    );
  }
}
```

✅ **Right:** Always query for active view instances using `workspace.getLeavesOfType()`.

```ts
// Correctly access view instances on-demand
async somePluginMethod() {
  this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE).forEach((leaf) => {
    if (leaf.view instanceof ExampleView) {
      // Now you can safely access the view instance and its methods
      // leaf.view.someMethod();
    }
  });
}
```

## Standard View Activation Logic

When activating a view, follow this pattern:
1.  Check if a leaf with the view already exists using `workspace.getLeavesOfType()`.
2.  If not, create a new leaf (e.g., in the sidebar or main pane).
3.  Use `leaf.setViewState()` to assign your view to the new leaf. The `active: true` flag makes it the visible tab in its pane.
4.  Always call `workspace.revealLeaf()` to ensure the leaf is visible to the user.

✅ **Right:**
```ts
// In main.ts or plugin entry file

async activateView() {
  const { workspace } = this.app;

  let leaf: WorkspaceLeaf | null = null;
  const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

  if (leaves.length > 0) {
    // A leaf with our view already exists, use that
    leaf = leaves[0];
  } else {
    // Our view could not be found in the workspace, create a new leaf.
    // For a new tab in the main pane, use `workspace.getLeaf(true)`.
    leaf = workspace.getRightLeaf(false);
    await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
  }

  // "Reveal" the leaf in case it is in a collapsed sidebar
  workspace.revealLeaf(leaf);
}
```

---

## Workflow: create-view

Creates a new `ItemView`, registers it, and adds activation logic.

1.  Ask the user for the name of the new view (e.g., "My Awesome View").
2.  From the name, generate a PascalCase class name (`MyAwesomeView`), a SCREAMING_SNAKE_CASE constant name (`MY_AWESOME_VIEW_TYPE`), and a kebab-case view type string (`my-awesome-view`).
3.  Create a new file `./src/[ClassName].ts` with the boilerplate `ItemView` class implementation using the generated names.
4.  In `main.ts`, add an `import` for the new view class and its type constant.
5.  In the `onload` method of `main.ts`, add the `this.registerView(...)` call.
6.  In `main.ts`, add the standard `activateView` method, renaming it to reflect the new view (e.g., `activateMyAwesomeView`).
7.  In the `onload` method, add a `this.addRibbonIcon(...)` call that triggers the new activation method.
8.  Inform the user of all files created and modified.