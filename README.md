# Content Universe V10 – Siêu Di Động

V10 chuyển giao diện từ dashboard nhỏ sang AI Content OS dùng tốt trên màn hình lớn.

## Nâng cấp chính

- Nội dung sử dụng gần như toàn bộ chiều ngang màn hình.
- Hero thấp hơn để nhìn thấy dashboard ngay khi mở.
- Sidebar rộng, chữ đậm và dễ nhìn hơn.
- Tiêu đề trang lớn hơn.
- Rich Editor 20px, line-height 1.95.
- AI Chat 18px.
- Hiệu ứng hover, transition và card nổi nhẹ.
- Dark Mode xanh đen dịu mắt.
- Thêm Content Planner theo tuần.
- Thêm Prompt Lab để thử prompt trực tiếp.
- Giữ AI Studio, AI Chat, AI Review, Hook Library, Formula Library, Script Library và Analytics.
- Không dùng Supabase.
- Dữ liệu lưu bằng localStorage.

## Cấu trúc sạch

```text
app/
  api/ai/route.ts
  globals.css
  layout.tsx
  page.tsx
package.json
next.config.ts
tsconfig.json
README.md
```

## Vercel Environment Variables

```env
GEMINI_API_KEY=API_KEY_CUA_BAN
GEMINI_MODEL=gemini-3.5-flash-lite
```
