---
trigger: glob
globs: **/uno.config.{ts,js,mjs,mts}
---

---
name: unocss-config
description: Comprehensive standards for configuring UnoCSS, covering core principles, rules, themes, shortcuts, layers, variants, and extractors for performant and maintainable design systems.
---

# UnoCSS Configuration Master Standards

## 1. Core Configuration & Performance

### Initialization and Structure
- ✅ Always use `defineConfig` for type safety and proper merging behavior.
- ✅ Explicitly defined `content.pipeline.include` for non-standard file extensions (e.g., `.php`, `.liquid`).
- ✅ Use `content.filesystem` for scanning files outside the build tool's transformation pipeline.
- ❌ Do not include `node_modules` in scanning unless specifically requiring utilities from a third-party package.

### Options & Optimization
- ✅ Use `blocklist` to prevent the generation of legacy or forbidden utility patterns (always excluded).
- ✅ Use `safelist` for runtime dynamic utilities that static extraction cannot find (always included).
- ✅ **Safelist Logic:** Use functions in the `safelist` array to generate classes dynamically based on configuration.
  - *Pattern:* `safelist: [ 'static-class', (context) => Object.keys(context.theme.colors).map(c => `bg-${c}`) ]`
  - Functions can return `string`, `string[]`, or nested arrays (automatically flattened).
  - Use conditional logic (e.g., `if (process.env.NODE_ENV === 'dev')`) within safelist functions to include debug classes.
- ❌ Avoid broad glob patterns that might scan large binary or temporary directories.

---

## 2. Rules and Utilities

### Definition Strategy
- ✅ **Dynamic Rules:** Use Regex matchers for patterns involving numeric scales or colors.
  - *Pattern:* `[ /^m-(\d+)$/, ([, d]) => ({ margin: `${d / 4}rem` }) ]`
- ✅ **Static Rules:** Use static strings for unique, one-off utilities to improve performance.
  - *Pattern:* `[ 'custom-grid', { display: 'grid', 'grid-template-columns': '1fr 2fr' } ]`
- ✅ **Rule Metadata:** Use `symbols` from `@unocss/core` within the rule body/object to define metadata (layers, parents, wrappers).
  - *Pattern:* `[ 'btn', { [symbols.layer]: 'components', [symbols.parent]: '@supports (display: grid)' } ]`
- ❌ Do not use camelCase for properties (e.g., `fontWeight`). Use CSS syntax (`font-weight`) and quote property names containing hyphens.
- ❌ Avoid hardcoding every possible spacing or color value as a separate static rule.

