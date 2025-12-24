---
trigger: glob
globs: **/*.{svelte,svelte.js,svelte.ts,js,ts}
---

---
name: svelte-5-migration
description: Enforces Svelte 5 Runes API and modern component patterns while deprecating Svelte 4 legacy syntax.
---

## Reactivity: Runes API

❌ `export let prop = value;`
✅ `let { prop = value } = $props();`

❌ `let count = 0;` (expecting reactivity)
✅ `let count = $state(0);`

❌ `$: doubled = count * 2;`
✅ `let doubled = $derived(count * 2);`

❌ `$: { if (count > 10) console.log(count); }`
✅ `$effect(() => { if (count > 10) console.log(count); });`

## Event Handling

❌ `<button on:click={handler}>`
✅ `<button onclick={handler}>`

❌ `import { createEventDispatcher } from 'svelte';`
✅ Pass callback functions as props: `let { onnotify } = $props();`

❌ `<button on:click|preventDefault|once={handler}>`
✅ **Standard:** Use manual wrappers: `onclick={(e) => { e.preventDefault(); handler(e); }}`
✅ **Capture:** Use syntax suffix: `<button onclickcapture={handler}>`
✅ **Passive:** Use a Svelte Action (modifiers are not supported).

❌ Multiple handlers: `<button on:click={one} on:click={two}>`
✅ Single attribute: `onclick={(e) => { one(e); two(e); }}`

## Component Lifecycle & API

❌ `import App from './App.svelte'; const app = new App({ target });`
✅ `import { mount } from 'svelte'; const app = mount(App, { target, events: { eventName: handler } });`

❌ `app.$set({ foo: 'bar' });`
✅ Use `$state` object passed as a prop: `let props = $state({ foo: 'bar' });`

❌ `app.$destroy();`
✅ `import { unmount } from 'svelte'; unmount(app);`

❌ `<svelte:component this={handler} />`
✅ `<handler />` (Components are now dynamic by default if assigned to a variable)

## Property & Typing Standards

- **Reserved Name:** Never use `children` as a custom prop name; it is reserved for snippet/slot content.
- **Component Types:**
  - ❌ `SvelteComponent`, `ComponentEvents`, `ComponentType`
  - ✅ `Component`
- **Spread Props:** When spreading `{...props}`, place local event handlers after the spread to ensure they aren't overwritten: `<button {...props} onclick={(e) => { myLogic(); props.onclick?.(e); }} />`
- **Dot Notation:** `<Namespace.Component />` is now natively supported and preferred for grouped components.

## SSR & Mount Logic

- **Synchronicity:** `mount` and `hydrate` are asynchronous. Use `flushSync` if immediate DOM updates are required after mounting.
- **SSR Rendering:**
  - ❌ `App.render()`
  - ✅ `import { render } from 'svelte/server'; render(App, { props, options: { css: 'injected' } });` (CSS is not included by default).

## Workflow: Migrate Component to Svelte 5

1. **Convert Props:** Locate `export let` statements and move them into a single `let { ... } = $props();` declaration.
2. **Apply Runes:** Wrap reactive local variables in `$state()`. Replace `$:` derived values with `$derived()` and side effects with `$effect()`.
3. **Refactor Events:**
    - Change `on:click` to `onclick`.
    - Change `on:click|capture` to `onclickcapture`.
    - Convert `createEventDispatcher` usage to callback props.
4. **Update Dynamic Components:** Remove `<svelte:component>` and use the component variable directly as a tag.
5. **Verify Lifecycle:** Replace any legacy `$on`, `$set`, or `$destroy` calls in the parent/instantiating logic with `mount` (using `events` option), `unmount`, and `$state` props.