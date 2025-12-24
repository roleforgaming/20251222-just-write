---
trigger: model_decision
description: When working with CodeMirror6 state fields
globs: **/*.ts
---

---
name: obsidian-state-fields
description: Defines the correct structure for creating and managing custom editor state using CodeMirror State Fields in Obsidian plugins.
---

# State Field Implementation Guide

A State Field is an editor extension that computes and manages a piece of editor state. It is the primary mechanism for tracking custom data alongside the document.

## 1. Defining State Effects

State Effects describe a specific, self-contained state change. Think of them as named operations or events.

✅ Use `StateEffect.define<T>()` to declare each possible state transition.
- The generic `<T>` defines the type of the value the effect carries.
- If an effect carries no value, omit the type parameter.

```ts
import { StateEffect } from "@codemirror/state";

// Example: Effects for a calculator
const addEffect = StateEffect.define<number>();
const subtractEffect = StateEffect.define<number>();
const resetEffect = StateEffect.define();
```

## 2. Defining the State Field

A State Field computes and manages a piece of state based on transactions. It does not store the state itself; it derives the new state from the old state and any effects.

✅ Define the field with `StateField.define<T>({...})`, where `<T>` is the type of the state it manages.
✅ Implement the `create` method to provide the initial value of the state.
✅ Implement the `update` method as a pure function to compute the new state from the `oldState` and the `transaction`.

❌ Do not mutate the `oldState` parameter within the `update` function. State is immutable.
✅ Create a `newState` variable initialized with `oldState`.
✅ Iterate over `transaction.effects` to apply all incoming changes.
✅ Use `effect.is(yourEffect)` to identify which effect to apply.
✅ Return the final `newState` from the `update` function.

```ts
import { StateField, Transaction, EditorState, StateEffect } from "@codemirror/state";

// Assumes effects from the previous step are in scope
const addEffect = StateEffect.define<number>();
const subtractEffect = StateEffect.define<number>();
const resetEffect = StateEffect.define();

export const calculatorField = StateField.define<number>({
  create(state: EditorState): number {
    return 0; // The starting value of our calculator.
  },
  update(oldState: number, transaction: Transaction): number {
    let newState = oldState;

    for (let effect of transaction.effects) {
      if (effect.is(addEffect)) {
        newState += effect.value;
      } else if (effect.is(subtractEffect)) {
        newState -= effect.value;
      } else if (effect.is(resetEffect)) {
        newState = 0;
      }
    }

    return newState;
  },
  // The `provide` property connects the state field to other extensions,
  // most commonly to provide decorations to the view layer.
  provide: (field) => {
    // This is where you would return a ViewPlugin, decorations, or other extensions
    // that depend on this state field's value.
    return [];
  }
});
```

## 3. Dispatching State Effects

To trigger a state update, dispatch effects through the `EditorView` as part of a transaction.

✅ Create an effect instance using the `.of()` method on your defined effect (e.g., `addEffect.of(10)`).
✅ For effects defined without a type (e.g., `StateEffect.define()`), you must still call the `.of()` method to create an effect instance. You can pass `null` or `undefined` as the argument (e.g., `resetEffect.of(null)`), as it will be ignored.
✅ Dispatch effects within a transaction object using `view.dispatch({ effects: [...] })`.

❌ Never modify state directly. Always dispatch effects.

```ts
import { EditorView } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

// Assume view is an instance of EditorView and addEffect is defined
const addEffect = StateEffect.define<number>();
const num = 10;

// Good: Dispatch a single effect
view.dispatch({
  effects: [addEffect.of(num)],
});
```

✅ Encapsulate dispatch logic in helper functions for a cleaner, more reusable API.

```ts
import { EditorView } from "@codemirror/view";
import { StateEffect } from "@codemirror/state";

const addEffect = StateEffect.define<number>();
const subtractEffect = StateEffect.define<number>();
const resetEffect = StateEffect.define();

// Good: Helper functions provide a clear API
export function add(view: EditorView, num: number) {
  view.dispatch({
    effects: [addEffect.of(num)],
  });
}

export function subtract(view: EditorView, num: number) {
  view.dispatch({
    effects: [subtractEffect.of(num)],
  });
}

export function reset(view: EditorView) {
  view.dispatch({
    effects: [resetEffect.of(null)], // .of() must be called even for valueless effects
  });
}
```

## 4. Connecting State to the UI

State fields are often used to drive visual changes in the editor. To visually represent the information in your state field, provide `Decorations`. The state field's `provide` property (shown in the Section 2 example) is the standard way to create a `ViewPlugin` that reads the state and creates the appropriate decorations.