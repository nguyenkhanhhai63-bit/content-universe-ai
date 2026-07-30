# Content Universe V8 – Siêu Di Động

Phiên bản V8 là bản clean, không dùng Supabase và không còn file đăng nhập cũ.

## Tính năng mới

- AI Studio tạo 1, 3 hoặc 5 phiên bản.
- AI Chat có hội thoại và giữ ngữ cảnh gần nhất.
- Rich Text Editor có Bold, Italic, Underline và Highlight.
- AI Review chấm Hook, Drama, Twist, Giữ chân, Tự nhiên và Điểm tổng.
- Hook Library có tỷ lệ giữ chân dự đoán.
- Formula Library, Script Library và Analytics.
- Dark Mode.
- Import/Export JSON.
- Dữ liệu lưu bằng localStorage.
- Gemini tự chuyển model dự phòng khi model chính không còn khả dụng.

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

Không có:

- `lib`
- `supabase`
- `app/login`

## Biến môi trường Vercel

```env
GEMINI_API_KEY=API_KEY_MOI_CUA_BAN
GEMINI_MODEL=gemini-3.5-flash-lite
```

Không đưa API key lên GitHub.
