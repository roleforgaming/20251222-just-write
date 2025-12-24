---
trigger: model_decision
description: When configuring UnoCSS rules, defining custom utilities, or setting up the engine.
---

---
name: unocss-core-utilities
description: Rules for using UnoCSS Core, configuring Autocomplete DSL, and accessing the Inspector.
---

# UnoCSS Core & Autocomplete Rules

## Core Engine Usage
When using `@unocss/core` directly to build a custom framework engine:

- **Installation**
  - Package: `@unocss/core`
  - No presets are included by default.

- **Generator Creation**
  - ✅ **Right:** Use named imports: `import { createGenerator } from '@unocss/core'`
  - ✅ **Right:** Initialize asynchronously: `const generator = await createGenerator({ /* user options */ }, { /* default options */ })`
  - ✅ **Right:** Generate CSS: `const { css } = await generator.generate(code)`

## Autocomplete Configuration
Autocompletion logic is essential for IDE support in VS Code and the Playground.

### Rule Definition
- **Static Rules:** No extra configuration required. They autocomplete automatically.
- **Dynamic Rules:** Must provide a `meta` object with an `autocomplete` template as the third argument in the rule definition array.

❌ **Wrong:**
`[ /^m-(\d)$/, ([, d]) => ({ margin: '${d/4}rem' }) ]`

✅ **Right:**
`[ /^m-(\d)$/, ([, d]) => ({ margin: \`${d/4}rem\` }), { autocomplete: 'm-<num>' } ]`

### Autocomplete DSL Syntax
Use the following DSL patterns within the `autocomplete` string property:

- **Logic Groups:** Use `(a|b)` for OR logic.
  - Example: `(border|b)-(solid|dashed)` matches `b-solid`, `border-dashed`.
- **Shorthands:** Use built-in shorthand placeholders.
  - `<num>`: Matches numbers (e.g., `m-<num>` -> `m-1`, `m-2`).
  - `<percent>`: Matches percentages.
  - `<directions>`: Matches direction modifiers (e.g., `x`, `y`, `t`, `b`, `l`, `r`).
- **Theme Inference:** Use `$` prefix to access theme objects.
  - `$colors`: Lists all properties in the theme's `colors` object (e.g., `text-$colors` -> `text-red`, `text-blue`).

### Multiple Templates
If a rule supports multiple distinct patterns, pass an array of strings to `autocomplete`.

✅ **Right:**
`autocomplete: ['(border|b)-<num>', '(border|b)-<directions>-<num>']`

## Inspector Usage
The Inspector (`@unocss/inspector`) allows debugging of generated CSS.

- **Availability:** Ships by default with `unocss` and `@unocss/vite`. Do not install separately unless using the core engine in isolation.
- **Access:** Visit `http://localhost:5173/__unocss` (default Vite port) while the server is running.
- **Features:**
  - Inspect generated CSS rules per file.
  - View applied classes.
  - Use the built-in REPL to test utility configurations.

## Workflow: Debug UnoCSS

1. **Start Server:** Ensure the Vite development server is running.
2. **Access Inspector:** Navigate to `http://localhost:5173/__unocss`.
3. **Analyze:** Check the "File" view to see which classes are detected in specific source files.
4. **Test:** Use the "REPL" tab to input classes like `m-1` or `text-red` to verify if custom rules are activating correctly.