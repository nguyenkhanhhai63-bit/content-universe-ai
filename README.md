# Content Universe V9 – Siêu Di Động

V9 tập trung vào khả năng đọc và làm việc lâu dài trên màn hình lớn.

## Nâng cấp chính

- Font toàn bộ giao diện lớn hơn.
- Editor mặc định 18px, line-height 1.9.
- AI Chat 16px, khoảng cách dòng rộng.
- Menu, nút, card và input lớn hơn.
- Giao diện tự mở rộng tốt hơn trên màn hình 2K/4K.
- Có 4 mức kích thước: Nhỏ, Vừa, Lớn, Siêu lớn.
- Có 3 màu chủ đạo: Gold, Ocean, Purple.
- Dark Mode.
- Giữ nguyên AI Studio, AI Chat, AI Review, Hook, Công thức, Kịch bản và Analytics.
- Không dùng Supabase.
- Dữ liệu lưu bằng localStorage.

## Cấu trúc

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
