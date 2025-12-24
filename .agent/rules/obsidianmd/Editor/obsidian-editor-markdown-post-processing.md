---
trigger: model_decision
description: When altering rendered markdown in Obsidian
globs: **/*.ts
---

---
name: obsidian-markdown-post-processing
description: How to programmatically alter rendered Markdown in Obsidian plugins.
---

# Obsidian Markdown Post-Processing

There are two primary methods for altering rendered Markdown output in Reading view, each designed for a specific use case. All processors must be registered within the `onload` method of your plugin.

## 1. Processing Custom Code Blocks

To create custom rendered output for fenced code blocks (e.g., ` ```mermaid ` or ` ```csv `), use the dedicated code block processor. This is the correct and most efficient method for handling language-specific blocks.

❌ **Wrong:** Using a general post-processor to find and parse a specific code block. This is inefficient as it scans the entire document's HTML for every render and is less robust.

✅ **Right:** Use `registerMarkdownCodeBlockProcessor` for a specific language. This is direct, performant, and provides the raw source code.

The processor callback provides three arguments:
*   `source`: A string containing the raw text inside the code block.
*   `el`: The `HTMLElement` to render your custom output into.
*   `ctx`: A `MarkdownPostProcessorContext` object with more rendering context.

```ts
import { Plugin } from 'obsidian';

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('csv', (source, el, ctx) => {
      const rows = source.split('\n').filter((row) => row.length > 0);

      const table = el.createEl('table');
      const body = table.createEl('tbody');

      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(',');
        const row = body.createEl('tr');
        for (let j = 0; j < cols.length; j++) {
          row.createEl('td', { text: cols[j] });
        }
      }
    });
  }
}
```

## 2. General Post-Processing

Use `registerMarkdownPostProcessor` for modifications to the rendered HTML that are **not** specific to code blocks. This method runs after the Markdown is converted to HTML, allowing you to query and manipulate any element. It is ideal for finding and replacing specific text patterns or HTML elements across the entire rendered document.

✅ **Good:** Use a general post-processor to find and replace inline `<code>` elements with custom content, like emojis.

```ts
import { Plugin } from 'obsidian';

const ALL_EMOJIS: Record<string, string> = {
  ':+1:': '👍',
  ':sunglasses:': '😎',
  ':smile:': '😄',
};

export default class ExamplePlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor((element, context) => {
      const codeblocks = element.findAll('code');

      for (let codeblock of codeblocks) {
        const text = codeblock.innerText.trim();
        if (text[0] === ':' && text[text.length - 1] === ':') {
          const emojiEl = codeblock.createSpan({
            text: ALL_EMOJIS[text] ?? text,
          });
          codeblock.replaceWith(emojiEl);
        }
      }
    });
  }
}
```