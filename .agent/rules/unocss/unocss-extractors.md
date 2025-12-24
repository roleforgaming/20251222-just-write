---
trigger: glob
globs: uno.config.ts
---

---
name: unocss-extractors
description: Guidelines for configuring and using UnoCSS extractors for Svelte and arbitrary variants.
filters:
  glob: "uno.config.ts"
---

# UnoCSS Extractors Configuration

## Svelte Extractor
Enables class extraction from Svelte-specific syntax, specifically the `class:` directive.

### Usage Logic
*   **Target:** Use when working with Svelte components to enable `class:name={condition}` syntax.
*   **Mechanism:** Extracts classes defined in `class:` directives which are ignored by default string extractors.

### Configuration Patterns

❌ **Bad:** Relying on default extractors to parse Svelte directives (classes will be missed).
```ts
// uno.config.ts
import { defineConfig } from 'unocss'

export default defineConfig({
  // Missing extractorSvelte()
  // class:p-2={cond} will NOT generate CSS
})
```

✅ **Good:** Explicitly importing and registering the Svelte extractor.
```ts
// uno.config.ts
import extractorSvelte from '@unocss/extractor-svelte'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorSvelte(),
  ],
})
```

### Syntax Handling

❌ **Bad:** Assuming `class:` directives work out-of-the-box.
```svelte
<!-- Without extractor-svelte, 'text-orange-400' is not generated -->
<div class:text-orange-400={foo} />
```

✅ **Good:** Valid usage with extractor configured.
```svelte
<!-- Extracted as 'text-orange-400' -->
<div class:text-orange-400={foo} />
```

---

## Arbitrary Variants Extractor
Supports complex, on-the-fly variant definitions within utility strings (e.g., `[&>*]:m-1`).

### Usage Logic
*   **Default Behavior:** This is **included by default** in `@unocss/preset-mini`. Manual installation is rarely needed if using this preset.
*   **Function:** Captures arbitrary selectors like `[&>*]` or `[&[open]]` as variants.

### Configuration Patterns

❌ **Bad:** Manually installing/configuring this when already using `preset-mini`.
```ts
// Redundant if preset-mini is used
import presetMini from '@unocss/preset-mini'
import extractorArbitrary from '@unocss/extractor-arbitrary-variants'

export default defineConfig({
  presets: [presetMini()],
  extractors: [extractorArbitrary()], // Unnecessary duplication
})
```

✅ **Good:** Configuring manually only when building a raw/custom preset stack (without `preset-mini`).
```ts
import extractorArbitrary from '@unocss/extractor-arbitrary-variants'
import { defineConfig } from 'unocss'

export default defineConfig({
  extractors: [
    extractorArbitrary(),
  ],
})
```

### Syntax Examples

✅ **Good:** Using arbitrary variants in HTML.
```html
<!-- Captured: [&>*]:m-1 and [&[open]]:p-2 -->
<div class="[&>*]:m-1 [&[open]]:p-2"></div>
```