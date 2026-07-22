# DST Group Website

Website doanh nghiệp đa trang cho DST Group, giữ nhận diện vàng cam và xanh xám đậm từ logo gốc. Dự án dùng React 19, Vinext cho ứng dụng/Worker và Vite để xuất bản GitHub Pages.

## Yêu cầu môi trường

- Node.js 22 trở lên
- npm 10 trở lên

## Cài đặt và chạy local

```bash
npm install
npm run dev
```

Mở URL do Vinext in ra trong terminal. Bản GitHub Pages có thể xem riêng bằng `npm run build:github-pages` rồi phục vụ thư mục `outputs/gh-pages-dist` với một static server.

## Kiểm tra và build

```bash
npm run lint
npm run typecheck
npm run build
npm run build:github-pages
npm test
```

- `npm run build`: kiểm tra ứng dụng Vinext/Worker.
- `npm run build:github-pages`: tạo static routes, `404.html` fallback, `sitemap.xml`, `robots.txt` và `.nojekyll` trong `outputs/gh-pages-dist`.
- `npm test`: kiểm tra type, build, các route công khai, SEO cơ bản, fallback GitHub Pages và việc không để AI key trong frontend.

## Cấu hình AI Chat

AI Chat không lưu API key trong trình duyệt. Widget gửi yêu cầu tới một proxy backend/Cloudflare Worker, sau đó tự chuyển sang tư vấn dựa trên dữ liệu dịch vụ nếu API không khả dụng.

- Vinext: cấu hình `OPENAI_API_KEY` hoặc `GEMINI_API_KEY` trong biến môi trường của Worker, không commit `.env`.
- GitHub Pages: đặt URL proxy trong `gh-pages-static/index.html` tại `window.__DST_CHAT_CONFIG__.apiUrl`.
- Worker AI độc lập: xem `ai-chat-worker/src/index.ts`; origin production được giới hạn tới `https://theluc205.github.io` và localhost cho phát triển.

## Cấu hình form

Form có validate họ tên, số điện thoại Việt Nam, email, độ dài nội dung, consent, honeypot và giới hạn gửi lại 30 giây. Cấu hình endpoint backend tại:

```html
window.__DST_FORM_CONFIG__ = {
  endpoint: "https://your-secure-backend.example.com/contact"
};
```

Không đặt token, secret hoặc URL webhook riêng tư trong repository. Khi endpoint chưa có, giao diện hiển thị lỗi rõ ràng và hướng người dùng sang Zalo/điện thoại thay vì báo gửi thành công giả.

## Deploy GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` chạy khi push lên `main`:

1. `npm ci`
2. lint và TypeScript check
3. `npm run build:github-pages`
4. upload `outputs/gh-pages-dist`
5. deploy bằng GitHub Pages Actions chính thức

Trong repository settings, chọn **Pages > Source > GitHub Actions**. URL dự kiến là:

`https://theluc205.github.io/websiteDST-ai-chat/`

Vite dùng đúng base path `/websiteDST-ai-chat/`. Mỗi route đã có static HTML; các route không tồn tại quay về SPA qua `404.html`, nên refresh trực tiếp tại các URL như `/websiteDST-ai-chat/dich-vu/marketing` vẫn hoạt động.

## Dữ liệu quản trị cần xác nhận

Các nội dung mẫu tập trung trong `data/`:

- `data/company.ts`: thông tin pháp lý, địa chỉ, giờ làm việc, số liệu, khách hàng và testimonial.
- `data/services.ts`: phạm vi dịch vụ, hạng mục, FAQ, ảnh minh chứng nếu thực sự có.
- `data/projects.ts`: khách hàng, số liệu kết quả, case study và ảnh dự án.
- `data/articles.ts`: bài viết khởi tạo có thể thay bằng CMS/API.
- `data/careers.ts`: vị trí tuyển dụng và thông tin nhân sự.

Mọi dữ liệu chưa được DST Group xác nhận được gắn `TODO: Cập nhật thông tin chính thức của DST Group`. Không thay bằng số liệu, thông tin pháp lý hoặc ảnh dự án chưa được phê duyệt.
