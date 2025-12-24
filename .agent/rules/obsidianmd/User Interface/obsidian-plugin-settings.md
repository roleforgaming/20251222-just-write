---
trigger: model_decision
description: When the user wants to add a setting to the Obsidian Plugin Settings
globs: **/*.ts
---

---
name: obsidian-plugin-settings
description: How to create and manage settings for an Obsidian plugin.
---

# Obsidian Plugin Settings

This file outlines the standard patterns for creating a settings tab, saving/loading configuration, and building the UI for an Obsidian plugin.

## Plugin Setup: Data Handling

The main plugin class is responsible for defining the settings structure and managing its persistence.

### 1. Define Settings Interface and Defaults

- Define an interface for your settings.
- Create a `DEFAULT_SETTINGS` constant using `Partial<YourSettingsInterface>`.

```ts
interface ExamplePluginSettings {
  sampleValue: string;
}

const DEFAULT_SETTINGS: Partial<ExamplePluginSettings> = {
  sampleValue: 'Lorem ipsum',
};
```

> **Tip:** `Partial<Type>` is a TypeScript utility that makes all properties of `Type` optional. This lets you provide defaults for only a subset of your settings while maintaining type safety.

### 2. Implement Load/Save Logic

✅ **Right:** Implement `async` methods for loading and saving settings. Use `Object.assign` to merge defaults with saved data.

```ts
export default class ExamplePlugin extends Plugin {
  settings: ExamplePluginSettings;

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ...
}
```

> **Warning:** `Object.assign()` performs a shallow copy. For settings with nested objects, you must implement a deep copy to avoid unintended side effects.

### 3. Initialize in `onload`

✅ **Right:** In `onload`, load settings first, then add the setting tab.

```ts
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ExampleSettingTab(this.app, this));
  }
```

## Settings Tab Implementation

Create a separate class that extends `PluginSettingTab` to render the UI.

### Basic Structure

```ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import ExamplePlugin from './main';

export class ExampleSettingTab extends PluginSettingTab {
  plugin: ExamplePlugin;

  constructor(app: App, plugin: ExamplePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    // Clear the container to prevent duplicate elements on redraw
    containerEl.empty();

    // Add setting components here...
    new Setting(containerEl)
      .setName('Default value')
      .addText(text => text
        .setPlaceholder('Lorem ipsum')
        .setValue(this.plugin.settings.sampleValue)
        .onChange(async (value) => {
          this.plugin.settings.sampleValue = value;
          await this.plugin.saveSettings();
        }));
  }
}
```

### Updating Settings

✅ **Right:** The `onChange` handler must update the settings object AND call `saveSettings()`.

```ts
.onChange(async (value) => {
  this.plugin.settings.sampleValue = value;
  await this.plugin.saveSettings();
})
```

❌ **Wrong:** Only updating the local object without saving it. The changes will be lost.

```ts
.onChange(async (value) => {
  // ❌ Missing call to save the settings to disk
  this.plugin.settings.sampleValue = value;
});
```

## Available Setting Components

### Heading

Use headings to organize settings into logical sections.

```ts
new Setting(containerEl).setName('Section Heading').setHeading();
```

### Text

A single-line text input.

```ts
new Setting(containerEl)
  .setName('Sample Value')
  .setDesc('A description for this setting.')
  .addText(text => text
    .setPlaceholder('Enter some text')
    .setValue(this.plugin.settings.sampleValue)
    .onChange(async (value) => {
      this.plugin.settings.sampleValue = value;
      await this.plugin.saveSettings();
    }));
```

### Textarea

A multi-line text input.

```ts
new Setting(containerEl)
  .setName('Custom CSS Snippet')
  .addTextArea(text => text
    .setPlaceholder('Enter custom CSS here...')
    .setValue(this.plugin.settings.customCss)
    .onChange(async (value) => {
      this.plugin.settings.customCss = value;
      await this.plugin.saveSettings();
    }));
```

### Search

An input for searchable lists, often paired with `AbstractInputSuggest`.

```ts
new Setting(containerEl)
  .setName('Search')
  .addSearch(search => {
    // To add suggestions, attach an AbstractInputSuggest class here
    // new YourSuggestClass(this.app, search.inputEl);
    search
      .setPlaceholder('Search for something...')
      .setValue(this.plugin.settings.searchQuery)
      .onChange(async (value) => {
        this.plugin.settings.searchQuery = value;
        await this.plugin.saveSettings();
      });
  });
```

### Toggle

A simple on/off switch.

```ts
new Setting(containerEl)
  .setName('Enable Feature')
  .addToggle(toggle => toggle
    .setValue(this.plugin.settings.featureEnabled)
    .onChange(async (value) => {
      this.plugin.settings.featureEnabled = value;
      await this.plugin.saveSettings();
      // Re-render the settings tab to reflect changes if needed
      this.display();
    }));
```

### Dropdown

A select/dropdown menu.

```ts
new Setting(containerEl)
  .setName('Default View')
  .addDropdown(dropdown => dropdown
    .addOption('list', 'List View')
    .addOption('grid', 'Grid View')
    .setValue(this.plugin.settings.defaultView)
    .onChange(async (value) => {
      this.plugin.settings.defaultView = value;
      await this.plugin.saveSettings();
    }));
```

### Slider

A slider for numeric input.

```ts
new Setting(containerEl)
  .setName('Font Size')
  .addSlider(slider => slider
    .setLimits(10, 20, 1) // Min, Max, Step
    .setValue(this.plugin.settings.fontSize)
    .setDynamicTooltip()
    .onChange(async (value) => {
      this.plugin.settings.fontSize = value;
      await this.plugin.saveSettings();
    }));
```

### Color Picker

A component for selecting a color.

```ts
new Setting(containerEl)
  .setName('Highlight Color')
  .addColorPicker(color => color
    .setValue(this.plugin.settings.highlightColor)
    .onChange(async (value) => {
      this.plugin.settings.highlightColor = value;
      await this.plugin.saveSettings();
    }));
```

### Moment.js Date Format

An input for Moment.js date formats with a live sample preview.

```ts
const desc = document.createDocumentFragment();
desc.append(
  'For a list of all available tokens, see the ',
  desc.createEl('a', {
    text: 'format reference',
    href: 'https://momentjs.com/docs/#/displaying/format/',
    target: '_blank',
  }),
  '.'
);

new Setting(containerEl)
  .setName('Date Format')
  .setDesc(desc)
  .addMomentFormat(format => {
    // This element will display the live preview.
    format.setSampleEl(containerEl.createEl('span'));
    format
      .setDefaultFormat('YYYY-MM-DD')
      .setValue(this.plugin.settings.dateFormat)
      .onChange(async (value) => {
        this.plugin.settings.dateFormat = value;
        await this.plugin.saveSettings();
      });
  });
```

### Button

A standalone action button.

```ts
new Setting(containerEl)
  .setName('Reset Configuration')
  .addButton(button => button
    .setButtonText('Reset')
    .setWarning()
    .onClick(async () => {
      // Logic to reset settings
    }));
```

### Extra Button

A secondary button added to another setting, often for resetting it.

```ts
new Setting(containerEl)
  .setName('API Key')
  .addText(text => { /* ... */ })
  .addExtraButton(button => button
    .setIcon('reset')
    .setTooltip('Reset to default')
    .onClick(async () => {
      // Logic to reset this specific setting
    }));
```

### Progress Bar

A read-only bar to show progress or a quota.

```ts
new Setting(containerEl)
  .setName('Sync Progress')
  .setDesc('Currently 50% complete.')
  .addProgressBar(bar => bar.setValue(50));
```