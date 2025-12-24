---
trigger: glob
globs: **/*.{svelte,svelte.ts}
---

---
name: svelte-5-typescript
description: Standards for Svelte 5 components and .svelte.ts modules using Runes and TypeScript.
---

# Svelte 5 TypeScript Standards

## File Extensions
- Use `.svelte` for UI components.
- Use `.svelte.ts` for logic/state modules that utilize Runes ($state, $derived, etc.).
- Use standard `.ts` only for pure logic/utilities that do not use Svelte reactivity.

❌ state.ts (If using $state)
✅ state.svelte.ts

## Core Script Configuration
- Always enable TypeScript in components using `script lang="ts"`.
- Use the `generics` attribute on the script tag for components handling dynamic data types.
- In `.svelte.ts` files, Runes are used directly without a script tag.

❌ <script>
✅ <script lang="ts">
✅ <script lang="ts" generics="Item">

## Component Props ($props)
- Define prop types using an Interface or Type alias named `Props`.
- Destructure props directly from `$props()`.
- Use the `{@render children?.()}` snippet pattern for wrapper components.

❌ export let name: string; (Legacy Svelte 4)
✅ interface Props { name: string; } let { name }: Props = $props();

## Reactive State ($state)
- Use `$state()` for all mutable reactive variables.
- Explicitly type state when the initial value is null, undefined, or a complex object.
- **Note:** If initialized without a value, TypeScript infers `Type | undefined`.
- **In .svelte.ts files:** Export classes or functions that encapsulate `$state`.

❌ let count = 0;
✅ let count: number = $state(0);
✅ export class Counter { count = $state(0); } (In .svelte.ts)

## Higher-Order & Wrapper Components
- Import attribute types from `svelte/elements`.
- For simple wrappers, type the destructured props directly using the attribute type.
- For complex wrappers, create an interface that `extends` the attribute type.

❌ interface Props { onclick: () => void; class: string; }
✅ import type { HTMLButtonAttributes } from 'svelte/elements';
✅ let { children, ...rest }: HTMLButtonAttributes = $props(); (Simple)
✅ interface Props extends HTMLButtonAttributes { customLabel: string; } (Complex)

## Global Type Extensions (Custom Elements)
- To avoid TS errors with custom elements or experimental attributes, extend `IntrinsicElements` inside the `svelteHTML` namespace.
- Place these definitions in a `.d.ts` file (e.g., `additional-svelte-typings.d.ts`).

✅
// additional-svelte-typings.d.ts
declare namespace svelteHTML {
  interface IntrinsicElements {
    'custom-element': { customProp: string; 'on:customEvent': (e: CustomEvent<any>) => void };
  }
}

## Generic Components
- Use the `generics` attribute to create reusable, type-safe list or data components.
- Ensure function props (like callbacks) use the same generic type.

✅ <script lang="ts" generics="Item">
✅ interface Props { items: Item[]; select: (item: Item) => void; }

## Workflow: Creating Reactive Logic
1. **Determine File Type:** Use `.svelte` for UI; use `.svelte.ts` for shared reactive state/stores.
2. **Define State:** Initialize reactive variables using `$state()`.
3. **Define Derived:** Use `$derived()` for values that depend on other state.
4. **Expose Logic:** In `.svelte.ts`, export the state via classes or objects to maintain reactivity when imported.
5. **Consume:** Import the state/class into a `.svelte` component and use it directly in the markup.