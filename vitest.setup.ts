import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

// Node 26 moved the global `localStorage` behind the --localstorage-file flag,
// so it's undefined in the test environment. Zustand's persist middleware calls
// localStorage.setItem at module load, which throws "Cannot read properties of
// undefined (reading 'setItem')". Polyfill it with an in-memory implementation
// so the cart store can persist across tests.
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();

  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

// Reset storage between tests so cart state doesn't leak across cases.
beforeEach(() => {
  localStorage.clear();
});
