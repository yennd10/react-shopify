# Code splitting demo in `my-app`

## Files

| File | Role |
|------|------|
| `src/components/CodeSplittingDemo.jsx` | `React.lazy` + `Suspense`, open button, loading `fallback` |
| `src/components/lazy/AdvancedTipsModal.jsx` | Modal UI — only loaded via dynamic `import()` → separate build chunk |
| `src/App.jsx` | Static imports for `CodeSplittingDemo` and `FeatureProducts`; modal is **not** statically imported |

## Dev

```bash
npm run dev
```

DevTools → **Network** → filter **JS**. Load the page, then click **“Mở modal (lazy chunk)”** — a new chunk request appears for the lazy module.

## After `npm run build`

`dist/assets/` includes `chunk-[name]-[hash].js` plus `react-app.js` (see `vite.config.js`).

**Shopify:** upload **all** `chunk-*.js` files together with `react-app.js` to `assets/`.

---

*Vietnamese: [CODE-SPLITTING-DEMO.md](./CODE-SPLITTING-DEMO.md)*
