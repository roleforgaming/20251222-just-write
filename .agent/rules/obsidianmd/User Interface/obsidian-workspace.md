---
trigger: model_decision
description: When working with creating, managing, and cleaning up workspace leaves and views.
---

---
name: obsidian-workspace
description: Rules for managing the Obsidian workspace, including creating, managing, and cleaning up leaves and views.
filters:
  glob: "**/*.ts"
---

# Obsidian Workspace Management

## Workspace Structure
- The workspace is a tree structure containing all visible UI elements.
- The top-level nodes are `rootSplit`, `leftSplit`, and `rightSplit`.
- Parent nodes (`WorkspaceParent`) contain other items.
  - **`WorkspaceSplit`**: Lays out its child items one after another, either vertically or horizontally.
  - **`WorkspaceTabs`**: Displays only one child item at a time, hiding the others behind tabs.
- Leaf nodes (`WorkspaceLeaf`) display content via a `View`. They cannot contain other items.

## Split Behaviors
The main `rootSplit` and the side splits (`leftSplit`, `rightSplit`) have different default behaviors when a leaf inside them is split.

- ✅ **Root Split:** Splitting a leaf in the `rootSplit` creates a new nested `WorkspaceSplit` containing the original and the new leaf.
- ✅ **Side Docks (`leftSplit` / `rightSplit`):** Splitting a leaf in a side dock creates a new `WorkspaceTabs` item. This maintains a clean, multi-level tab structure in the sidebars.

## Leaf Lifecycle Management
Plugins MUST clean up any leaves they create when the plugin is disabled. Failure to do so pollutes the user's workspace.

### Bulk Cleanup (Recommended)
Use `detachLeavesOfType` in `onunload` for robust cleanup of all plugin views.

❌ **Wrong:** Leaving a custom leaf behind after the plugin is disabled.

```ts
// Wrong: No cleanup in onunload
export default class ExamplePlugin extends Plugin {
  async onload() {
    this.app.workspace.getLeaf(true).setViewState({
      type: 'my-custom-view',
      active: true,
    });
  }

  // onunload is missing or empty!
}
```

✅ **Right:** Detaching all leaves of a specific type in the `onunload` method.

```ts
// Right: Cleanup is handled in onunload
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    // ... logic to add leaves
  }

  async onunload() {
    // This removes all views of this type from the workspace
    this.app.workspace.detachLeavesOfType('my-custom-view');
  }
}
```

### Individual Leaf Cleanup
If you need to remove a specific leaf instance, use `leaf.detach()`.

✅ **Right:** Storing a reference to a leaf and detaching it individually.

```ts
import { Plugin, WorkspaceLeaf } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  private myLeaf: WorkspaceLeaf | null = null;

  async openMyView() {
    // If our leaf is already open and part of the workspace, just reveal it
    if (this.myLeaf && !this.myLeaf.detached) {
      this.app.workspace.revealLeaf(this.myLeaf);
      return;
    }
    // Otherwise, create a new leaf
    this.myLeaf = this.app.workspace.getRightLeaf(false);
    await this.myLeaf.setViewState({ type: 'my-custom-view', active: true });
    this.app.workspace.revealLeaf(this.myLeaf);
  }

  async onunload() {
    // Detach the specific leaf instance if it exists
    this.myLeaf?.detach();
  }
}
```

## Creating Leaves
Use the dedicated helper method corresponding to the target UI location. The boolean parameter typically controls whether to create a new split (`true`) or reuse an existing one (`false`).

- **`app.workspace.getLeaf(true)`**: Opens a **new** leaf in the main editor area (`rootSplit`).
- **`app.workspace.getLeftLeaf(false)`**: Opens a leaf in the left sidebar, reusing an existing tab group.
- **`app.workspace.getRightLeaf(true)`**: Opens a leaf in the right sidebar, creating a **new tab group (split)**.
- **`app.workspace.createLeafInParent(parent, index)`**: For explicit placement within a specific split or tab group.

## Inspecting the Workspace
Use the built-in iterator to reliably access all leaves.

❌ **Wrong:** Manually traversing each split. This is fragile, complex, and incomplete.

```ts
// Bad: Manual, and might miss leaves in nested splits
const leaves = [];
this.app.workspace.rootSplit.children.forEach(item => { /* ... */ });
// ... and so on for left and right splits
```

✅ **Right:** Use `iterateAllLeaves` to process every leaf in the workspace.

```ts
// Good: Simple, robust, and comprehensive
this.app.workspace.iterateAllLeaves((leaf) => {
  console.log(`Found leaf with type: ${leaf.getViewState().type}`);
});
```

## Leaf Groups (Linked Views)
To create linked views (where panes scroll and navigate together), assign multiple leaves to the same group using `leaf.setGroup()`.

✅ **Right:** Assigning several leaves to the same group.

```ts
// Assuming you have an array of leaves you want to link
const leavesToLink = this.app.workspace.getLeavesOfType('markdown');

leavesToLink.forEach((leaf) => {
  leaf.setGroup('my-linked-group');
});
```