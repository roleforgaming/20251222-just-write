---
trigger: glob
globs: **/*.svelte
---

name: svelte-5-snippets
description: Enforce Svelte 5 snippet patterns for reusable UI logic, replacing legacy slot patterns.
---

## Core Principles
Snippets are the primary mechanism in Svelte 5 for creating reusable chunks of markup. They replace the legacy slot system and offer better type safety and scoping.
- **Interoperability:** You can pass snippets to components that use legacy slots, but you **cannot** pass slots to components that expect snippets.

## Snippet Definition and Rendering
- Define snippets using the `{#snippet name(params)}...{/snippet}` syntax.
- Invoke snippets using the `{@render name(params)}` tag.
- Snippets are lexically scoped; they are only accessible within the scope they are defined (or passed into).

❌ BAD: Using legacy slots for content injection.
<slot />
<slot name="header" />

✅ GOOD: Using snippets and the children prop.
<script>
  let { children, header } = $props();
</script>

{@render header?.()}
{@render children?.()}

## Content Injection (The "children" Prop)
- Any content placed directly inside a component tag is automatically passed as the `children` snippet prop.
- You may also explicitly define `{#snippet children()}` inside the component tags (see Reference Ex 6).
- Use optional chaining `render?.()` or `{#if children}` blocks to handle optional content or defaults.

❌ BAD: Passing children as an attribute prop (unnecessarily verbose).
{#snippet children()} <p>Content</p> {/snippet}
<Component {children} />

✅ GOOD: Implicit children (Preferred).
<Component>
  <p>Content</p>
</Component>

✅ GOOD: Explicit children (Valid for complex nesting).
<Component>
  {#snippet children()}
    <p>Content</p>
  {/snippet}
</Component>

✅ GOOD: Handling Fallbacks/Defaults.
{#if children}
  {@render children()}
{:else}
  <p>Default Fallback Content</p>
{/if}

## Named Snippets (Replacing Named Slots)
- Pass multiple UI sections by defining snippets inside the component body.
- In the receiving component, destruct these from `$props()`.

❌ BAD: Using `slot="name"` attributes.
<Component>
  <div slot="header">Title</div>
</Component>

✅ GOOD: Defining snippets by name inside the component.
<Component>
  {#snippet header()}
    <div>Title</div>
  {/snippet}
</Component>

## Scoping and Recursion
- Snippets can be defined inside other snippets but are limited to that lexical scope (they are not visible outside).
- Snippets can call themselves to create recursive UI structures (trees, breadcrumbs).

✅ GOOD: Recursive logic.
{#snippet tree(node)}
  <li>{node.text}</li>
  {#if node.children}
    <ul>
      {#each node.children as child}
        {@render tree(child)}
      {/each}
    </ul>
  {/if}
{/snippet}

## Data Communication (Child-to-Parent)
- Child components pass data to parents by providing arguments to the `@render` call.
- The parent receives these as parameters in the `{#snippet}` definition.

✅ GOOD: Child providing context to parent.
// Child (List.svelte)
<script>
  let { items, row } = $props();
</script>
{#each items as item}
  {@render row(item)}
{/each}

// Parent (App.svelte)
<List {items}>
  {#snippet row(item)}
    <td>{item.name}</td>
  {/snippet}
</List>

## Exporting Snippets
- To share snippets across files, define them within a `<script module>` block and export them.
- Imported snippets are rendered like any other snippet using `@render`.

✅ GOOD: Shared utility snippets.
// math.svelte
<script module>
  export { add };
</script>
{#snippet add(a, b)} {a} + {b} = {a + b} {/snippet}

// App.svelte
<script>import { add } from './math.svelte';</script>
{@render add(2, 3)}

## Workflow: Migrating Slots to Snippets
1. **Identify Slots:** Locate `<slot />` and `<slot name="x" />` in the component.
2. **Update Props:** Replace slots with props in `$props()`: `let { children, x } = $props();`.
3. **Update Render:** Replace tags with `{@render children()}` and `{@render x()}`.
4. **Update Parent:** In parent components, wrap content in `{#snippet name()}` blocks instead of using `slot="name"`.
5. **Handle Variables:** Remove `let:variable` on component tags; move that logic into snippet parameters (e.g., `{#snippet row(item)}`).
6. **Check Direction:** Ensure you are not trying to pass legacy slots to a component expecting snippets.