### Advanced Rule Logic
- ✅ Use `toEscapedSelector` when writing raw CSS strings to ensure class names are valid.
- ✅ Use Generator functions (`function*` yielding multiple objects) to generate **multiple separate CSS rules** from a single utility match (e.g., defining base styles and a `:hover` override simultaneously).
- ✅ Return a 2D array for CSS fallbacks: `[ ['height', '100vh'], ['height', '100dvh'] ]`.
- ✅ Prefer `symbols.body` over returning a raw string for complex rules. Raw strings disable variant support (e.g., `hover:` won't work), whereas `symbols.body` maintains it.
- ✅ Use `symbols.noMerge` if you need to prevent UnoCSS from merging rules with identical bodies.

---

## 3. Theme Management

### Structure and Merging
- ✅ Use the `theme` object for shared constants (colors, breakpoints, font sizes).
- ✅ Use `extendTheme` to either return a new theme object or directly mutate the existing one for granular updates without wiping defaults.
- ✅ Access theme values within rules, variants, shortcuts, and safelists using the `{ theme }` context argument.
- ❌ Do not define top-level keys in the `theme` object if you intend to preserve default preset values (e.g., overriding `breakpoints` directly wipes defaults).

### Units & Colors
- ✅ Use unified units (all `px` or all `rem`) for breakpoints to ensure correct sorting.
- ✅ Use `verticalBreakpoints` for vertical layout queries; it behaves identically to `breakpoints`.
- ✅ Structure colors in nested objects: `colors: { brand: { primary: '#f00', secondary: '#0f0' } }`.

---

## 4. Shortcuts

### Usage Context
- ✅ Use shortcuts to group frequently co-occurring utilities into semantic components (e.g., `btn-primary`).
- ✅ Prefer shortcuts over `@apply` to keep logic within the config.
- ❌ Do not use shortcuts as simple aliases for single utilities (e.g., `red: 'text-red-100'`).

### Syntax
- **Static Object:** `{ 'btn': 'py-2 px-4 font-semibold rounded-lg' }`
- **Dynamic Array:** `[ /^btn-(.*)$/, ([, c], { theme }) => `bg-${c}-400 text-${c}-100` ]`

---

## 5. Layers & Specificity

### Layer Definition & Ordering
- ✅ Define explicit numeric orders in the `layers` object to control priority.
  - *Pattern:* `layers: { base: -1, components: 0, utilities: 1 }`
- ✅ Use the entry module to control import order if necessary (e.g., `import 'uno:components.css'`).
- ❌ Avoid relying on alphabetical sorting for layer priority; always assign an integer.

### CSS Cascade Layers
- ✅ Use `outputToCssLayers: true` to wrap layers in native `@layer` blocks.
- ✅ Use the object syntax for `outputToCssLayers` to rename layers or create sublayers.
  - *Example:* `{ cssLayerName: (layer) => layer === 'shortcuts' ? 'utilities.shortcuts' : layer }`

### Layer Variants
- ✅ Use `uno-layer-<name>:` to move a utility into a specific internal UnoCSS layer bucket.
  - *Example:* `class="uno-layer-my-layer:text-xl"`
- ✅ Use `layer-<name>:` to wrap the generated CSS in a native CSS `@layer`.
  - *Example:* `class="layer-my-layer:text-xl"` (Output: `@layer my-layer { ... }`)

### Preflights
- ✅ Use the `layer` property in preflight objects to scope resets/styles.
  - *Pattern:* `{ layer: 'my-layer', getCSS: () => ... }`
- ✅ Use the `getCSS` property with the signature `({ theme }) => string` to inject raw CSS.
- ✅ Destructure `theme` in `getCSS` to access config variables.

---

## 6. Variants

### Logic & implementation
- ✅ Define variants as functions that return an object `{ matcher, selector }` if matched.
- ✅ Use the `matcher` property to strip prefixes (e.g., `hover:`) and pass the remaining string to the next variant/rule.
- ✅ Use the `selector` property (function) to transform the generated CSS selector (e.g., append `:hover`).
- ✅ Ensure variants are recursive; if the matcher is modified, it is re-evaluated against other variants.
- ✅ Access `{ theme }` in the variant function signature to conditionally apply logic based on configuration.
- ❌ Do not return an object if the variant does not match; return the input matcher string or undefined to skip.

---

## 7. Extractors & Transformers

### Extractors (Detection)
- ✅ Rely on `extractorSplit` (default) for standard HTML/JS.
- ✅ Use `extractorDefault` option to explicitly disable (`false`) or replace the default extractor.
- ✅ Use specific extractors for non-standard syntax (Pug, Svelte, Attributify).

### Transformers (Modification)
- ✅ Return the `SourceCodeTransformer` interface for strict type safety.
- ✅ Use `idFilter` to restrict transformations to specific file types (`.vue`, `.tsx`).
- ✅ Define `async transform(code, id, { uno })` to access the `MagicString` instance (`code`) and the UnoCSS context (`uno`).
- ✅ Use `enforce: 'pre'` (or `'post'`) to control execution order relative to other transformers.

---

## 8. Autocomplete

### Enhancing DX
- ✅ Provide explicit templates in `autocomplete.templates`.
  - Use `$color` for theme inferring (e.g., `bg-$color`).
  - Use `<name>` for shorthand placeholders (e.g., `text-<font-size>`).
  - Use `(a|b)` for logic OR groups.
- ✅ Register custom numeric scales or maps in the `autocomplete.shorthands` object.
- ✅ Use extractors within autocomplete config to ensure custom syntax (like attributes) receives suggestions.

---

## 9. Presets

### Authoring & Consumption
- ✅ Use `definePreset` to wrap the export for proper type inference and merging.
- ✅ Export a factory function (constructor) that accepts options and returns the configuration object.
- ✅ Order presets in the `presets` array based on intended override behavior (last one wins).
- ❌ Do not export raw objects as presets; always allow for configuration via function arguments.

---

## 10. Workflow Checklist

1.  **Theme:** Define tokens (colors/fonts) in `theme` or `extendTheme`.
2.  **Layers:** Define layer priorities (`base`, `components`, `utilities`) and configure `outputToCssLayers`.
3.  **Rules/Shortcuts:** Add custom logic using `symbols` metadata and standard CSS syntax.
4.  **Safelist:** Add runtime-only classes using strings or dynamic functions accessing `context.theme`.
5.  **Extractors:** Ensure all file types are scanned; configure `extractorDefault` if needed.
6.  **Verify:** Check output CSS and use the UnoCSS Inspector.