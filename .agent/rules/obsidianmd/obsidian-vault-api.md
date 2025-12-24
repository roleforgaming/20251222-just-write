---
trigger: glob
globs: **/*.ts
---

---
name: obsidian-vault-api
description: Enforces best practices for interacting with files and folders using the Obsidian Vault API.
---

# Obsidian Vault API Best Practices

## API Boundaries: Vault vs. Adapter

Choose the correct API based on the visibility of the files you need to access.

- ✅ **Use the `Vault` API for standard file operations.**
  - The `Vault` API is the high-level, safe way to interact with all notes and media visible to the user in Obsidian.

- ❌ **Do not use the `Vault` API for hidden files.**
  - The `Vault` API cannot see or interact with files and folders that are hidden from the Obsidian UI (e.g., anything in `.obsidian/` or other dot-folders).

- ✅ **Use the `Adapter` API for hidden files.**
  - For low-level file system access, including hidden files, use `this.app.vault.adapter`.

## Listing Files

Use the most specific method available to retrieve the list of files you need to process.

- ✅ **Use `vault.getMarkdownFiles()` to list only Markdown notes.**
  - This is the most common and efficient method for plugins that operate on note content.

  ```ts
  // Good: Get a specific list of all .md files.
  const markdownFiles = this.app.vault.getMarkdownFiles();
  ```

- ✅ **Use `vault.getFiles()` to list all files.**
  - Use this when your plugin needs to interact with non-Markdown files like images, PDFs, or other assets in the vault.

  ```ts
  // Good: Get all files, including images, PDFs, etc.
  const allFiles = this.app.vault.getFiles();
  ```

## Reading Files

When reading file content, choose the method based on your intent to prevent data loss or unnecessary disk I/O.

- ✅ **Use `vault.cachedRead(file)` for display purposes.**
  - This is faster as it avoids reading from the disk if the content is already in memory.
  - It is safe and reliable; the cache is automatically flushed if the file is modified externally or saved within Obsidian.

  ```ts
  // Good: Reading content to display it to the user.
  const content = await this.app.vault.cachedRead(file);
  new Notice(content.substring(0, 100));
  ```

- ✅ **Use `vault.read(file)` when you plan to modify the file.**
  - This ensures you have the absolute latest version from the disk, preventing stale writes. Use this as part of a larger operation where you need the freshest data before calling `vault.process()`.

## Modifying Files

Choose the correct modification method based on whether you need the file's existing content.

- ✅ **Use `vault.modify(file, data)` for direct, unconditional overwrites.**
  - This is the correct method when you are completely replacing a file's content and do not need its previous state.

  ```ts
  // Right: Overwriting a file with new content, no read needed.
  await vault.modify(file, `Report generated on: ${new Date().toISOString()}`);
  ```

- ✅ **Use `vault.process(file, callback)` for safe, atomic updates.**
  - Use this when your modification depends on the file's current content. It combines reading and writing into one operation, guaranteeing the file doesn't change in between.

  ```ts
  // Right: Atomically updating file content based on its current state.
  await vault.process(file, (data) => {
    return data.replace(':)', '🙂');
  });
  ```

- ❌ **Do not manually `read()` then `modify()`.**
  - This pattern is vulnerable to race conditions. The file could be modified by another process after you read it but before you write to it, causing data loss.

  ```ts
  // Wrong: This is not an atomic operation.
  const content = await vault.read(file);
  const updated = content.replace(':)', '🙂');
  await vault.modify(file, updated); // <-- Race condition vulnerability here.
  ```

## Deleting Files

Always prefer moving files to the trash over permanent deletion. This is a safer, user-friendly approach.

- ✅ **Use `vault.trash(file, system)` to safely move files to a trash location.**
  - `vault.trash(file, true)`: Moves the file to the operating system's trash bin. (Recommended)
  - `vault.trash(file, false)`: Moves the file to a local `.trash` folder within the vault.

  ```ts
  // Good: Reversible deletion, moves to system trash.
  await this.app.vault.trash(file, true);

  // Also Good: Reversible deletion, moves to local .trash folder.
  await this.app.vault.trash(file, false);
  ```

- ❌ **Avoid `vault.delete(file)` for permanent deletion.**
  - This action is irreversible and can lead to permanent data loss for the user.

  ```ts
  // Bad: Irreversible deletion. Use only when absolutely necessary.
  await this.app.vault.delete(file);
  ```

## Type Checking Abstract Files

When an API returns a `TAbstractFile`, you must verify if it is a file or a folder before operating on it.

- ✅ **Use `instanceof` to check the type of a `TAbstractFile`.**

  ```ts
  // Right: Always check the type before use.
  const item = this.app.vault.getAbstractFileByPath('path/to/item');

  if (item instanceof TFile) {
    // It's a file, proceed with file operations.
    const content = await this.app.vault.read(item);
  } else if (item instanceof TFolder) {
    // It's a folder.
    console.log('This is a folder, children:', item.children);
  }
  ```

---

## Workflow: Asynchronous File Modification

Use this workflow to safely modify a file when the modification logic involves an asynchronous operation (e.g., an API call).

1.  **Read Initial State:** Read the file's current content using `vault.cachedRead()`. Store this content in a variable.
    ```ts
    const initialContent = await this.app.vault.cachedRead(file);
    ```
2.  **Perform Async Operation:** Execute your asynchronous logic to get the required data for the modification.
    ```ts
    const dataFromApi = await fetchAsyncData();
    const modifiedContent = initialContent + `\n${dataFromApi}`;
    ```
3.  **Process Atomically with a Guard:** Use `vault.process()` to write the changes. Inside the callback, check if the data has changed since your initial read.
    - If the data is unchanged, apply your modification.
    - If the data has changed, abort the operation to prevent overwriting external changes. You may notify the user or retry the entire workflow.
    ```ts
    await this.app.vault.process(file, (currentContent) => {
      if (currentContent === initialContent) {
        // Data is the same, safe to write.
        return modifiedContent;
      } else {
        // File was modified externally. Abort to prevent data loss.
        new Notice("File was modified by another process. Please try again.");
        return currentContent; // Return original content to abort write.
      }
    });
    ```