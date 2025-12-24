---
trigger: glob
globs: **/*.{ts,js,vue,jsx,tsx,svelte,html,css,scss}, **/uno.config.ts, **/.eslintrc
---

---
name: unocss-transformers
description: Instructions for configuring and using UnoCSS transformers (Compile Class, Directives, Variant Group) to optimize and enhance CSS authoring.
---

# UnoCSS Transformers Configuration & Usage

This rule defines the standard setup and usage patterns for UnoCSS transformers: **Compile Class**, **Directives**, and **Variant Group**.

## 1. Installation & Configuration

Install the transformers (or use the main `unocss` package if preferred).

### Dependencies
```bash
npm install -D @unocss/transformer-compile-class @unocss/transformer-directives @unocss/transformer-variant-group
```

### Configuration (`uno.config.ts`)
Add transformers to the `transformers` array in your config file.

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerCompileClass from '@unocss/transformer-compile-class'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  // ...
  transformers: [
    transformerCompileClass(),
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
```

---

## 2. Compile Class Transformer
Compiles a group of utility classes into a single, unique class hash (e.g., `.uno-qlmcrp`) to reduce HTML bloat and encapsulate styles.

### Usage Rules
- **Activation:** Prepend the class string with `:uno:`.
- **Enforcement:** Use the ESLint rule to enforce this pattern project-wide.

### ESLint Configuration
```json
{
  "plugins": ["@unocss"],
  "rules": {
    "@unocss/enforce-class-compile": "warn"
  }
}
```

### Patterns

❌ **Bad: Repeating long utility strings in HTML**
```html
<div class="text-center sm:text-left text-sm font-bold hover:text-red">
  Content
</div>
```

✅ **Good: Compiling to a single class**
```html
<!-- Result: <div class="uno-qlmcrp"> -->
<div class=":uno: text-center sm:text-left text-sm font-bold hover:text-red">
  Content
</div>
```

---

## 3. Directives Transformer
Enables standard CSS-in-JS features like `@apply`, `@screen`, `theme()`, and `icon()` within style blocks.

### `@apply` Rules
- Use `@apply` to inline utility classes into custom CSS.
- **Critical:** If using variants containing colons (e.g., `hover:text-red`), you **must** quote the list or use `--at-apply` alias to avoid parser errors.

❌ **Bad: Unquoted variants (breaks CSS parsers)**
```css
.btn {
  @apply hover:text-red font-bold;
}
```

✅ **Good: Quoted variants or CSS Variable Alias**
```css
.btn {
  @apply 'hover:text-red' font-bold;
}
/* OR */
.btn {
  --at-apply: hover:text-red font-bold;
}
```

### `@screen` Rules
- Use `@screen [breakpoint]` to generate media queries based on theme config.
- Supports `lt-` (less than) and `at-` (specific range) prefixes.

✅ **Good: Theme-aware breakpoints**
```css
/* Greater than 'sm' */
@screen sm {
  .grid { --uno: grid-cols-3; }
}

/* Less than 'md' */
@screen lt-md {
  .sidebar { display: none; }
}

/* Exactly at 'xl' range */
@screen at-xl {
  .container { max-width: 100%; }
}
```

### `theme()` & `icon()` Usage
- **Requirement:** `icon()` depends on `@unocss/preset-icons`.
- **Syntax:** `icon('icon-name', 'optional-color')`.

❌ **Bad: Trying to style icons via standard CSS properties**
```css
.icon {
  background-image: icon('i-carbon-sun');
  color: red; /* Won't work because it's a background image */
}
```

✅ **Good: Passing color arguments to `icon()`**
```css
.btn-custom {
  /* Access theme values */
  background-color: theme('colors.blue.500');
  
  /* Icon with default currentColor */
  background-image: icon('i-carbon-sun');
  
  /* Icon with specific hex color */
  background-image: icon('i-carbon-moon', '#fff');
  
  /* Icon with theme color reference */
  background-image: icon('i-carbon-moon', 'theme("colors.red.500")');
}
```

---

## 4. Variant Group Transformer
Enables Windi CSS-style shorthand for applying the same variant to multiple utilities using parentheses.

### Patterns

❌ **Bad: Repetitive variants**
```html
<div class="hover:bg-gray-400 hover:font-medium font-light font-mono">
  ...
</div>
```

✅ **Good: Grouped variants**
```html
<div class="hover:(bg-gray-400 font-medium) font-(light mono)">
  ...
</div>
```

---

## 5. Workflow: Setup Transformers

Use this checklist when initializing a new project or adding transformers to an existing one.

1.  **Install Packages:**
    Run `npm install -D @unocss/transformer-compile-class @unocss/transformer-directives @unocss/transformer-variant-group`
2.  **Update Config:**
    Open `uno.config.ts` and import the transformers.
3.  **Register Transformers:**
    Add `transformerCompileClass()`, `transformerDirectives()`, and `transformerVariantGroup()` to the `transformers: []` array.
4.  **Verify Directives:**
    Create a CSS file and test `@apply text-center` to ensure it transforms.
5.  **Verify Groups:**
    Add `class="hover:(text-red font-bold)"` to an element and check if styles apply on hover.
```