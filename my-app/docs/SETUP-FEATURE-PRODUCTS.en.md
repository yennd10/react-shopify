# Guide: project setup, Tailwind, and the FeatureProducts component

Documentation for **`react-shopify/my-app`** — React + Vite + Tailwind CSS v4, embedded in a Shopify theme via a Liquid section.

---

## 1. Installing the project

### Requirements

- **Node.js** version compatible with **Vite 8** (see [Vite docs](https://vitejs.dev/guide/) — typically Node 20+).
- **npm**, **pnpm**, or **yarn**.

### Steps

1. **Go to the project directory**

   ```bash
   cd path/to/react-shopify/my-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   or `pnpm install` / `yarn`.

3. **Run the dev server (HMR)**

   ```bash
   npm run dev
   ```

   Open the URL printed in the terminal (usually `http://localhost:5173`).

4. **Build the bundle for the Shopify theme**

   ```bash
   npm run build
   ```

   Default output: **`dist/`** with fixed filenames:

   - `dist/assets/react-app.js`
   - `dist/assets/react-app.css`

   (Configured in `vite.config.js` — `rollupOptions.output`.)

5. **Deploy to the Shopify theme**

   - Copy **`react-app.js`** and **`react-app.css`** from `dist/assets/` into the theme **`assets/`** folder.
   - In the theme editor, add the **`section/react-feature-products.liquid`** section (or equivalent) to the desired template.
   - The section registers `stylesheet_tag` + deferred `script` for those assets and mounts `#react-app-root`.

6. **Lint (optional)**

   ```bash
   npm run lint
   ```

7. **Preview the production build locally**

   ```bash
   npm run preview
   ```

---

## 2. How Tailwind is wired (and how to reproduce it)

This project uses **Tailwind CSS v4** with the official **Vite plugin**. There is **no** v3-style `tailwind.config.js` unless you add one later.

### Already in the repo

| Piece | File | Role |
|-------|------|------|
| Vite plugin | `vite.config.js` | `import tailwindcss from '@tailwindcss/vite'` → `plugins: [react(), tailwindcss()]` |
| Tailwind import + prefix | `src/index.css` | `@import "tailwindcss" prefix(tw);` — utilities use the **`tw:`** prefix to avoid clashing with Shopify theme classes |
| Global CSS entry | `src/main.jsx` | `import './index.css'` |

### Adding the same setup to a new project

1. Scaffold Vite + React: `npm create vite@latest my-app -- --template react`.
2. Install packages:

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

3. Update `vite.config.js`:

   ```js
   import tailwindcss from '@tailwindcss/vite'
   // plugins: [react(), tailwindcss()]
   ```

4. In global CSS (e.g. `src/index.css`), add:

   ```css
   @import "tailwindcss" prefix(tw);
   ```

5. In JSX use classes like `className="tw:flex tw:gap-4"` (always with the `tw:` prefix).

### Why the `tw:` prefix

Storefront themes (e.g. Dawn / OS 2.0) ship many short utility-like class names. The **`tw:`** prefix keeps Tailwind classes inside React from colliding with or overriding theme styles unintentionally.

---

## 3. Steps to build FeatureProducts from scratch

1. **Create** `src/components/FeatureProducts.jsx`.
2. **Define fallback data** (`fallbackProducts`) so the UI still renders during local `npm run dev` without Liquid JSON.
3. **Implement `parseEmbeddedProducts()`** — read `window.__SHOPIFY_FEATURED_PRODUCTS__` or parse `<script type="application/json" id="shopify-featured-products-data">`.
4. **Implement `normalizeProduct()`** — map varied shapes (Liquid JSON, mocks) into one UI-friendly object.
5. **Implement `formatMoneyFromCents()`** — format money using `Shopify.currency.active` and `document.documentElement.lang`.
6. **Build the `FeatureProducts` component**: parse → normalize → filter → `map` to render the product grid (image, title, stock, price, CTA).
7. **Mount in the app**: in `App.jsx`, `import FeatureProducts` and render inside your layout (e.g. `main` with `tw:max-w-6xl ...`).
8. **Liquid**: add a section that outputs product JSON in `id="shopify-featured-products-data"` and keeps `#react-app-root` plus `react-app.js` / `react-app.css`, as in `section/react-feature-products.liquid`.

---

## 4. FeatureProducts data flow

```text
[Shopify section loads on the page]
        │
        ├─► Inject JSON: <script id="shopify-featured-products-data" type="application/json">[...]</script>
        ├─► DOM: <div id="react-app-root"></div>
        └─► Load react-app.js (defer) → runs main.jsx
                    │
                    └─► createRoot(el).render(<App />)
                              │
                              └─► <FeatureProducts />
                                        │
                    ┌───────────────────┴────────────────────┐
                    ▼                                        ▼
        parseEmbeddedProducts()              (if empty → fallbackProducts)
                    │
                    ▼
              .map(normalizeProduct)
                    │
                    ▼
         .filter(valid id + title)
                    │
                    ▼
              render <ul> grid → per product: card + links + price + CTA
```

- **Primary data source**: array from the DOM / `window.__SHOPIFY_FEATURED_PRODUCTS__`.
- **Fallback**: `fallbackProducts` when no data is present (useful for dev without Liquid).
- **Money**: Liquid outputs `price` / `compare_at_price` in the **smallest currency unit** (Shopify: typically **cents**). `formatMoneyFromCents` divides by **100** when formatting — aligned with Shopify’s convention.

---

## 5. What each function in `FeatureProducts.jsx` does

### `parseEmbeddedProducts()`

- **Purpose**: Load a raw product list from the page without React props from a parent.
- **Behavior**:
  - If `window` is missing (SSR / odd environments): return `[]`.
  - If `window.__SHOPIFY_FEATURED_PRODUCTS__` is an array: return it (allows theme/other scripts to pre-seed data).
  - Otherwise: find `#shopify-featured-products-data`, `JSON.parse(textContent)`, ensure the result is an array; on parse error return `[]`.

### `normalizeProduct(product)`

- **Purpose**: Normalize one product object (from Liquid or mocks) into a fixed shape for the UI.
- **Main logic**:
  - **Image**: `featured_image.src`, string `featured_image`, or `image.src` / `image`.
  - **Prices**: coerce `price` and `compare_at_price` with `Number` (default 0) — stored as cents in the normalized object.
  - **Other fields**: `id`, `title`, `description` (from `body_html` / `description`), `url`, `available`, `featuredImage`.

### `formatMoneyFromCents(cents)`

- **Purpose**: Display money using storefront locale and currency.
- **Behavior**:
  - `currency`: `window.Shopify.currency.active` or fallback `'VND'`.
  - `locale`: `document.documentElement.lang` or `'vi-VN'`.
  - Uses `Intl.NumberFormat` with `style: 'currency'`, `maximumFractionDigits: 0`, and **divides `cents / 100`** (assumes cents input).

### `FeatureProducts()` (default export)

- Calls `parseEmbeddedProducts()`.
- If the array is empty → uses `fallbackProducts`.
- `map(normalizeProduct)` then `filter` drops items missing `id` or `title`.
- Renders the heading block + product grid: lazy-loaded images, links, stock label, struck-through compare-at price when applicable, “View product” button.

---

## 6. Shopify integration (`react-feature-products.liquid`)

- Section settings: **collection** and **product count** (`products_limit`).
- Liquid `for` loop builds a JSON array: `id`, `handle`, `title`, `url`, `price`, `compare_at_price`, `available`, `featured_image` (via `image_url`), `body_html` (description with HTML stripped).
- React consumes these fields through `parseEmbeddedProducts` + `normalizeProduct`.

---

## 7. Small notes (code quality)

- In `fallbackProducts`, several items reuse `id: 'fp-2'` — duplicate React `key`s can cause warnings / reorder bugs; give each mock item a unique `id`.
- The class `tw:tex-[18px]` for the price may be a typo for `tw:text-[18px]`; fix if font size is wrong.

---

*This document reflects the repo at the time it was written. If you rename build outputs or DOM ids, update Liquid and `main.jsx` accordingly.*
