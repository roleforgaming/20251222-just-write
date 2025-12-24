---
trigger: glob
globs: **/*.{svelte,svelte.js,svelte.ts}
---

---
name: svelte-5-runes
description: Enforces Svelte 5 runes for reactivity, state management, and component communication to ensure modern patterns and prevent infinite loops.
---

## Core Reactivity: $state

Manage reactive data using runes instead of legacy variable declarations.

❌ let count = 0; // Not reactive in Svelte 5
✅ let count = $state(0);

❌ let todos = []; todos = [...todos, newTodo]; // Unnecessary array copying
✅ let todos = $state([]); todos.push(newTodo); // $state creates deeply reactive proxies

❌ let obj = $state({ a: 1 }); // Deeply reactive (performance overhead for large data)
✅ let obj = $state.raw({ a: 1 }); // Shallow reactivity; requires reassignment: obj = { ...obj, a: 2 }

- Use $state.snapshot(variable) to create a non-reactive copy before passing state to external libraries.
- For class properties, initialize directly with $state: class User { name = $state('Alice'); }
- Use getters when passing state to functions to maintain reactivity: add(() => a, () => b).

## Computed Logic: $derived

Replace reactive declarations ($:) with explicit derived runes.

❌ let doubled; $effect(() => { doubled = count * 2; }); // Causes infinite loops or race conditions
✅ let doubled = $derived(count * 2);

❌ let total = $derived(numbers.reduce((a, b) => a + b, 0)); // Hard to read for complex loops
✅ let total = $derived.by(() => { let sum = 0; for (const n of numbers) sum += n; return sum; });

- $derived only tracks dependencies accessed synchronously.
- Svelte skips updates if the result of a $derived expression hasn't changed (memoization).
- Do not mutate state inside $derived expressions.

## Side Effects: $effect

Use $effect for DOM-related logic or external synchronizations.

❌ $effect(() => { count++; }); // Mutating state inside an effect causes infinite loops
✅ $effect(() => { console.log('Count is:', count); });

❌ $effect(() => { const interval = setInterval(fn, 1000); }); // Memory leak
✅ $effect(() => { const i = setInterval(fn, 1000); return () => clearInterval(i); }); // Cleanup function

- Runs only in the browser (not during SSR).
- $effect.pre: Runs before the DOM updates; use for scroll management or pre-render logic.
- Avoid using $effect for data transformations; use $derived instead.
- $effect only tracks dependencies accessed synchronously (async/await breaks tracking).

## Component Interface: $props and $bindable

Standardize component communication using the $props rune.

❌ export let name = 'World'; // Legacy Svelte 4 syntax
✅ let { name = 'World' } = $props();

❌ let { value } = $props(); // One-way data flow; parent won't see updates
✅ let { value = $bindable('fallback') } = $props(); // Enables bind:value={var} with default value

❌ let { class } = $props(); // Syntax error (reserved keyword)
✅ let { class: className } = $props(); // Rename props using destructuring aliases

❌ let { ...rest } = $props(); // Accessing props blindly
✅ let { a, b, ...others } = $props(); // Explicit destructuring with rest for remaining attributes

- Use $props.id() to generate unique, hydration-safe IDs for labels and ARIA attributes.
- Avoid mutating object props directly; Svelte warns if you mutate state initialized in a parent component.

## Custom Elements and Debugging: $host and $inspect

❌ this.dispatchEvent(new CustomEvent('name')); // Legacy
✅ $host().dispatchEvent(new CustomEvent('name')); // Access the custom element wrapper

❌ console.log({ count }); // Manual logging
✅ $inspect(count); // Reactive console logging in development mode

- $inspect(state).with((type, val) => { ... }): Custom logging for "init" and "update" events.
- $inspect.trace(): Place inside an effect to see exactly which dependency triggered the re-run.

## Workflow: Migrate to Svelte 5 Runes

1. Identify Reactive State: Locate all "let" variables meant to be reactive and wrap their values in $state().
2. Replace Reactive Assignments: Convert all "$:" blocks to either $derived() for values or $effect() for side effects.
3. Update Props: Remove "export let" declarations. Replace with a single "let { ... } = $props()" call at the top of the script.
4. Enable Two-Way Binding: For any prop previously used with "bind:", wrap its definition in $bindable() inside the $props destructure.
5. Cleanup Effects: Ensure all $effect runes that initiate timers or event listeners return a proper cleanup function.
6. Verify Reactivity: Use $inspect() on complex objects to ensure proxies are behaving as expected during development.