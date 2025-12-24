---
trigger: glob
globs: **/*.css
---

---
name: obsidian-rtl-styling
description: Enforces CSS best practices for right-to-left (RTL) language support in Obsidian plugins and themes.
filters:
  glob: "**/*.css"
---

## [!Warning] New in Obsidian 1.6
Many RTL improvements, including mirrored UI and mixed-language support, were introduced in Obsidian 1.6. These changes can affect existing themes and plugins. Be mindful of this version when implementing RTL styles.

# General Rules for RTL Styling

To ensure your plugin or theme UI adapts correctly for users of Right-to-Left (RTL) languages, you must use CSS logical properties and values instead of directional ones.

## CSS Logical Properties

### Spacing (Margin & Padding)

Use `inline-start` and `inline-end` for horizontal spacing.

❌ **Wrong:** Using directional properties.
```css
.my-element {
  margin-left: 10px;
  padding-right: 5px;
}
```

✅ **Good:** Using logical properties.
```css
.my-element {
  margin-inline-start: 10px;
  padding-inline-end: 5px;
}
```

### Borders

Use `inline-start` and `inline-end` for vertical borders.

❌ **Wrong:** Using directional properties.
```css
.my-element {
  border-left: 1px solid var(--text-normal);
}
```

✅ **Good:** Using logical properties.
```css
.my-element {
  border-inline-start: 1px solid var(--text-normal);
}
```

### Positioning

Use `inset-inline-start` and `inset-inline-end` for absolute positioning.

❌ **Wrong:** Using directional properties.
```css
.my-element {
  position: absolute;
  left: 0;
}
```

✅ **Good:** Using logical properties.
```css
.my-element {
  position: absolute;
  inset-inline-start: 0;
}
```

### Text Alignment & Floating

Use `start` and `end` for text alignment and floating elements.

❌ **Wrong:** Using directional values.
```css
.my-header {
  text-align: left;
}
.my-sidebar {
  float: right;
}
```

✅ **Good:** Using logical values.
```css
.my-header {
  text-align: start;
}
.my-sidebar {
  float: inline-end;
}
```

## Obsidian RTL Helpers

Obsidian provides specific classes, variables, and attributes to handle RTL styling.

### Language & Direction Selectors

- **Global UI Direction:** Use the `.mod-rtl` class on the `body` element to style the entire interface when an RTL language is active in **Settings → General**.
- **Specific Language:** Use the `lang` attribute on the `html` element for language-specific adjustments (e.g., `html[lang="ar"]`).
- **Editor Direction:**
    - **Editor View:** Use `.markdown-source-view[dir="rtl"]` to target the editor view. This is active when the global UI is RTL (**Settings → General**) or when the default editor direction is set to RTL (**Settings → Editor**).
    - **Editor Lines:** Use `.cm-line[dir="rtl"]` or `.cm-line[dir="ltr"]` to style individual lines. Obsidian sets the direction based on the first strongly directional character; otherwise, it inherits from the previous line.
- **Reading Mode:** In reading view, content blocks have `dir="auto"` to let the browser determine direction.

### Icon Mirroring

- Obsidian automatically mirrors Lucide icons in RTL mode.
- To prevent a directional icon from being mirrored, unset its transform.

✅ **Good:** Explicitly unsetting the transform for specific icons in RTL mode.
```css
.mod-rtl .left-arrow-icon {
	transform: unset;
}
```

### The `--direction` Variable

- For CSS properties that lack logical equivalents (like `transform`), use the `--direction` variable.
- It resolves to `1` in LTR mode and `-1` in RTL mode.

```css
.my-element {
  /* Moves right in LTR, left in RTL */
  transform: translateX(calc(10px * var(--direction)));
}
```

### Bidirectional Content Handling

- For elements that display single lines of user-generated content (file names, list items, tooltips), use `unicode-bidi: plaintext`.
- This ensures correct text direction and truncation with ellipses (...).

```css
.file-name,
.outline-item,
.tooltip-text {
  unicode-bidi: plaintext;
}
```

## Compatibility & Fallbacks

Support older Obsidian versions with two main strategies.

### 1. Property Fallbacks

Provide a directional fallback before the logical property. The browser will use the last property it understands.

❌ **Wrong:** Only providing the modern property.
```css
.my-element {
  margin-inline-start: 10px; /* Might not be supported */
}
```

✅ **Good:** Providing a directional fallback.
```css
.my-element {
  margin-left: 10px; /* Fallback for older versions */
  margin-inline-start: 10px; /* Preferred for modern versions */
}
```

### 2. Guarding Modern Selectors

Use `@supports` to prevent entire CSS blocks from breaking if they use modern selectors (like `:dir()`) not available in older browser versions.

❌ **Wrong:** Using a modern selector directly might break the entire rule.
```css
/* This rule will fail completely on browsers that don't support :dir() */
body:dir(rtl) .my-element {
  background: red;
}
```

✅ **Good:** Guarding the rule with `@supports`.
```css
/* This will only apply on browsers that support the :dir() selector */
@supports selector(:dir(*)) {
  body:dir(rtl) .my-element {
    background: red;
  }
}
```