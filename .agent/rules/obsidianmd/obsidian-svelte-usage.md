---
trigger: model_decision
description: When using Svelte in an Obsidian plugin.
---

---
name: obsidian-svelte-usage
description: Rules for using Svelte within an Obsidian plugin.
filters:
  agent_decision: "When using Svelte in an Obsidian plugin."
---

## 1. Svelte Component Structure

✅ **Right:** Structure Svelte components using TypeScript and modern Svelte 5 features.

- Use `<script lang="ts">` for full TypeScript support.
- Use `$props()` for typed component properties.
- Use `$state()` for reactive state variables.
- Use `export function` to expose methods to your TypeScript code.

```tsx
// Counter.svelte
<script lang="ts">
  interface Props {
    startCount: number;
  }

  let { startCount }: Props = $props();
  let count = $state(startCount);

  export function increment() {
    count += 1;
  }
</script>

<div class="number">
  <span>My number is {count}!</span>
</div>

<style>
  .number {
    color: red;
  }
</style>
```

## 2. Component Lifecycle in Obsidian Views

When using Svelte components inside an Obsidian `ItemView`, it is critical to manage the component's lifecycle correctly to prevent errors and memory leaks.

✅ **Right:** Mount the component in `onOpen` and unmount it in `onClose`. Pass props and interact with exported methods on the component instance.

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';
import Counter from './Counter.svelte';
import { mount, unmount } from 'svelte';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  counter: ReturnType<typeof Counter> | undefined;

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
    this.counter = mount(Counter, {
      target: this.contentEl,
      props: {
        startCount: 5, // Pass props during mounting
      }
    });

    // Call exported functions directly on the instance
    this.counter.increment();
  }

  async onClose() {
    if (this.counter) {
      unmount(this.counter);
    }
  }
}
```

❌ **Wrong:** Mounting in the constructor or forgetting to unmount. `this.contentEl` is not guaranteed to be ready in the constructor, and not unmounting causes memory leaks.

```typescript
// BAD PATTERN - DO NOT USE
export class BadView extends ItemView {
  counter: ReturnType<typeof Counter> | undefined;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    // ❌ WRONG: this.contentEl may not be available here.
    this.counter = mount(Counter, { target: this.contentEl });
  }

  async onClose() {
    // ❌ WRONG: Missing the call to unmount(), causing a memory leak.
  }
}
```