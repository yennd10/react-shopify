# Tối ưu Shopify theme có React nhúng

Ghi chú các hướng tối ưu khi dùng **React** (bundle kiểu Vite/Webpack) **nhúng trong theme** Liquid — ví dụ section + `react-app.js` / `react-app.css` trong `assets/`.

---

## 1. Bundle và JavaScript

- **Build production**: `NODE_ENV=production`, minify, tắt source map trên theme production (chỉ dùng map khi debug local).
- **Tree-shaking**: cấu hình bundler để loại code chết; import có chọn lọc (`import { x } from 'lib'` thay vì import cả thư viện nếu có thể).
- **Code splitting / lazy load**: `React.lazy` + `dynamic import()` cho phần below-the-fold hoặc ít dùng; giữ entry chính nhỏ cho nội dung ưu tiên đầu trang. *(Chi tiết ở mục dưới.)*
- **Một bản React**: tránh hai bundle khác nhau mỗi bundle tự nhúng React → tăng kích thước và rủi ro xung đột.
- **Giảm dependency**: cân nhắc thay lodash/moment/bộ icon nặng bằng giải pháp nhẹ hoặc code tối thiểu.

---

## 1A. Code splitting và lazy load — chi tiết

### Mục tiêu

- **Entry / chunk đầu** (những gì `main.jsx` kéo theo ngay): chỉ code **cần cho phần thấy sớm** (above-the-fold) — ví dụ lưới featured products, thanh header đơn giản. Mục tiêu là **giảm số byte JS phải tải + parse trước khi trang “dùng được”**.
- **Chunk phụ**: UI **ít gặp** hoặc **sau tương tác** (modal size guide, tab “Reviews” nặng, bảng so sánh) tách sang file riêng; trình duyệt chỉ tải khi thật sự cần.

### `import()` động hoạt động thế nào?

`import('./Component.jsx')` trả về **Promise** của module. Vite/Webpack **tách** file đó thành **chunk `.js` riêng** (tên kiểu `chunk-ReviewsTab-xxxxx.js`). Chunk chỉ được **request** khi dòng `import()` chạy — không chạy thì không tải.

### `React.lazy` + `Suspense`

- `const Modal = lazy(() => import('./HeavyModal.jsx'))` — báo cho React: component này lấy module theo kiểu lazy.
- Cần **`<Suspense fallback={...}>`** bọc nhánh render chứa `Modal` để hiển thị placeholder (spinner, skeleton) trong lúc chunk đang tải lần đầu.
- Nếu nhánh **không mount** (modal đóng, tab chưa chọn), `import()` **chưa gọi** → chunk **chưa tải**.

### Ví dụ: modal ít mở

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

User vào trang: **chưa** tải `SizeGuideModal` chunk. Chỉ khi bấm mở modal lần đầu mới tải (có thể thấy `fallback` trong vài trăm ms).

### Ví dụ: tab phụ nặng

Tab mô tả nhẹ có thể **import tĩnh**. Tab reviews (sao, API, thư viện) nên `lazy`:

```jsx
const ReviewsTab = lazy(() => import('./ReviewsTab.jsx'))

{activeTab === 'reviews' && (
  <Suspense fallback={<p>Loading reviews…</p>}>
    <ReviewsTab />
  </Suspense>
)}
```

Chỉ khi user chọn tab Reviews mới tải chunk tương ứng.

### Above-the-fold: thường **không** nên `lazy`

Phần ảnh/text **LCP** (hero, block sản phẩm đầu trang) nên `import ... from` **bình thường** để nằm trong **entry**. Lazy ở đây ít giúp (vì vẫn cần code ngay) và có thể thêm **một vòng** tải chunk + hiển thị `fallback` làm trễ paint.

### Shopify / Vite: lưu ý triển khai

