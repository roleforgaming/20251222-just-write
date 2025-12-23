# Obsidian Svelte 5 Plugin Template

This is a modern, production-ready template for creating Obsidian plugins using Svelte 5 and UnoCSS. It provides a solid foundation with the latest Svelte features, while maintaining compatibility with Obsidian's plugin environment.

## ✨ Features

*   **Svelte 5 Integration**: Leverages the power of Svelte 5, including the new runes system for state management (`$state`, `$derived`).
*   **Enhanced UnoCSS Styling**: A supercharged utility-first CSS framework for rapid UI development. It's packed with advanced features like a typography preset, variant groups, `@apply` directives, and autoprefixing.
*   **Icon-Ready**: Includes the Lucide icon set via Iconify, ready to be used in your components (`i-lucide-search`).
*   **TypeScript Support**: Full TypeScript support with proper type definitions for a better development experience.
*   **Hot Reloading**: Fast development cycles with automatic reloading in your test vault.
*   **Modern Build System**: Powered by Vite for optimized and fast builds using Lightning CSS.
*   **Code Quality**: Includes Biome for high-performance formatting and linting.
*   **shadcn/ui Components**: Easily add components from shadcn/ui using the CLI.

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v22.x or newer)
*   [Bun](https://bun.sh/)

### Installation

1.  **Use this template:**
    *   Click the "Use this template" button on the GitHub repository page.
    *   Clone your newly created repository:
        ```bash
        git clone https://github.com/your-username/your-plugin-name.git
        cd your-plugin-name
        ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Start development:**
    ```bash
    bun run dev
    ```    This will build the plugin and watch for changes, automatically rebuilding when you save a file.

### Development Workflow

1.  The `dev` script is configured to build the plugin into a `test-vault/.obsidian/plugins/your-plugin-name` directory. You can open the `test-vault` in Obsidian to test your plugin.
2.  Make changes to the source code in the `src` directory.
3.  The plugin will automatically be rebuilt. You may need to reload Obsidian to see the changes.

## 📦 Available Scripts

*   `bun run dev`: Start the development server with hot reloading.
*   `bun run build`: Create a production-ready build of your plugin.
*   `bun run check`: Run the Svelte compiler to check for errors in your code.
*   `bun run format`: Format your code using Biome.
*   `bun run lint`: Lint your code using Biome and apply safe fixes.

## 📁 Project Structure

```
├── src
│   ├── components
│   │   └── ui
│   │       └── button
│   │           ├── button.svelte
│   │           └── index.ts
│   ├── lib
│   │   └── utils.ts
│   ├── views
│   └── main.ts
├── biome.json
├── bun.lock
├── CHANGELOG.md
├── components.json
├── DEVELOPMENT.md
├── LICENSE
├── package.json
├── README.md
├── tailwind.config.js
├── Theme.svelte
├── tsconfig.json
├── uno.config.ts
└── vite.config.ts```

*   **`src/main.ts`**: The entry point of your Obsidian plugin.
*   **`src/components`**: For your Svelte components.
    *   **`src/components/ui`**: Intended for UI components, especially those from shadcn/ui.
*   **`src/lib`**: For utility functions and other library code.
*   **`src/views`**: For your Obsidian views.
*   **`Theme.svelte`**: A global Svelte component to import CSS resets and UnoCSS styles.
*   **`vite.config.ts`**: The configuration file for Vite.
*   **`uno.config.ts`**: The configuration file for UnoCSS, where you can customize your styling.
*   **`tsconfig.json`**: The TypeScript configuration file.
*   **`package.json`**: Defines the project's dependencies and scripts.
*   **`biome.json`**: The configuration for the Biome formatter and linter.
*   **`components.json`**: The configuration file for shadcn/ui.

## 🎨 Styling with UnoCSS and shadcn/ui

This template is supercharged with UnoCSS, a highly flexible and fast atomic CSS engine. The configuration is enhanced with several presets and transformers out of the box:

### Presets
*   **`presetUno`**: The default, comprehensive utility preset.
*   **`presetWind`**: Provides compatibility with Tailwind CSS.
*   **`presetAnimations`**: Adds utilities for CSS animations.
*   **`presetShadcn`**: A preset for easily integrating with shadcn/ui components.
*   **`presetIcons`**: Enables the use of thousands of icons from Iconify. The Lucide icon set is pre-installed (`i-lucide-<icon-name>`).
*   **`presetTypography`**: Adds beautiful typographic defaults for prose content.

### Transformers
*   **`transformer-variant-group`**: Group utilities with shared variants, like `(hover:&-focus:)(text-red-500 bg-blue-500)`.
*   **`transformer-directives`**: Enables the use of `@apply`, `@screen`, and theme functions in your CSS.

### CSS Optimization
*   **Autoprefixing**: Automatically adds vendor prefixes to CSS rules for better browser compatibility.
*   **Lightning CSS**: Ensures your final CSS is processed and minified with maximum speed.

You can add new shadcn/ui components to your project by running:

```bash
bunx shadcn-svelte@latest add <component-name>
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.