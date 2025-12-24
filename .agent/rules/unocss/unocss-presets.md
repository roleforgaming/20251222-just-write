---
trigger: glob
globs: **/*.{ts,js,mts,vue,svelte,tsx,jsx,html}
---

---
name: unocss-presets
description: Best practices for configuring and using UnoCSS presets (Wind4, Icons, Typography), including advanced theming and customization.
---

# UnoCSS Presets Standards

## 1. Preset Wind4 (Tailwind 4 Compat)

Enforce modern Tailwind 4 compatibility using `@unocss/preset-wind4`. This preset supersedes `preset-wind` and `preset-uno` for modern stacks.

### Configuration Strategy
- **Reset**: Do NOT import external reset CSS files (e.g., `@unocss/reset/tailwind.css`). Use the built-in `preflights.reset: true`.
- **Theme Generation**: Use `mode: 'on-demand'` (default) to generate CSS variables only for used values.
- **CSS Properties**: Enable `property: true` to generate `@property` rules for smoother animations. Use object syntax `{ parent: false }` if you need to remove the default `@supports` wrapper.
- **Rem-to-Px**: Do NOT use `@unocss/preset-rem-to-px`. Use `createRemToPxProcessor()` from the preset's utils.
    - Add to `preflights.theme.process` to convert CSS variables.
    - Add to `postprocess` to convert utility classes.

### Theme Key Changes
Refer to the `presetWind4` migration table for all changes. Key shifts include:
- `fontFamily` → `font`
- `boxShadow` → `shadow`
- `borderRadius` → `radius`
- `container.maxWidth` → `containers.maxWidth`
- Size properties (`width`, `height`, etc.) → Unified under `spacing`

### Generated Layers
Wind4 outputs three specific layers. Ensure your custom CSS respects this order:
1. `properties` (-200): `@property` definitions.
2. `theme` (-150): CSS variables (e.g., `--color-red-500`).
3. `base` (-100): Preflight/Reset styles.

❌ **Bad:** Legacy setup with external resets and redundant presets.
```ts
import '@unocss/reset/tailwind.css' // ❌ Legacy import
import presetWind from '@unocss/preset-wind' // ❌ Legacy preset
import presetRemToPx from '@unocss/preset-rem-to-px' // ❌ Redundant

export default defineConfig({
  presets: [
    presetWind(),
    presetRemToPx(),
  ]
})
```

✅ **Good:** Optimized Wind4 setup with full Rem-to-Px replacement.
```ts
import presetWind4 from '@unocss/preset-wind4'
import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true, // ✅ Replaces @unocss/reset
        property: true, // ✅ Enables @property support
        theme: {
          mode: 'on-demand', // ✅ Only generate used variables
          process: createRemToPxProcessor(), // ✅ Converts Theme Variables (e.g., --spacing)
        },
      },
    }),
  ],
  // ✅ Converts Utility Classes (e.g., p-4 -> padding: 16px)
  postprocess: [createRemToPxProcessor()],
})
```

## 2. Theming & Colors

Follow a strict CSS variable strategy compatible with Shadcn UI patterns and modern color spaces.

### CSS Variables & Color Formats
- **Format**: Use `oklch` for all color definitions to ensure wide gamut support and smooth interpolation (Wind4 standard).
- **Convention**: Follow the `background`/`foreground` pairing pattern.
- **Definition**: Define variables in your global CSS file. Wind4 detects these automatically.

❌ **Bad:** Hex codes or mixed formats in CSS variables.
```css
:root {
  --primary: #3b82f6;
  --primary-foreground: white;
}
```

✅ **Good:** OKLCH Strict Mode.
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
}
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

## 3. Preset Icons

Use pure CSS icons via `@unocss/preset-icons`.

### Configuration
- **Collections**: 
  - **Node.js**: Auto-detects installed `@iconify-json/*` packages.
  - **Browser**: Must explicitly provide collections via dynamic imports or use the `cdn` option (e.g., `https://esm.sh/`).
  - **Custom**: Use `FileSystemIconLoader` (requires `@iconify/utils` dev dependency) to load local SVGs.
- **Extra Properties**: Use `extraProperties` to enforce inline behavior (`display: inline-block`, `vertical-align: middle`) to prevent layout shifts.
- **Global Transforms**: Use `customizations.transform` to enforce consistency (e.g., forcing `currentColor`).

✅ **Good:** Config with `extraProperties` and `FileSystemIconLoader`.
```ts
import presetIcons from '@unocss/preset-icons'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

presetIcons({
  // Align icons with text by default
  extraProperties: {
    'display': 'inline-block',
    'vertical-align': 'middle',
  },
  collections: {
    // Load local icons from ./assets/icons/*.svg
    custom: FileSystemIconLoader(
      './assets/icons',
      svg => svg.replace(/^<svg /, '<svg fill="currentColor" ')
    ),
  },
  customizations: {
    transform(svg, collection, icon) {
      // Example: Force currentColor on specific collections
      if (collection === 'custom') return svg.replace(/#fff/, 'currentColor')
      return svg
    },
    customize(props) {
      props.width = '1.2em'
      props.height = '1.2em'
      return props
    }
  }
})
```

### Usage Rules
- **Naming**: Use `<div class="i-[collection]-[icon]" />` or `i-[collection]:[icon]`.
- **Modes**: 
  - `?mask` (default usually): Monochrome, uses `mask` property, inherits text color.
  - `?bg`: Original colors, uses `background-image` (common for logos/flags).
- **CSS Directive**: Use `icon()` in CSS to extract metadata: `background-image: icon('i-carbon-sun');`.
- **Accessibility**: MANDATORY `aria-label` for interactive icons or `aria-hidden="true"` for decorative ones.

❌ **Bad:** Missing accessibility or ambiguous mode.
```html
<button class="i-carbon-sun" />
```

✅ **Good:** Accessible, explicit, and directive usage.
```html
<!-- Decorative Icon -->
<div class="i-carbon-sun text-yellow-500" aria-hidden="true" />

<!-- Interactive Button -->
<button class="i-carbon:moon dark:i-carbon:sun" aria-label="Toggle Dark Mode" />

<!-- Force mask mode to colorize a multi-colored icon -->
<div class="i-vscode-icons:file-type-light-pnpm?mask text-red-500" />
```
```css
/* CSS Usage */
.custom-icon-class {
  background-image: icon('i-carbon:sun');
}
```

## 4. Preset Typography

Provides `prose` classes to style vanilla HTML content.

### Configuration
- **Prerequisites**: 
  - **Preset Wind3/4**: MANDATORY. The typography preset relies on the theme's color palette (specifically ranges `50` to `950`) to generate `prose-${color}` utilities.
  - **Preset Attributify**: MANDATORY if using attributify mode (e.g., `prose="~ dark:invert"`).
- **Options**:
  - `selectorName`: Defaults to `prose`. Changing this changes the undo utility (e.g., `selectorName: 'markdown'` creates `not-markdown`).
  - `cssExtend`: Use this to deeply merge or override styles. **Do NOT** use global CSS to override prose children.
  - `compatibility`: Be cautious with `noColonNot` or `noColonWhere`; enabling these may disable the `not-prose` utility or break attributify mode.

✅ **Good:** Configuration with extension and custom selector.
```ts
import presetTypography from '@unocss/preset-typography'

presetTypography({
  selectorName: 'markdown', // Usage: class="markdown"
  cssExtend: {
    'a': { color: 'var(--primary)', 'text-decoration': 'none' },
    'a:hover': { 'text-decoration': 'underline' },
    'code': { color: 'var(--secondary-foreground)', background: 'var(--secondary)' },
  }
})
```

### Usage
- **Classes**: Apply the configured selector (default `prose`).
- **Sizes**: Use `prose-sm`, `prose-base`, `prose-lg`, `prose-xl`, `prose-2xl`.
- **Colors**: Use `prose-${color}` (e.g., `prose-blue`). Requires theme colors to have 50-950 gradation.
- **Dark Mode**: Use `dark:prose-invert`.
- **Opt-out**: Use the `not-${selectorName}` class (e.g., `not-prose`).
  - ⚠️ **Constraint**: This utility works **ONLY as a class**, even in attributify mode, because it relies on the CSS `:not()` selector which UnoCSS does not scan in attributes.

```html
<article class="prose dark:prose-invert prose-lg prose-blue">
  {{ markdown_content }}
  <!-- Custom unstyled content inside prose -->
  <!-- Must use CLASS for not-prose -->
  <div class="not-prose grid grid-cols-2">
    ...
  </div>
</article>
```