- Build có thể sinh **nhiều file** trong `dist/assets/` (entry + các `chunk-*.js`). Khi copy lên theme, cần **đủ file** và đường dẫn tương đối đúng (Vite thường inject URL chunk từ entry). Nếu chỉ upload **một** `react-app.js` trong khi build tách chunk, có thể **404** chunk.
- Nếu bạn **cố ý** gộp một file (`rollupOptions.output.inlineDynamicImports: true`), trade-off là **một lần tải to** — mất lợi splitting.

### Thay thế không dùng `lazy`

Có thể `await import('./X')` trong `useEffect` khi click, rồi `setState` với component — linh hoạt nhưng verbose; `lazy` + `Suspense` thường gọn hơn cho UI khai báo.

---

## 2. Cách load script trên storefront

- Dùng **`defer`** (hoặc `type="module"` với hành vi tương đương) để không chặn parse HTML.
- Tránh JS lớn **inline** trong Liquid; ưu tiên file trong **`assets/`** để tận dụng CDN/cache Shopify.
- **Preload** script chỉ khi thật sự cần tương tác ngay LCP — preload sai dễ tranh băng thông với resource quan trọng hơn.

---

## 3. Ranh giới Liquid và React

- **Liquid cho tĩnh / SEO / LCP**: heading, đoạn mô tả, hero ảnh có thể render sẵn HTML; React bổ sung tương tác (lọc, carousel, state).
- **JSON gọn**: `<script type="application/json">` chỉ chứa field UI cần; tránh serialize object product đầy đủ không dùng hết.
- **Ít mount point hợp lý**: nhiều root nhỏ rải rác có thể tăng chi phí nếu sau này hydrate/mount nhiều lần; cân bằng theo UX.

---

## 4. CSS

- **Prefix / scope class** (ví dụ Tailwind `prefix(tw)`) để giảm đụng class utility của theme Dawn/OS 2.0.
- **Tránh CLS**: ảnh và khung layout nên có kích thước hoặc `aspect-ratio` trước khi React render xong.
- Tách CSS critical vs phần còn lại nếu section nằm above-the-fold (tuỳ độ phức tạp theme).

---

## 5. Hình ảnh và media

- Dùng filter Liquid **`image_url`** với width phù hợp (ví dụ 400 / 800 / 1200), không dùng ảnh full quá lớn cho thumbnail.
- `loading="lazy"` cho ảnh dưới fold; ưu tiên định dạng hiệu quả (WebP qua CDN Shopify khi phù hợp).

---

## 6. Dữ liệu và mạng

- Nếu Liquid đã đủ dữ liệu, **hạn chế fetch thêm** trong React (giảm waterfall và áp lực rate limit).
- Khi bắt buộc dùng Storefront API: cache ngắn phía client, debounce, chỉ gọi theo hành động user.

---

## 7. Đo lường

- Theo dõi **Web Vitals** (LCP, INP, CLS) trên theme thật và trong editor khi cần.
- **Lighthouse** / CI định kỳ cho template có section React.
- So sánh **tải lần đầu** và **điều hướng nội bộ** (một số theme giảm full reload).

---

## 8. Kiến trúc khi mở rộng

- **Theme app extension / app block**: tách phần gắn app, versioning khác repo theme.
- **Headless (Hydrogen, v.v.)**: khi gần như toàn SPA — mô hình triển khai và tối ưu khác hẳn “nhúng nhỏ trong theme”.

---

## 9. Vận hành và DX

- **Một pipeline build** rõ ràng; tên file cố định (`react-app.js`) hoặc **hash + snippet** inject URL để tránh cache trình duyệt sau deploy.
- **Tắt section** trong theme editor khi A/B hoặc debug hiệu năng.

---

## Tóm tắt ưu tiên

1. Bundle nhỏ, một React, production build.  
2. `defer`, ít inline, JSON nhỏ.  
3. Liquid lo phần tĩnh/SEO; React lo tương tác.  
4. Ảnh đúng kích thước, giảm CLS.  
5. Đo LCP/INP thực tế và lặp lại sau mỗi thay đổi lớn.

---

*Bản tiếng Anh: [SHOPIFY-REACT-OPTIMIZATION.en.md](./SHOPIFY-REACT-OPTIMIZATION.en.md)*
