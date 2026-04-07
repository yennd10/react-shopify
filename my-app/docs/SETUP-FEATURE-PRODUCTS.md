# Hướng dẫn: cài đặt project, Tailwind, và component FeatureProducts

Tài liệu cho project **`react-shopify/my-app`** — React + Vite + Tailwind CSS v4, embed vào Shopify theme qua section Liquid.

---

## 1. Cài đặt project

### Yêu cầu

- **Node.js** khuyến nghị phiên bản tương thích **Vite 8** (xem [Vite docs](https://vitejs.dev/guide/) — thường Node 20+).
- **npm**, **pnpm**, hoặc **yarn**.

### Các bước

1. **Vào thư mục project**

   ```bash
   cd /home/yen/projects/react-shopify/my-app
   ```

2. **Cài dependency**

   ```bash
   npm install
   ```

   hoặc `pnpm install` / `yarn`.

3. **Chạy dev (HMR)**

   ```bash
   npm run dev
   ```

   Mở URL terminal in ra (thường `http://localhost:5173`).

4. **Build bundle dùng cho Shopify theme**

   ```bash
   npm run build
   ```

   Output mặc định: thư mục **`dist/`**, với tên file cố định:

   - `dist/assets/react-app.js`
   - `dist/assets/react-app.css`

   (Cấu hình trong `vite.config.js` — `rollupOptions.output`.)

5. **Đưa lên theme Shopify**

   - Copy **`react-app.js`** và **`react-app.css`** từ `dist/assets/` vào thư mục **`assets/`** của theme.
   - Trong theme editor, thêm section **`section/react-feature-products.liquid`** (hoặc tương đương) vào template mong muốn.
   - Section đã khai báo `stylesheet_tag` + `script` defer cho hai asset trên và mount `#react-app-root`.

6. **Lint (tuỳ chọn)**

   ```bash
   npm run lint
   ```

7. **Preview build local**

   ```bash
   npm run preview
   ```

---

## 2. Cách Tailwind được gắn vào project (và cách thêm / tái lập)

Project dùng **Tailwind CSS v4** với plugin Vite chính thức, **không** dùng `tailwind.config.js` kiểu v3 (trừ khi bạn tự thêm sau).

### Đã có sẵn trong repo

| Thành phần | File | Vai trò |
|------------|------|---------|
| Plugin Vite | `vite.config.js` | `import tailwindcss from '@tailwindcss/vite'` → `plugins: [react(), tailwindcss()]` |
| Import Tailwind + prefix | `src/index.css` | `@import "tailwindcss" prefix(tw);` — mọi utility dùng tiền tố **`tw:`** để tránh đụng class CSS của theme Shopify |
| Entry CSS | `src/main.jsx` | `import './index.css'` |

### Nếu tạo project mới và muốn thêm Tailwind giống vậy

1. Tạo app Vite + React: `npm create vite@latest my-app -- --template react`.
2. Cài gói:

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

3. Sửa `vite.config.js`:

   ```js
   import tailwindcss from '@tailwindcss/vite'
   // plugins: [react(), tailwindcss()]
   ```

4. Trong CSS toàn cục (ví dụ `src/index.css`), thêm:

   ```css
   @import "tailwindcss" prefix(tw);
   ```

5. Trong JSX dùng class dạng `className="tw:flex tw:gap-4"` (có prefix `tw:`).

### Ghi chú prefix `tw:`

Trên storefront, theme Dawn/OS 2.0 có nhiều class tên ngắn. Prefix **`tw:`** giúp class Tailwind trong React **không** trùng / không override nhầm style theme.

---

## 3. Các bước tạo component FeatureProducts (tái hiện từ đầu)

1. **Tạo file** `src/components/FeatureProducts.jsx`.
2. **Định nghĩa dữ liệu dự phòng** (`fallbackProducts`) để khi không có JSON từ Shopify vẫn có UI khi dev local.
3. **Viết `parseEmbeddedProducts()`** — đọc `window.__SHOPIFY_FEATURED_PRODUCTS__` hoặc parse `<script type="application/json" id="shopify-featured-products-data">`.
4. **Viết `normalizeProduct()`** — map nhiều kiểu object (Liquid JSON, mock) về một shape thống nhất cho UI.
5. **Viết `formatMoneyFromCents()`** — format giá theo `Shopify.currency.active` và `document.documentElement.lang`.
6. **Component `FeatureProducts`**: gọi parse → normalize → filter → `map` render lưới sản phẩm (ảnh, title, stock, giá, CTA).
7. **Gắn vào app**: trong `App.jsx`, `import FeatureProducts` và render bên trong layout (ví dụ `main` có class `tw:max-w-6xl ...`).
8. **Liquid**: tạo section output JSON sản phẩm vào script `id="shopify-featured-products-data"` và giữ `#react-app-root` + asset `react-app.js` / `react-app.css` như `section/react-feature-products.liquid`.

---

## 4. Luồng hoạt động của FeatureProducts

```text
[Shopify section load trang]
        │
        ├─► Inject JSON: <script id="shopify-featured-products-data" type="application/json">[...]</script>
        ├─► DOM: <div id="react-app-root"></div>
        └─► Load react-app.js (defer) → chạy main.jsx
                    │
                    └─► createRoot(el).render(<App />)
                              │
                              └─► <FeatureProducts />
                                        │
                    ┌───────────────────┴────────────────────┐
                    ▼                                        ▼
        parseEmbeddedProducts()                    (nếu rỗng → fallbackProducts)
                    │
                    ▼
              .map(normalizeProduct)
                    │
                    ▼
         .filter(id + title hợp lệ)
                    │
                    ▼
              render <ul> grid → mỗi product: card + link + giá + CTA
```

- **Nguồn dữ liệu ưu tiên**: mảng parse từ DOM / `window.__SHOPIFY_FEATURED_PRODUCTS__`.
- **Fallback**: `fallbackProducts` khi không có dữ liệu (hữu ích cho `npm run dev` không qua Liquid).
- **Giá**: Liquid đưa `price` / `compare_at_price` dạng **số tiền nhỏ nhất của đơn vị tiền tệ** (Shopify: thường là **cents**). `formatMoneyFromCents` chia `100` khi format — khớp với convention Shopify.

---

## 5. Chức năng từng function trong `FeatureProducts.jsx`

### `parseEmbeddedProducts()`

- **Mục đích**: Lấy danh sách sản phẩm “thô” từ trang, không cần props React từ parent.
- **Hành vi**:
  - Nếu không có `window` (SSR / môi trường lạ): trả `[]`.
  - Nếu `window.__SHOPIFY_FEATURED_PRODUCTS__` là mảng: trả mảng đó (cho phép theme/script khác gán sẵn).
  - Ngược lại: tìm `#shopify-featured-products-data`, `JSON.parse(textContent)`, đảm bảo kết quả là mảng; lỗi parse → `[]`.

### `normalizeProduct(product)`

- **Mục đích**: Chuẩn hoá một object sản phẩm (từ Liquid hoặc mock) thành shape cố định cho UI.
- **Xử lý chính**:
  - **Ảnh**: lấy `featured_image.src`, hoặc string `featured_image`, hoặc `image.src` / `image`.
  - **Giá**: `price`, `compare_at_price` ép `Number` (mặc định 0) — lưu dạng cents.
  - **Khác**: `id`, `title`, `description` (từ `body_html` / `description`), `url`, `available`, `featuredImage`.

### `formatMoneyFromCents(cents)`

- **Mục đích**: Hiển thị giá theo locale và currency storefront.
- **Hành vi**:
  - `currency`: `window.Shopify.currency.active` hoặc fallback `'VND'`.
  - `locale`: `document.documentElement.lang` hoặc `'vi-VN'`.
  - Dùng `Intl.NumberFormat` với `style: 'currency'`, `maximumFractionDigits: 0`, và **chia `cents / 100`** (giả định input là cents).

### `FeatureProducts()` (component mặc định export)

- Gọi `parseEmbeddedProducts()`.
- Nếu mảng rỗng → dùng `fallbackProducts`.
- `map(normalizeProduct)` rồi `filter` bỏ item thiếu `id` hoặc `title`.
- Render section tiêu đề + lưới sản phẩm: ảnh lazy, link, trạng thái stock, giá gạch ngang nếu có compare-at, nút “View product”.

---

## 6. Liên kết với Shopify (`react-feature-products.liquid`)

- Section chọn **collection** và **số sản phẩm** (`products_limit`).
- Vòng `for` Liquid build JSON array: `id`, `handle`, `title`, `url`, `price`, `compare_at_price`, `available`, `featured_image` (qua `image_url`), `body_html` (mô tả đã strip HTML).
- React đọc đúng các field này qua `parseEmbeddedProducts` + `normalizeProduct`.

---

## 7. Lưu ý nhỏ (code quality)

- Trong `fallbackProducts`, một số item dùng chung `id: 'fp-2'` — React `key` trùng có thể gây cảnh báo / bug reorder; nên dùng `id` duy nhất cho mỗi phần tử mock.
- Class `tw:tex-[18px]` ở giá hiện tại có thể là typo của `tw:text-[18px]`; nếu giá không đúng cỡ chữ, sửa lại cho khớp ý đồ thiết kế.

---

*Tài liệu được tạo theo trạng thái repo tại thời điểm viết; nếu đổi tên file build hoặc `id` DOM, cập nhật tương ứng trong Liquid và `main.jsx`.*
