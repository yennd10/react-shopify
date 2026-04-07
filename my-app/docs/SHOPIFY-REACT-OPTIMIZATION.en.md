# Optimizing a Shopify theme with embedded React

Notes on **performance and architecture** when using **React** (e.g. a Vite/Webpack bundle) **inside a Liquid theme** — typically a section plus `react-app.js` / `react-app.css` in `assets/`.

---

## 1. Bundles and JavaScript

- **Production builds**: `NODE_ENV=production`, minify, disable source maps on the live theme (keep maps for local debugging only).
- **Tree-shaking**: configure the bundler to drop dead code; prefer targeted imports where libraries allow it.
- **Code splitting / lazy loading**: `React.lazy` + dynamic `import()` for below-the-fold or rare UI; keep the main entry small for above-the-fold content. *(Expanded below.)*
- **Single React instance**: avoid two separate bundles each embedding React — larger downloads and possible conflicts.
- **Fewer dependencies**: replace heavy utilities (lodash, moment, large icon packs) with lighter alternatives or minimal code.

---

## 1A. Code splitting and lazy loading — in depth

### Goals

- **Initial entry chunk** (what `main.jsx` pulls in immediately): only code **needed for what users see early** (above-the-fold) — e.g. a featured-product grid or a slim header. Aim to **reduce bytes downloaded and parsed before the page feels usable**.
- **Secondary chunks**: UI that is **rare** or **after interaction** (size-guide modal, heavy “Reviews” tab, comparison table) live in separate files; the browser fetches them **only when needed**.

### How dynamic `import()` works

`import('./Component.jsx')` returns a **Promise** for that module. Vite/Webpack **emit a separate** `.js` **chunk** (e.g. `chunk-ReviewsTab-xxxxx.js`). The chunk is **requested only when that `import()` runs** — if it never runs, it never downloads.

### `React.lazy` + `Suspense`

- `const Modal = lazy(() => import('./HeavyModal.jsx'))` tells React to load that module lazily.
- Wrap the tree that renders `Modal` in **`<Suspense fallback={...}>`** so users see a placeholder (spinner, skeleton) while the first chunk load finishes.
- If that branch **does not mount** (modal closed, tab not selected), the `import()` **does not run** → the chunk **is not fetched**.

### Example: rarely opened modal

```jsx
import { lazy, Suspense, useState } from 'react'

const SizeGuideModal = lazy(() => import('./SizeGuideModal.jsx'))

export function ProductSection() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Size guide</button>
      {open && (
        <Suspense fallback={<div aria-busy="true">Loading…</div>}>
          <SizeGuideModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
```

On first page load the **SizeGuideModal** chunk is **not** loaded. It loads the first time the user opens the modal (you may briefly see `fallback`).

### Example: heavy secondary tab

Keep a light “Description” tab as a **static** import. Lazy-load “Reviews” (stars, API client, extra libs):

```jsx
const ReviewsTab = lazy(() => import('./ReviewsTab.jsx'))

{activeTab === 'reviews' && (
  <Suspense fallback={<p>Loading reviews…</p>}>
    <ReviewsTab />
  </Suspense>
)}
```

The reviews chunk downloads only when that tab is selected.

### Above-the-fold: usually **avoid** `lazy`

LCP-critical UI (hero, first product block) should use a **normal** `import ... from` so it stays in the **entry** chunk. Lazy there adds little benefit (you still need the code immediately) and can add an extra round trip plus a visible `Suspense` fallback.

### Shopify / Vite deployment notes

- A production build may output **multiple files** under `dist/assets/` (entry plus `chunk-*.js`). Upload **all** required chunks to the theme `assets/` folder and ensure relative URLs resolve (Vite normally wires chunk URLs from the entry). Uploading **only** `react-app.js` while the build code-splits can cause **404** on chunks.
- If you **force a single bundle** (`rollupOptions.output.inlineDynamicImports: true`), you trade away splitting for **one large download**.

### Alternative without `React.lazy`

You can `await import('./X')` inside `useEffect` on user action and `setState` with the exported component — flexible but verbose; `lazy` + `Suspense` is usually cleaner for declarative UI.

---

## 2. How scripts load on the storefront

- Use **`defer`** (or `type="module"` with equivalent behavior) so parsing isn’t blocked.
- Avoid large **inline** scripts in Liquid; prefer **`assets/`** files for Shopify CDN caching.
- **Preload** scripts only when interaction is truly needed for LCP — wrong preloads compete with more important resources.

---

## 3. Liquid vs React boundaries

- **Liquid for static / SEO / LCP**: headings, marketing copy, hero images can be server-rendered HTML; React adds interactivity (filters, carousels, state).
- **Keep JSON small**: `<script type="application/json">` should only include fields the UI needs; avoid dumping full product objects you never use.
- **Reasonable number of mount points**: many tiny roots can add cost if you mount/hydrate often; balance with UX.

---

## 4. CSS

- **Prefix / scope classes** (e.g. Tailwind `prefix(tw)`) to reduce clashes with Dawn / OS 2.0 theme utilities.
- **Limit CLS**: reserve space for images and layout (`width`/`height` or `aspect-ratio`) before React finishes painting.
- Consider critical vs non-critical CSS for above-the-fold sections (depends on theme complexity).

---

## 5. Images and media

- Use Liquid **`image_url`** with appropriate widths (e.g. 400 / 800 / 1200), not oversized sources for thumbnails.
- `loading="lazy"` below the fold; prefer efficient formats when Shopify’s CDN pipeline supports them.

---

## 6. Data and network

- If Liquid already provides the data, **avoid extra fetches** from React (fewer waterfalls, less rate-limit pressure).
- When Storefront API is required: short client-side caching, debouncing, and fetch on user action.

---

## 7. Measurement

- Track **Web Vitals** (LCP, INP, CLS) on the live theme and in the editor when relevant.
- Run **Lighthouse** or CI checks on templates that include React sections.
- Compare **first load** vs **in-store navigation** (some themes avoid full page reloads).

---

## 8. Architecture at scale

- **Theme app extensions / app blocks**: separate app lifecycle and versioning from the main theme repo.
- **Headless (Hydrogen, etc.)**: when the storefront is mostly a SPA — optimization and deployment differ from “small embed in theme”.

---

## 9. Operations and DX

- **One clear build pipeline**; either fixed filenames (`react-app.js`) or **content hashes + a snippet** that injects the correct URLs to avoid stale browser cache after deploy.
- **Disable the section** in the theme editor for A/B tests or performance debugging.

---

## Priority summary

1. Small bundle, single React, production build.  
2. `defer`, minimal inline, small JSON payloads.  
3. Liquid owns static/SEO; React owns interactivity.  
4. Right-sized images, reduce CLS.  
5. Measure real-world LCP/INP and repeat after major changes.

---

*Vietnamese version: [SHOPIFY-REACT-OPTIMIZATION.md](./SHOPIFY-REACT-OPTIMIZATION.md)*
