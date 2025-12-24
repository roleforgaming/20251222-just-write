---
trigger: glob
globs: **/*.svelte
---

---
name: svelte-5-event-handling
description: Enforces Svelte 5 event handling patterns, replacing legacy on: directives with property-based callback props and functional modifiers.
---

## Core Event Principles

Svelte 5 shifts from directive-based events (`on:click`) to attribute-based property bindings (`onclick`).

- **Syntax:** Use standard HTML attributes (e.g., `onclick`, `onmouseenter`). Attributes are case-sensitive.
- **Delegation:** Events like `click` and `input` are delegated.
- **Timing:** Event handlers fire after `bind:` updates have synchronized with state.
- **Callback Props:** Custom component events are replaced by standard props (functions).

## Right vs. Wrong: DOM Events

❌ DEPRECATED (Svelte 4 style)
<button on:click={increment}>Count: {count}</button>
<input on:input={(e) => (text = e.target.value)} />

✅ PREFERRED (Svelte 5 style)
<button onclick={increment}>Count: {count}</button>
<button {onclick}>Shorthand</button>
<input oninput={(e) => (text = e.target.value)} />

## Right vs. Wrong: Component Events

❌ DEPRECATED: createEventDispatcher
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>
<button on:click={() => dispatch('notify', { id: 1 })}>Notify</button>

✅ PREFERRED: Callback Props
<script lang="ts">
  // Props can be named 'onnotify' or simple verbs like 'inflate'
  let { onnotify } = $props<{ onnotify: (id: number) => void }>();
</script>
<button onclick={() => onnotify(1)}>Notify</button>

## Event Modifiers

Svelte 5 removes pipe modifiers (`|preventDefault`, `|once`). Use higher-order functions.

❌ DEPRECATED
<button on:click|once|preventDefault={handler}>Click</button>

✅ PREFERRED
<script>
  // Reference implementation preserves 'this' context
  function once(fn) {
    return function(e) {
      if (fn) fn.call(this, e);
      fn = null;
    };
  }
  function preventDefault(fn) {
    return function(e) {
      e.preventDefault();
      fn.call(this, e);
    };
  }
</script>
<button onclick={once(preventDefault(handler))}>Click</button>

## Event Forwarding and Spreading

Forwarding is handled via standard prop passing or attribute spreading.

### Manual Forwarding
<script>
  let { onclick } = $props();
</script>
<button {onclick}>Forwarded Click</button>

### Safe Attribute Spreading
When mixing spread props and local handlers, you must manually merge them to prevent overwriting.

❌ ILLEGAL / RISKY (Overwrites)
<button {...props} onclick={localHandler}>Conflict</button>

✅ PREFERRED (Merge Pattern)
<script>
  let props = $props();
  function localHandler(e) { console.log('Local'); }
</script>
<button 
  {...props} 
  onclick={(e) => {
    localHandler(e);
    props.onclick?.(e); // Optional chaining prevents errors if prop is undefined
  }}
>
  Merged
</button>

## Multiple Handlers

Svelte 5 does not support multiple attributes of the same name. Combine handlers manually.

❌ ILLEGAL
<button onclick={handlerOne} onclick={handlerTwo}>Error</button>

✅ PREFERRED
<button onclick={(e) => { handlerOne(e); handlerTwo(e); }}>Combined</button>

## Imperative Event Listeners & Options

Use the `on` function from `svelte/events` for:
1. Window/Document listeners.
2. Manual element binding.
3. Event options not supported by attributes (e.g., `capture`, `passive`).

✅ PREFERRED
import { on } from 'svelte/events';

$effect(() => {
  // Returns a cleanup function automatically
  const cleanup = on(window, 'keydown', (e) => console.log(e.key));
  
  // For Capture phase or Passive events
  const cleanupCapture = on(document, 'click', handler, { capture: true });
  
  return () => {
    cleanup();
    cleanupCapture();
  };
});

## Workflow: Refactor Event Directives

When migrating Svelte 4 code to Svelte 5:

1. **Identify `on:[event]`:** Remove the colon (`on:click` -> `onclick`).
2. **Convert Dispatchers:** Identify `createEventDispatcher`. Replace `dispatch('name', data)` with a prop call `onname(data)` (or a preferred verb like `submit(data)`).
3. **Update Props:** Define the new callback prop in the `$props()` declaration.
4. **Replace Modifiers:**
    - `|preventDefault` / `|stopPropagation` -> Add logic inside handler or wrapper.
    - `|once` -> Use wrapper function or `$state` tracking.
    - `|capture` / `|passive` -> Switch to imperative `on(target, type, fn, options)`.
5. **Check Spreading:** If spreading `$$props` or new props, ensure local handlers are merged, not overwritten.