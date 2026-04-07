# Demo code splitting trong `my-app`

## File liên quan

| File | Vai trò |
|------|---------|
| `src/components/CodeSplittingDemo.jsx` | `React.lazy` + `Suspense`, nút mở modal, `fallback` khi tải chunk |
| `src/components/lazy/AdvancedTipsModal.jsx` | UI modal — **chỉ** nằm trong dynamic `import()`, thành chunk riêng khi build |
| `src/App.jsx` | Import tĩnh `CodeSplittingDemo` + `FeatureProducts`; modal **không** import tĩnh |

## Cách xem trên dev

```bash
npm run dev
```

Mở DevTools → **Network** → lọc **JS**. Tải trang: thấy entry (ví dụ `@vite/client`, `main.jsx`, …). Bấm **“Mở modal (lazy chunk)”**: xuất thêm request tới module/chunk của `AdvancedTipsModal`.

## Cách xem sau `npm run build`

Trong `dist/assets/` sẽ có thêm file dạng `chunk-[name]-[hash].js` (theo `vite.config.js`). Entry `react-app.js` tham chiếu chunk đó.

**Shopify:** copy **toàn bộ** `chunk-*.js` cùng `react-app.js` lên `assets/`, không chỉ một file entry.

## English

See [CODE-SPLITTING-DEMO.en.md](./CODE-SPLITTING-DEMO.en.md).
